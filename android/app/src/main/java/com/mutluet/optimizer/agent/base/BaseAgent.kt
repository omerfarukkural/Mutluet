package com.mutluet.optimizer.agent.base

import android.content.Context
import com.mutluet.optimizer.data.local.PreferencesDataStore
import com.mutluet.optimizer.data.remote.ClaudeApiService
import com.mutluet.optimizer.data.remote.models.AgentEvent
import com.mutluet.optimizer.data.remote.models.ClaudeModels
import com.mutluet.optimizer.data.remote.models.MessageRequest
import com.mutluet.optimizer.data.remote.models.MessageResponse
import com.mutluet.optimizer.data.remote.models.PendingApproval
import com.mutluet.optimizer.data.remote.models.RawMessage
import com.mutluet.optimizer.data.remote.models.TextBlock
import com.mutluet.optimizer.data.remote.models.ToolDefinition
import com.mutluet.optimizer.data.remote.models.ToolResultBlock
import com.mutluet.optimizer.data.remote.models.ToolUseBlock
import dagger.hilt.android.qualifiers.ApplicationContext
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.flow
import kotlinx.serialization.json.Json
import kotlinx.serialization.json.JsonArray
import kotlinx.serialization.json.JsonElement
import kotlinx.serialization.json.JsonObject
import kotlinx.serialization.json.JsonPrimitive
import kotlinx.serialization.json.buildJsonObject
import kotlinx.serialization.json.jsonArray
import kotlinx.serialization.json.jsonObject
import kotlinx.serialization.json.jsonPrimitive
import kotlinx.serialization.json.put

/**
 * Base class for all AI agents.
 * Implements the agentic loop: send → tool_use → execute → send → … → end_turn
 */
abstract class BaseAgent(
    protected val claudeApiService: ClaudeApiService,
    protected val preferencesDataStore: PreferencesDataStore,
    @ApplicationContext protected val context: Context
) {
    protected val json = Json {
        ignoreUnknownKeys = true
        encodeDefaults = true
        coerceInputValues = true
    }

    /** Override to provide the system prompt for this agent. */
    abstract val systemPrompt: String

    /** Override to return the tool definitions this agent can use. */
    abstract fun getTools(): List<ToolDefinition>

    /** Override to execute a specific tool by name. Returns JSON-serializable result string. */
    abstract suspend fun executeTool(toolName: String, toolInput: JsonElement): String

    /** Callback for actions that require user approval before execution. */
    var approvalCallback: (suspend (PendingApproval) -> Boolean)? = null

    /**
     * Main agentic loop. Emits AgentEvent objects as the conversation progresses.
     * Handles multi-turn tool use automatically.
     */
    fun run(userMessage: String): Flow<AgentEvent> = flow {
        val model = preferencesDataStore.getModel()
        val messages = mutableListOf<RawMessage>()

        // Initial user message
        messages.add(buildUserTextMessage(userMessage))
        emit(AgentEvent.Thinking)

        var iteration = 0
        val maxIterations = 20  // Safety limit

        while (iteration < maxIterations) {
            iteration++

            val request = MessageRequest(
                model = model,
                maxTokens = 4096,
                messages = messages,
                tools = getTools(),
                system = systemPrompt
            )

            val result = claudeApiService.sendMessage(request)
            if (result.isFailure) {
                emit(AgentEvent.Error(result.exceptionOrNull()?.message ?: "API çağrısı başarısız"))
                return@flow
            }

            val response = result.getOrThrow()

            // Extract text and tool_use blocks from response content
            val textContent = extractText(response.content)
            val toolUses = extractToolUses(response.content)

            // Emit any text that arrived
            if (textContent.isNotBlank()) {
                emit(AgentEvent.TextDelta(textContent))
            }

            // If no tool uses and stop_reason is end_turn, we're done
            if (toolUses.isEmpty() || response.stopReason == "end_turn") {
                emit(AgentEvent.Complete(textContent))
                return@flow
            }

            // Add assistant's response to message history
            messages.add(buildAssistantMessage(response.content))

            // Process each tool use
            val toolResults = mutableListOf<ToolResultBlock>()
            for (toolUse in toolUses) {
                emit(AgentEvent.ToolCalling(toolUse.name, toolUse.id))

                val toolResult = try {
                    executeTool(toolUse.name, toolUse.input)
                } catch (e: Exception) {
                    "Hata: ${e.message}"
                }

                emit(AgentEvent.ToolResult(toolUse.name, toolResult))
                toolResults.add(
                    ToolResultBlock(
                        toolUseId = toolUse.id,
                        content = toolResult,
                        isError = toolResult.startsWith("Hata:")
                    )
                )
            }

            // Add tool results as user message
            messages.add(buildToolResultMessage(toolResults))
        }

        emit(AgentEvent.Error("Maksimum iterasyon sayısına ulaşıldı"))
    }

    // ── Helpers ──────────────────────────────────────────────────────────────

    protected fun buildUserTextMessage(text: String): RawMessage {
        return RawMessage(
            role = "user",
            content = JsonPrimitive(text)
        )
    }

    private fun buildAssistantMessage(content: List<JsonElement>): RawMessage {
        return RawMessage(
            role = "assistant",
            content = JsonArray(content)
        )
    }

    private fun buildToolResultMessage(results: List<ToolResultBlock>): RawMessage {
        val contentArray = JsonArray(results.map { result ->
            buildJsonObject {
                put("type", "tool_result")
                put("tool_use_id", result.toolUseId)
                put("content", result.content)
                put("is_error", result.isError)
            }
        })
        return RawMessage(role = "user", content = contentArray)
    }

    private fun extractText(content: List<JsonElement>): String {
        return content.mapNotNull { elem ->
            runCatching {
                val obj = elem.jsonObject
                if (obj["type"]?.jsonPrimitive?.content == "text") {
                    obj["text"]?.jsonPrimitive?.content
                } else null
            }.getOrNull()
        }.joinToString("\n")
    }

    private fun extractToolUses(content: List<JsonElement>): List<ToolUseBlock> {
        return content.mapNotNull { elem ->
            runCatching {
                val obj = elem.jsonObject
                if (obj["type"]?.jsonPrimitive?.content == "tool_use") {
                    ToolUseBlock(
                        id = obj["id"]?.jsonPrimitive?.content ?: "",
                        name = obj["name"]?.jsonPrimitive?.content ?: "",
                        input = obj["input"] ?: JsonObject(emptyMap())
                    )
                } else null
            }.getOrNull()
        }
    }

    /** Helper to extract a string field from tool input JSON. */
    protected fun JsonElement.getString(key: String): String? =
        runCatching { jsonObject[key]?.jsonPrimitive?.content }.getOrNull()

    /** Helper to extract a long field from tool input JSON. */
    protected fun JsonElement.getLong(key: String): Long? =
        runCatching { jsonObject[key]?.jsonPrimitive?.content?.toLong() }.getOrNull()

    /** Helper to extract a boolean field from tool input JSON. */
    protected fun JsonElement.getBoolean(key: String): Boolean? =
        runCatching { jsonObject[key]?.jsonPrimitive?.content?.toBooleanStrictOrNull() }.getOrNull()

    /** Helper to extract a list of strings from tool input JSON. */
    protected fun JsonElement.getStringList(key: String): List<String> =
        runCatching {
            jsonObject[key]?.jsonArray?.map { it.jsonPrimitive.content } ?: emptyList()
        }.getOrElse { emptyList() }
}
