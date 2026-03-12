package com.mutluet.optimizer.ui.screens

import android.Manifest
import android.os.Build
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.Button
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.ElevatedCard
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.LinearProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.mutluet.optimizer.system.FileItem
import com.mutluet.optimizer.system.StorageBreakdown
import com.mutluet.optimizer.system.StorageScanner
import com.mutluet.optimizer.ui.components.PermissionRationaleCard
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class StorageViewModel @Inject constructor(
    private val storageScanner: StorageScanner
) : ViewModel() {

    data class UiState(
        val breakdown: StorageBreakdown? = null,
        val largeFiles: List<FileItem> = emptyList(),
        val isLoading: Boolean = false,
        val hasScanned: Boolean = false
    )

    private val _uiState = MutableStateFlow(UiState())
    val uiState: StateFlow<UiState> = _uiState.asStateFlow()

    fun scan() {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true)
            val breakdown = storageScanner.getStorageBreakdown()
            val largeFiles = storageScanner.listLargeFiles(50f)
            _uiState.value = UiState(
                breakdown = breakdown,
                largeFiles = largeFiles,
                isLoading = false,
                hasScanned = true
            )
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun StorageScreen(
    onNavigateToChat: (String) -> Unit,
    viewModel: StorageViewModel = hiltViewModel()
) {
    val uiState by viewModel.uiState.collectAsStateWithLifecycle()
    val context = LocalContext.current
    var hasPermission by remember { mutableStateOf(false) }

    LaunchedEffect(Unit) {
        hasPermission = true  // Storage summary doesn't require special permission
        viewModel.scan()
    }

    Scaffold(
        topBar = { TopAppBar(title = { Text("Depolama Analizi") }) }
    ) { padding ->
        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding),
            contentPadding = PaddingValues(16.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            if (uiState.isLoading) {
                item {
                    Box(Modifier.fillMaxWidth(), contentAlignment = Alignment.Center) {
                        Column(horizontalAlignment = Alignment.CenterHorizontally) {
                            CircularProgressIndicator()
                            Spacer(Modifier.height(8.dp))
                            Text("Depolama analiz ediliyor…")
                        }
                    }
                }
            }

            uiState.breakdown?.let { bd ->
                item {
                    StorageOverviewCard(breakdown = bd, storageScanner = storageScanner)
                }

                item {
                    Button(
                        onClick = { onNavigateToChat("Depolama alanımı analiz et ve temizleme önerileri sun") },
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Text("AI ile Depolama Temizle")
                    }
                }
            }

            if (uiState.largeFiles.isNotEmpty()) {
                item {
                    Text(
                        "50 MB Üzeri Dosyalar",
                        style = MaterialTheme.typography.titleSmall,
                        fontWeight = FontWeight.SemiBold
                    )
                }
                items(uiState.largeFiles.take(20)) { file ->
                    LargeFileCard(file = file, storageScanner = storageScanner)
                }
            }
        }
    }
}

@Composable
private fun StorageOverviewCard(breakdown: StorageBreakdown, storageScanner: StorageScanner) {
    val usedRatio = breakdown.usedBytes.toFloat() / breakdown.totalBytes.coerceAtLeast(1)
    ElevatedCard(modifier = Modifier.fillMaxWidth()) {
        Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
            Text("Depolama Durumu", style = MaterialTheme.typography.titleMedium)
            LinearProgressIndicator(
                progress = { usedRatio.coerceIn(0f, 1f) },
                modifier = Modifier.fillMaxWidth().height(12.dp),
                strokeCap = StrokeCap.Round,
                color = when {
                    usedRatio > 0.9f -> MaterialTheme.colorScheme.error
                    usedRatio > 0.75f -> MaterialTheme.colorScheme.tertiary
                    else -> MaterialTheme.colorScheme.primary
                }
            )
            Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                Text("Kullanılan: ${storageScanner.formatSize(breakdown.usedBytes)}", style = MaterialTheme.typography.bodySmall)
                Text("Boş: ${storageScanner.formatSize(breakdown.freeBytes)}", style = MaterialTheme.typography.bodySmall)
            }
            Text(
                "Toplam: ${storageScanner.formatSize(breakdown.totalBytes)}",
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )
            if (breakdown.cacheBytes > 0) {
                Text(
                    "Önbellek: ${storageScanner.formatSize(breakdown.cacheBytes)}",
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.tertiary
                )
            }
        }
    }
}

@Composable
private fun LargeFileCard(file: FileItem, storageScanner: StorageScanner) {
    ElevatedCard(modifier = Modifier.fillMaxWidth()) {
        Row(
            modifier = Modifier.padding(12.dp),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Column(modifier = Modifier.weight(1f)) {
                Text(file.name, style = MaterialTheme.typography.bodyMedium, fontWeight = FontWeight.Medium)
                Text(
                    file.path.substringBeforeLast("/"),
                    style = MaterialTheme.typography.labelSmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                    maxLines = 1
                )
            }
            Text(
                storageScanner.formatSize(file.sizeBytes),
                style = MaterialTheme.typography.labelLarge,
                fontWeight = FontWeight.Bold,
                color = MaterialTheme.colorScheme.primary
            )
        }
    }
}

@Composable
private fun <T> kotlinx.coroutines.flow.StateFlow<T>.collectAsStateWithLifecycle(): androidx.compose.runtime.State<T> {
    return androidx.lifecycle.compose.collectAsStateWithLifecycle()
}
