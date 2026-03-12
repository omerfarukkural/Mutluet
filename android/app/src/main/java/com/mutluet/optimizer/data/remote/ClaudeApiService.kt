package com.mutluet.optimizer.data.remote

import com.launchdarkly.eventsource.EventHandler
import com.launchdarkly.eventsource.MessageEvent
import com.launchdarkly.eventsource.background.BackgroundEventSource
import com.mutluet.optimizer.data.local.PreferencesDataStore
import com.mutluet.optimizer.data.remote.models.AgentEvent
import com.mutluet.optimizer.data.remote.models.MessageRequest
import com.mutluet.optimizer.data.remote.models.MessageResponse
import com.mutluet.optimizer.data.remote.models.StreamEvent
import kotlinx.coroutines.channels.awaitClose
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.callbackFlow
import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.Json
import kotlinx.serialization.json.jsonObject
import kotlinx.serialization.json.jsonPrimitive
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody
import java.util.concurrent.TimeUnit
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class ClaudeApiService @Inject constructor(
    private val preferencesDataStore: PreferencesDataStore
) {
    companion object {
        private const val BASE_URL = "https://api.anthropic.com/v1/messages"
        private const val ANTHROPIC_VERSION = "2023-06-01"
    }

    private val json = Json {
        ignoreUnknownKeys = true
        encodeDefaults = true
        coerceInputValues = true
    }

    private val httpClient = OkHttpClient.Builder()
        .connectTimeout(30, TimeUnit.SECONDS)
        .readTimeout(120, TimeUnit.SECONDS)
        .writeTimeout(30, TimeUnit.SECONDS)
        .build()

    /**
     * Non-streaming call. Returns a full MessageResponse.
     */
    suspend fun sendMessage(request: MessageRequest): Result<MessageResponse> {
        val apiKey = preferencesDataStore.getApiKey()
            ?: return Result.failure(IllegalStateException("API anahtarı ayarlanmamış"))

        return try {
            val body = json.encodeToString(request).toRequestBody("application/json".toMediaType())
            val httpRequest = Request.Builder()
                .url(BASE_URL)
                .post(body)
                .header("x-api-key", apiKey)
                .header("anthropic-version", ANTHROPIC_VERSION)
                .header("content-type", "application/json")
                .build()

            val response = httpClient.newCall(httpRequest).execute()
            val responseBody = response.body?.string()
                ?: return Result.failure(IllegalStateException("Boş yanıt"))

            if (!response.isSuccessful) {
                return Result.failure(ApiException(response.code, responseBody))
            }

            val parsed = json.decodeFromString<MessageResponse>(responseBody)
            Result.success(parsed)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    /**
     * Streaming SSE call. Emits AgentEvent objects as the response streams in.
     */
    fun streamMessage(request: MessageRequest): Flow<AgentEvent> = callbackFlow {
        val apiKey = preferencesDataStore.getApiKey()
        if (apiKey == null) {
            trySend(AgentEvent.Error("API anahtarı ayarlanmamış"))
            close()
            return@callbackFlow
        }

        val streamRequest = request.copy(stream = true)
        val bodyString = json.encodeToString(streamRequest)
        val body = bodyString.toRequestBody("application/json".toMediaType())

        val httpRequest = Request.Builder()
            .url(BASE_URL)
            .post(body)
            .header("x-api-key", apiKey)
            .header("anthropic-version", ANTHROPIC_VERSION)
            .header("content-type", "application/json")
            .header("accept", "text/event-stream")
            .build()

        val textBuffer = StringBuilder()
        // Map from block index to (toolId, toolName, accumulated json string)
        val toolUseBuffer = mutableMapOf<Int, Triple<String, String, StringBuilder>>()

        val eventHandler = object : EventHandler {
            override fun onOpen() {
                trySend(AgentEvent.Thinking)
            }

            override fun onClosed() {
                trySend(AgentEvent.Complete(textBuffer.toString()))
                close()
            }

            override fun onMessage(event: String, messageEvent: MessageEvent) {
                val data = messageEvent.data
                if (data == "[DONE]" || data.isBlank()) return

                try {
                    val parsed = json.decodeFromString<StreamEvent>(data)
                    handleStreamEvent(parsed, textBuffer, toolUseBuffer)
                } catch (_: Exception) {
                    // Ignore malformed SSE events
                }
            }

            override fun onComment(comment: String) {}

            override fun onError(t: Throwable) {
                trySend(AgentEvent.Error("Streaming hatası: ${t.message}", t))
                close(t)
            }

            private fun handleStreamEvent(
                event: StreamEvent,
                textBuf: StringBuilder,
                toolBuf: MutableMap<Int, Triple<String, String, StringBuilder>>
            ) {
                when (event.type) {
                    "content_block_start" -> {
                        val block = event.contentBlock
                        if (block != null) {
                            val blockObj = block.jsonObject
                            if (blockObj["type"]?.jsonPrimitive?.content == "tool_use") {
                                val toolId = blockObj["id"]?.jsonPrimitive?.content ?: ""
                                val toolName = blockObj["name"]?.jsonPrimitive?.content ?: ""
                                val idx = event.index ?: 0
                                toolBuf[idx] = Triple(toolId, toolName, StringBuilder())
                                trySend(AgentEvent.ToolCalling(toolName, toolId))
                            }
                        }
                    }

                    "content_block_delta" -> {
                        val delta = event.delta ?: return
                        val idx = event.index ?: 0
                        when (delta.type) {
                            "text_delta" -> {
                                val text = delta.text ?: return
                                textBuf.append(text)
                                trySend(AgentEvent.TextDelta(text))
                            }
                            "input_json_delta" -> {
                                val partial = delta.partialJson ?: return
                                toolBuf[idx]?.third?.append(partial)
                            }
                        }
                    }

                    "content_block_stop" -> {
                        val idx = event.index ?: return
                        toolBuf[idx]?.let { (_, toolName, inputJson) ->
                            trySend(AgentEvent.ToolResult(toolName, inputJson.toString()))
                        }
                    }

                    "message_stop" -> {
                        trySend(AgentEvent.Complete(textBuf.toString()))
                        close()
                    }
                }
            }
        }

        val eventSource = BackgroundEventSource.Builder(eventHandler,
            com.launchdarkly.eventsource.ConnectStrategy.http(
                java.net.URI(BASE_URL),
                httpClient
            ).header("x-api-key", apiKey)
                .header("anthropic-version", ANTHROPIC_VERSION)
                .header("content-type", "application/json")
                .header("accept", "text/event-stream")
        ).build()

        // Since LaunchDarkly EventSource is GET-based, fall back to manual OkHttp SSE
        // for POST streaming. Close the LD source and use the manual approach.
        eventSource.close()

        val call = httpClient.newCall(httpRequest)
        try {
            call.execute().use { response ->
                if (!response.isSuccessful) {
                    val errorBody = response.body?.string() ?: "Unknown error"
                    trySend(AgentEvent.Error("API Hatası ${response.code}: $errorBody"))
                    close()
                    return@callbackFlow
                }
                val source = response.body?.source() ?: run {
                    trySend(AgentEvent.Error("Boş yanıt gövdesi"))
                    close()
                    return@callbackFlow
                }

                trySend(AgentEvent.Thinking)
                val textBuf = StringBuilder()
                val toolBuf = mutableMapOf<Int, Triple<String, String, StringBuilder>>()

                while (!source.exhausted()) {
                    val line = source.readUtf8Line() ?: break
                    if (line.startsWith("data: ")) {
                        val data = line.removePrefix("data: ").trim()
                        if (data == "[DONE]") break
                        if (data.isBlank()) continue
                        try {
                            val evt = json.decodeFromString<StreamEvent>(data)
                            processEvent(evt, textBuf, toolBuf)
                        } catch (_: Exception) {}
                    }
                }
                trySend(AgentEvent.Complete(textBuf.toString()))
                close()
            }
        } catch (e: Exception) {
            trySend(AgentEvent.Error("Bağlantı hatası: ${e.message}", e))
            close(e)
        }

        awaitClose { call.cancel() }
    }

    private fun processEvent(
        event: StreamEvent,
        textBuf: StringBuilder,
        toolBuf: MutableMap<Int, Triple<String, String, StringBuilder>>
    ): AgentEvent? {
        return when (event.type) {
            "content_block_start" -> {
                val block = event.contentBlock ?: return null
                val blockObj = runCatching { block.jsonObject }.getOrNull() ?: return null
                if (blockObj["type"]?.jsonPrimitive?.content == "tool_use") {
                    val toolId = blockObj["id"]?.jsonPrimitive?.content ?: ""
                    val toolName = blockObj["name"]?.jsonPrimitive?.content ?: ""
                    val idx = event.index ?: 0
                    toolBuf[idx] = Triple(toolId, toolName, StringBuilder())
                    AgentEvent.ToolCalling(toolName, toolId)
                } else null
            }
            "content_block_delta" -> {
                val delta = event.delta ?: return null
                val idx = event.index ?: 0
                when (delta.type) {
                    "text_delta" -> {
                        val text = delta.text ?: return null
                        textBuf.append(text)
                        AgentEvent.TextDelta(text)
                    }
                    "input_json_delta" -> {
                        val partial = delta.partialJson ?: return null
                        toolBuf[idx]?.third?.append(partial)
                        null
                    }
                    else -> null
                }
            }
            else -> null
        }
    }

    /**
     * Simple test ping to validate an API key.
     */
    suspend fun testApiKey(apiKey: String): Result<String> {
        return try {
            val testBody = """
                {"model":"claude-haiku-4-5-20251001","max_tokens":10,"messages":[{"role":"user","content":"Hi"}]}
            """.trimIndent().toRequestBody("application/json".toMediaType())

            val req = Request.Builder()
                .url(BASE_URL)
                .post(testBody)
                .header("x-api-key", apiKey)
                .header("anthropic-version", ANTHROPIC_VERSION)
                .build()

            val resp = httpClient.newCall(req).execute()
            if (resp.isSuccessful) Result.success("Geçerli anahtar")
            else Result.failure(ApiException(resp.code, resp.body?.string() ?: ""))
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
}

class ApiException(val code: Int, val body: String) : Exception("HTTP $code: $body")
