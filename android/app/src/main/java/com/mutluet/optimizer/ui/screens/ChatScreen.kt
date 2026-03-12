package com.mutluet.optimizer.ui.screens

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.core.RepeatMode
import androidx.compose.animation.core.animateFloat
import androidx.compose.animation.core.infiniteRepeatable
import androidx.compose.animation.core.rememberInfiniteTransition
import androidx.compose.animation.core.tween
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.imePadding
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.layout.widthIn
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.lazy.rememberLazyListState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardActions
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Send
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.FilterChip
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.alpha
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.mutluet.optimizer.agent.AgentOrchestrator
import com.mutluet.optimizer.data.remote.models.AgentEvent
import com.mutluet.optimizer.data.remote.models.PendingApproval
import com.mutluet.optimizer.ui.components.ApprovalDialog
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.channels.Channel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

// ─── Data Classes ─────────────────────────────────────────────────────────────

data class ChatMessage(
    val id: String = java.util.UUID.randomUUID().toString(),
    val role: MessageRole,
    val text: String,
    val toolName: String? = null,
    val isStreaming: Boolean = false
)

enum class MessageRole { USER, ASSISTANT, TOOL_CALL, TOOL_RESULT, ERROR }

// ─── ViewModel ────────────────────────────────────────────────────────────────

@HiltViewModel
class ChatViewModel @Inject constructor(
    private val orchestrator: AgentOrchestrator
) : ViewModel() {

    data class UiState(
        val messages: List<ChatMessage> = emptyList(),
        val isProcessing: Boolean = false,
        val pendingApproval: PendingApproval? = null
    )

    private val _uiState = MutableStateFlow(UiState())
    val uiState: StateFlow<UiState> = _uiState.asStateFlow()

    // Channel to pass approval results back to the agent
    private val approvalChannel = Channel<Boolean>(Channel.UNLIMITED)

    init {
        orchestrator.approvalCallback = { approval ->
            _uiState.value = _uiState.value.copy(pendingApproval = approval)
            approvalChannel.receive()
        }
    }

    fun sendMessage(userInput: String) {
        if (userInput.isBlank() || _uiState.value.isProcessing) return

        val userMsg = ChatMessage(role = MessageRole.USER, text = userInput)
        val streamingMsg = ChatMessage(
            role = MessageRole.ASSISTANT,
            text = "",
            isStreaming = true
        )

        _uiState.value = _uiState.value.copy(
            messages = _uiState.value.messages + userMsg + streamingMsg,
            isProcessing = true
        )

        viewModelScope.launch {
            val streamingId = streamingMsg.id
            val textAccumulator = StringBuilder()

            orchestrator.processMessage(userInput).collect { event ->
                when (event) {
                    is AgentEvent.Thinking -> { /* already showing spinner */ }

                    is AgentEvent.TextDelta -> {
                        textAccumulator.append(event.text)
                        updateMessage(streamingId) { copy(text = textAccumulator.toString()) }
                    }

                    is AgentEvent.ToolCalling -> {
                        val toolMsg = ChatMessage(
                            role = MessageRole.TOOL_CALL,
                            text = "Araç kullanılıyor: ${event.toolName}",
                            toolName = event.toolName
                        )
                        _uiState.value = _uiState.value.copy(
                            messages = _uiState.value.messages + toolMsg
                        )
                    }

                    is AgentEvent.ToolResult -> {
                        val resultMsg = ChatMessage(
                            role = MessageRole.TOOL_RESULT,
                            text = "Sonuç alındı: ${event.toolName}",
                            toolName = event.toolName
                        )
                        _uiState.value = _uiState.value.copy(
                            messages = _uiState.value.messages + resultMsg
                        )
                    }

                    is AgentEvent.Complete -> {
                        updateMessage(streamingId) {
                            copy(
                                text = if (event.fullText.isNotBlank()) event.fullText else text,
                                isStreaming = false
                            )
                        }
                        _uiState.value = _uiState.value.copy(isProcessing = false)
                    }

                    is AgentEvent.Error -> {
                        val errMsg = ChatMessage(role = MessageRole.ERROR, text = event.message)
                        _uiState.value = _uiState.value.copy(
                            messages = _uiState.value.messages
                                .map { if (it.id == streamingId) it.copy(isStreaming = false) else it }
                                + errMsg,
                            isProcessing = false
                        )
                    }
                }
            }
        }
    }

    fun approveAction(approved: Boolean) {
        _uiState.value = _uiState.value.copy(pendingApproval = null)
        viewModelScope.launch { approvalChannel.send(approved) }
    }

    private fun updateMessage(id: String, update: ChatMessage.() -> ChatMessage) {
        _uiState.value = _uiState.value.copy(
            messages = _uiState.value.messages.map { if (it.id == id) it.update() else it }
        )
    }
}

// ─── Quick Actions ─────────────────────────────────────────────────────────────

private val quickActions = listOf(
    "Telefonu optimize et",
    "Batarya tüketen uygulamaları listele",
    "RAM temizle",
    "Fotoğrafları organize et",
    "Depolama alanını analiz et",
    "Geliştirme ortamı kur"
)

// ─── Screen ───────────────────────────────────────────────────────────────────

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ChatScreen(
    initialMessage: String = "",
    viewModel: ChatViewModel = hiltViewModel()
) {
    val uiState by viewModel.uiState.collectAsStateWithLifecycle()
    val listState = rememberLazyListState()
    var inputText by remember { mutableStateOf("") }

    // Send initial message if provided
    LaunchedEffect(initialMessage) {
        if (initialMessage.isNotBlank()) {
            viewModel.sendMessage(initialMessage)
        }
    }

    // Auto-scroll to bottom
    LaunchedEffect(uiState.messages.size) {
        if (uiState.messages.isNotEmpty()) {
            listState.animateScrollToItem(uiState.messages.size - 1)
        }
    }

    // Approval Dialog
    uiState.pendingApproval?.let { approval ->
        ApprovalDialog(
            approval = approval,
            onApprove = { viewModel.approveAction(true) },
            onDeny = { viewModel.approveAction(false) }
        )
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("AI Asistan") },
            )
        }
    ) { padding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .imePadding()
        ) {
            // Messages
            LazyColumn(
                modifier = Modifier.weight(1f),
                state = listState,
                contentPadding = PaddingValues(16.dp),
                verticalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                // Quick actions when empty
                if (uiState.messages.isEmpty()) {
                    item {
                        WelcomeSection(onQuickAction = { viewModel.sendMessage(it) })
                    }
                }

                items(uiState.messages, key = { it.id }) { message ->
                    MessageBubble(message = message)
                }
            }

            // Input
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 16.dp, vertical = 8.dp),
                verticalAlignment = Alignment.Bottom,
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                OutlinedTextField(
                    value = inputText,
                    onValueChange = { inputText = it },
                    placeholder = { Text("Ne yapmamı istersiniz?") },
                    modifier = Modifier.weight(1f),
                    maxLines = 4,
                    keyboardOptions = KeyboardOptions(imeAction = ImeAction.Send),
                    keyboardActions = KeyboardActions(onSend = {
                        viewModel.sendMessage(inputText)
                        inputText = ""
                    }),
                    enabled = !uiState.isProcessing,
                    shape = RoundedCornerShape(24.dp)
                )
                IconButton(
                    onClick = {
                        viewModel.sendMessage(inputText)
                        inputText = ""
                    },
                    enabled = inputText.isNotBlank() && !uiState.isProcessing,
                    modifier = Modifier
                        .size(48.dp)
                        .background(
                            color = if (inputText.isNotBlank() && !uiState.isProcessing)
                                MaterialTheme.colorScheme.primary
                            else MaterialTheme.colorScheme.surfaceVariant,
                            shape = CircleShape
                        )
                ) {
                    if (uiState.isProcessing) {
                        CircularProgressIndicator(
                            modifier = Modifier.size(20.dp),
                            strokeWidth = 2.dp,
                            color = MaterialTheme.colorScheme.onSurface
                        )
                    } else {
                        Icon(
                            Icons.Default.Send,
                            contentDescription = "Gönder",
                            tint = if (inputText.isNotBlank())
                                MaterialTheme.colorScheme.onPrimary
                            else MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    }
                }
            }
        }
    }
}

@Composable
private fun WelcomeSection(onQuickAction: (String) -> Unit) {
    Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
        Text(
            "Merhaba! Size nasıl yardımcı olabilirim?",
            style = MaterialTheme.typography.titleMedium
        )
        Text(
            "Doğal dille telefonunuzu yönetin:",
            style = MaterialTheme.typography.bodyMedium,
            color = MaterialTheme.colorScheme.onSurfaceVariant
        )
        LazyRow(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            items(quickActions) { action ->
                FilterChip(
                    selected = false,
                    onClick = { onQuickAction(action) },
                    label = { Text(action) }
                )
            }
        }
        Spacer(Modifier.height(8.dp))
    }
}

@Composable
private fun MessageBubble(message: ChatMessage) {
    when (message.role) {
        MessageRole.USER -> UserBubble(message.text)
        MessageRole.ASSISTANT -> AssistantBubble(message.text, message.isStreaming)
        MessageRole.TOOL_CALL -> ToolBubble(message.text, isCall = true)
        MessageRole.TOOL_RESULT -> ToolBubble(message.text, isCall = false)
        MessageRole.ERROR -> ErrorBubble(message.text)
    }
}

@Composable
private fun UserBubble(text: String) {
    Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.End) {
        Surface(
            shape = RoundedCornerShape(18.dp, 4.dp, 18.dp, 18.dp),
            color = MaterialTheme.colorScheme.primary,
            modifier = Modifier.widthIn(max = 280.dp)
        ) {
            Text(
                text = text,
                modifier = Modifier.padding(12.dp, 8.dp),
                color = MaterialTheme.colorScheme.onPrimary,
                style = MaterialTheme.typography.bodyMedium
            )
        }
    }
}

@Composable
private fun AssistantBubble(text: String, isStreaming: Boolean) {
    Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.Start,
        verticalAlignment = Alignment.Bottom
    ) {
        // AI avatar dot
        Box(
            modifier = Modifier
                .size(28.dp)
                .background(MaterialTheme.colorScheme.secondary, CircleShape),
            contentAlignment = Alignment.Center
        ) {
            Text("AI", style = MaterialTheme.typography.labelSmall,
                color = MaterialTheme.colorScheme.onSecondary)
        }
        Spacer(Modifier.width(8.dp))
        Surface(
            shape = RoundedCornerShape(4.dp, 18.dp, 18.dp, 18.dp),
            color = MaterialTheme.colorScheme.surfaceVariant,
            modifier = Modifier.widthIn(max = 280.dp)
        ) {
            Column(modifier = Modifier.padding(12.dp, 8.dp)) {
                if (text.isBlank() && isStreaming) {
                    ThinkingDots()
                } else {
                    Text(
                        text = text,
                        style = MaterialTheme.typography.bodyMedium
                    )
                    if (isStreaming) {
                        StreamingCursor()
                    }
                }
            }
        }
    }
}

@Composable
private fun ToolBubble(text: String, isCall: Boolean) {
    Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.Center) {
        Card(
            colors = CardDefaults.cardColors(
                containerColor = if (isCall)
                    MaterialTheme.colorScheme.secondaryContainer
                else
                    MaterialTheme.colorScheme.tertiaryContainer
            ),
            shape = RoundedCornerShape(8.dp)
        ) {
            Text(
                text = text,
                modifier = Modifier.padding(8.dp, 4.dp),
                style = MaterialTheme.typography.labelSmall,
                color = if (isCall)
                    MaterialTheme.colorScheme.onSecondaryContainer
                else
                    MaterialTheme.colorScheme.onTertiaryContainer
            )
        }
    }
}

@Composable
private fun ErrorBubble(text: String) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.errorContainer)
    ) {
        Text(
            text = text,
            modifier = Modifier.padding(12.dp, 8.dp),
            style = MaterialTheme.typography.bodySmall,
            color = MaterialTheme.colorScheme.onErrorContainer
        )
    }
}

@Composable
private fun ThinkingDots() {
    val infiniteTransition = rememberInfiniteTransition(label = "thinking")
    Row(horizontalArrangement = Arrangement.spacedBy(4.dp)) {
        repeat(3) { i ->
            val alpha by infiniteTransition.animateFloat(
                initialValue = 0.3f,
                targetValue = 1f,
                animationSpec = infiniteRepeatable(
                    animation = tween(600, delayMillis = i * 200),
                    repeatMode = RepeatMode.Reverse
                ),
                label = "dot_$i"
            )
            Box(
                modifier = Modifier
                    .size(8.dp)
                    .alpha(alpha)
                    .background(MaterialTheme.colorScheme.onSurfaceVariant, CircleShape)
            )
        }
    }
}

@Composable
private fun StreamingCursor() {
    val infiniteTransition = rememberInfiniteTransition(label = "cursor")
    val alpha by infiniteTransition.animateFloat(
        initialValue = 0f,
        targetValue = 1f,
        animationSpec = infiniteRepeatable(
            animation = tween(500),
            repeatMode = RepeatMode.Reverse
        ),
        label = "cursor_alpha"
    )
    Text(
        text = "▌",
        modifier = Modifier.alpha(alpha),
        color = MaterialTheme.colorScheme.primary,
        style = MaterialTheme.typography.bodyMedium
    )
}

@Composable
private fun <T> StateFlow<T>.collectAsStateWithLifecycle(): androidx.compose.runtime.State<T> {
    return androidx.lifecycle.compose.collectAsStateWithLifecycle()
}
