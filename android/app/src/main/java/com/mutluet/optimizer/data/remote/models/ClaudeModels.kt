package com.mutluet.optimizer.data.remote.models

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable
import kotlinx.serialization.json.JsonElement
import kotlinx.serialization.json.JsonObject

// ─── Tool Definition ──────────────────────────────────────────────────────────

@Serializable
data class ToolDefinition(
    val name: String,
    val description: String,
    @SerialName("input_schema")
    val inputSchema: JsonSchema
)

@Serializable
data class JsonSchema(
    val type: String = "object",
    val properties: JsonObject,
    val required: List<String> = emptyList()
)

// ─── Content Blocks ───────────────────────────────────────────────────────────

@Serializable
data class TextBlock(
    val type: String = "text",
    val text: String
)

@Serializable
data class ToolUseBlock(
    val type: String = "tool_use",
    val id: String,
    val name: String,
    val input: JsonElement
)

@Serializable
data class ToolResultBlock(
    val type: String = "tool_result",
    @SerialName("tool_use_id")
    val toolUseId: String,
    val content: String,
    @SerialName("is_error")
    val isError: Boolean = false
)

// ─── Message ──────────────────────────────────────────────────────────────────

/** Polymorphic-free message representation for building request messages. */
@Serializable
data class RawMessage(
    val role: String,
    val content: JsonElement  // Can be String or List<ContentBlock>
)

// ─── Request ──────────────────────────────────────────────────────────────────

@Serializable
data class MessageRequest(
    val model: String,
    @SerialName("max_tokens")
    val maxTokens: Int = 4096,
    val messages: List<RawMessage>,
    val tools: List<ToolDefinition> = emptyList(),
    val stream: Boolean = false,
    val system: String? = null
)

// ─── Response ─────────────────────────────────────────────────────────────────

@Serializable
data class MessageResponse(
    val id: String,
    val type: String,
    val role: String,
    val content: List<JsonElement>,
    val model: String,
    @SerialName("stop_reason")
    val stopReason: String,
    val usage: TokenUsage
)

@Serializable
data class TokenUsage(
    @SerialName("input_tokens")
    val inputTokens: Int,
    @SerialName("output_tokens")
    val outputTokens: Int
)

// ─── Streaming Events ─────────────────────────────────────────────────────────

@Serializable
data class StreamDelta(
    val type: String,          // "text_delta" | "input_json_delta"
    val text: String? = null,
    @SerialName("partial_json")
    val partialJson: String? = null
)

@Serializable
data class StreamEvent(
    val type: String,
    val index: Int? = null,
    val delta: StreamDelta? = null,
    @SerialName("content_block")
    val contentBlock: JsonElement? = null,
    val message: JsonElement? = null
)

// ─── Agent Events (internal) ──────────────────────────────────────────────────

sealed class AgentEvent {
    data class TextDelta(val text: String) : AgentEvent()
    data class ToolCalling(val toolName: String, val toolId: String) : AgentEvent()
    data class ToolResult(val toolName: String, val result: String) : AgentEvent()
    data class Complete(val fullText: String) : AgentEvent()
    data class Error(val message: String, val cause: Throwable? = null) : AgentEvent()
    object Thinking : AgentEvent()
}

// ─── Pending Approval ─────────────────────────────────────────────────────────

data class PendingApproval(
    val id: String,
    val action: String,
    val description: String,
    val details: Map<String, String> = emptyMap()
)

// ─── Constants ────────────────────────────────────────────────────────────────

object ClaudeModels {
    const val SONNET = "claude-sonnet-4-6"
    const val OPUS = "claude-opus-4-6"
    const val HAIKU = "claude-haiku-4-5-20251001"
}
