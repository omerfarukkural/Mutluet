package com.mutluet.optimizer.ui.screens

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Check
import androidx.compose.material.icons.filled.Error
import androidx.compose.material.icons.filled.Visibility
import androidx.compose.material.icons.filled.VisibilityOff
import androidx.compose.material3.Button
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.DropdownMenuItem
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.ExposedDropdownMenuBox
import androidx.compose.material3.ExposedDropdownMenuDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Scaffold
import androidx.compose.material3.SnackbarHost
import androidx.compose.material3.SnackbarHostState
import androidx.compose.material3.Switch
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.text.input.VisualTransformation
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.mutluet.optimizer.data.local.PreferencesDataStore
import com.mutluet.optimizer.data.remote.ClaudeApiService
import com.mutluet.optimizer.data.remote.models.ClaudeModels
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

// ─── ViewModel ────────────────────────────────────────────────────────────────

@HiltViewModel
class SettingsViewModel @Inject constructor(
    private val prefs: PreferencesDataStore,
    private val claudeApi: ClaudeApiService
) : ViewModel() {

    data class UiState(
        val apiKey: String = "",
        val selectedModel: String = ClaudeModels.SONNET,
        val dailyScanEnabled: Boolean = true,
        val isSaving: Boolean = false,
        val isTesting: Boolean = false,
        val testResult: TestResult? = null,
        val snackbarMessage: String? = null
    )

    enum class TestResult { SUCCESS, FAILURE }

    private val _uiState = MutableStateFlow(UiState())
    val uiState: StateFlow<UiState> = _uiState.asStateFlow()

    init {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(
                apiKey = prefs.getApiKey() ?: "",
                selectedModel = prefs.getModel(),
                dailyScanEnabled = prefs.isDailyScanEnabled()
            )
        }
    }

    fun onApiKeyChange(value: String) {
        _uiState.value = _uiState.value.copy(apiKey = value, testResult = null)
    }

    fun onModelChange(model: String) {
        _uiState.value = _uiState.value.copy(selectedModel = model)
    }

    fun onDailyScanToggle(enabled: Boolean) {
        _uiState.value = _uiState.value.copy(dailyScanEnabled = enabled)
        viewModelScope.launch { prefs.setDailyScanEnabled(enabled) }
    }

    fun saveApiKey() {
        val key = _uiState.value.apiKey.trim()
        if (key.isBlank()) return
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isSaving = true)
            prefs.saveApiKey(key)
            prefs.saveModel(_uiState.value.selectedModel)
            _uiState.value = _uiState.value.copy(
                isSaving = false,
                snackbarMessage = "Ayarlar kaydedildi"
            )
        }
    }

    fun testApiKey() {
        val key = _uiState.value.apiKey.trim()
        if (key.isBlank()) {
            _uiState.value = _uiState.value.copy(snackbarMessage = "Önce API anahtarı girin")
            return
        }
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isTesting = true, testResult = null)
            val result = claudeApi.testApiKey(key)
            _uiState.value = _uiState.value.copy(
                isTesting = false,
                testResult = if (result.isSuccess) TestResult.SUCCESS else TestResult.FAILURE,
                snackbarMessage = if (result.isSuccess) "Anahtar geçerli!" else "Geçersiz anahtar: ${result.exceptionOrNull()?.message}"
            )
        }
    }

    fun clearSnackbar() {
        _uiState.value = _uiState.value.copy(snackbarMessage = null)
    }
}

// ─── Screen ───────────────────────────────────────────────────────────────────

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun SettingsScreen(
    viewModel: SettingsViewModel = hiltViewModel()
) {
    val uiState by viewModel.uiState.collectAsStateWithLifecycle()
    val snackbarHostState = remember { SnackbarHostState() }
    val scope = rememberCoroutineScope()

    LaunchedEffect(uiState.snackbarMessage) {
        uiState.snackbarMessage?.let {
            snackbarHostState.showSnackbar(it)
            viewModel.clearSnackbar()
        }
    }

    Scaffold(
        topBar = { TopAppBar(title = { Text("Ayarlar") }) },
        snackbarHost = { SnackbarHost(snackbarHostState) }
    ) { padding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .padding(horizontal = 16.dp)
                .verticalScroll(rememberScrollState()),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            Spacer(Modifier.height(8.dp))

            // ── API Key Card ──
            Card(
                modifier = Modifier.fillMaxWidth(),
                elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
            ) {
                Column(
                    modifier = Modifier.padding(16.dp),
                    verticalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    Text("Claude API Anahtarı", style = MaterialTheme.typography.titleMedium)
                    Text(
                        "Anthropic platformundan aldığınız API anahtarını girin. " +
                        "Anahtar şifreli olarak cihazınızda saklanır.",
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                    ApiKeyField(
                        value = uiState.apiKey,
                        onValueChange = viewModel::onApiKeyChange,
                        testResult = uiState.testResult
                    )
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        Button(
                            onClick = { viewModel.testApiKey() },
                            enabled = !uiState.isTesting && !uiState.isSaving,
                            modifier = Modifier.weight(1f)
                        ) {
                            if (uiState.isTesting) {
                                CircularProgressIndicator(
                                    modifier = Modifier.size(16.dp),
                                    strokeWidth = 2.dp,
                                    color = MaterialTheme.colorScheme.onPrimary
                                )
                            } else {
                                Text("Test Et")
                            }
                        }
                        Button(
                            onClick = { viewModel.saveApiKey() },
                            enabled = !uiState.isSaving && !uiState.isTesting && uiState.apiKey.isNotBlank(),
                            modifier = Modifier.weight(1f)
                        ) {
                            if (uiState.isSaving) {
                                CircularProgressIndicator(
                                    modifier = Modifier.size(16.dp),
                                    strokeWidth = 2.dp,
                                    color = MaterialTheme.colorScheme.onPrimary
                                )
                            } else {
                                Text("Kaydet")
                            }
                        }
                    }
                }
            }

            // ── Model Card ──
            Card(
                modifier = Modifier.fillMaxWidth(),
                elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
            ) {
                Column(
                    modifier = Modifier.padding(16.dp),
                    verticalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    Text("AI Modeli", style = MaterialTheme.typography.titleMedium)
                    ModelDropdown(
                        selected = uiState.selectedModel,
                        onSelected = viewModel::onModelChange
                    )
                    Text(
                        when (uiState.selectedModel) {
                            ClaudeModels.OPUS -> "En güçlü model. Karmaşık görevler için ideal. Daha yavaş ve pahalı."
                            ClaudeModels.SONNET -> "Hız ve güç dengesi. Günlük kullanım için önerilen."
                            ClaudeModels.HAIKU -> "En hızlı ve ekonomik model. Basit görevler için."
                            else -> ""
                        },
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }
            }

            // ── Scan Card ──
            Card(
                modifier = Modifier.fillMaxWidth(),
                elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
            ) {
                Row(
                    modifier = Modifier.padding(16.dp),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Column(modifier = Modifier.weight(1f)) {
                        Text("Günlük Tarama", style = MaterialTheme.typography.titleMedium)
                        Text(
                            "Her gün şarj olurken arka planda tarama yapar",
                            style = MaterialTheme.typography.bodySmall,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    }
                    Switch(
                        checked = uiState.dailyScanEnabled,
                        onCheckedChange = viewModel::onDailyScanToggle
                    )
                }
            }

            // ── About ──
            Card(
                modifier = Modifier.fillMaxWidth(),
                elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Text("Hakkında", style = MaterialTheme.typography.titleMedium)
                    Spacer(Modifier.height(8.dp))
                    Text("Mutluet AI Optimizer v1.0.0", style = MaterialTheme.typography.bodyMedium)
                    Text(
                        "Claude AI destekli akıllı telefon optimizasyon asistanı.\n" +
                        "API anahtarınız cihazınızda şifreli tutulur, asla dışarı gönderilmez.",
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }
            }

            Spacer(Modifier.height(16.dp))
        }
    }
}

@Composable
private fun ApiKeyField(
    value: String,
    onValueChange: (String) -> Unit,
    testResult: SettingsViewModel.TestResult?
) {
    var showKey by remember { mutableStateOf(false) }

    OutlinedTextField(
        value = value,
        onValueChange = onValueChange,
        label = { Text("API Anahtarı") },
        placeholder = { Text("sk-ant-api03-…") },
        modifier = Modifier.fillMaxWidth(),
        singleLine = true,
        visualTransformation = if (showKey) VisualTransformation.None else PasswordVisualTransformation(),
        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Password),
        trailingIcon = {
            Row(verticalAlignment = Alignment.CenterVertically) {
                AnimatedVisibility(visible = testResult != null) {
                    Icon(
                        imageVector = if (testResult == SettingsViewModel.TestResult.SUCCESS) Icons.Default.Check else Icons.Default.Error,
                        contentDescription = null,
                        tint = if (testResult == SettingsViewModel.TestResult.SUCCESS) Color(0xFF2E7D32) else MaterialTheme.colorScheme.error,
                        modifier = Modifier.size(20.dp)
                    )
                }
                IconButton(onClick = { showKey = !showKey }) {
                    Icon(
                        imageVector = if (showKey) Icons.Default.VisibilityOff else Icons.Default.Visibility,
                        contentDescription = if (showKey) "Gizle" else "Göster"
                    )
                }
            }
        }
    )
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
private fun ModelDropdown(
    selected: String,
    onSelected: (String) -> Unit
) {
    val models = listOf(
        ClaudeModels.SONNET to "Sonnet 4.6 (Önerilen)",
        ClaudeModels.OPUS to "Opus 4.6 (En Güçlü)",
        ClaudeModels.HAIKU to "Haiku 4.5 (En Hızlı)"
    )
    var expanded by remember { mutableStateOf(false) }

    ExposedDropdownMenuBox(
        expanded = expanded,
        onExpandedChange = { expanded = it },
        modifier = Modifier.fillMaxWidth()
    ) {
        OutlinedTextField(
            value = models.firstOrNull { it.first == selected }?.second ?: selected,
            onValueChange = {},
            readOnly = true,
            label = { Text("Model") },
            trailingIcon = { ExposedDropdownMenuDefaults.TrailingIcon(expanded = expanded) },
            modifier = Modifier
                .fillMaxWidth()
                .menuAnchor()
        )
        ExposedDropdownMenu(
            expanded = expanded,
            onDismissRequest = { expanded = false }
        ) {
            models.forEach { (id, label) ->
                DropdownMenuItem(
                    text = { Text(label) },
                    onClick = {
                        onSelected(id)
                        expanded = false
                    }
                )
            }
        }
    }
}

// Extension to use collectAsStateWithLifecycle
@Composable
private fun <T> StateFlow<T>.collectAsStateWithLifecycle(): androidx.compose.runtime.State<T> {
    return androidx.lifecycle.compose.collectAsStateWithLifecycle()
}
