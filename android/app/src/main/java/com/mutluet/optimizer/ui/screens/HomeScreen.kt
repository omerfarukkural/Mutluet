package com.mutluet.optimizer.ui.screens

import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.animation.core.tween
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
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.BatteryChargingFull
import androidx.compose.material.icons.filled.Code
import androidx.compose.material.icons.filled.Image
import androidx.compose.material.icons.filled.Memory
import androidx.compose.material.icons.filled.Settings
import androidx.compose.material.icons.filled.Speed
import androidx.compose.material.icons.filled.Storage
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.ElevatedCard
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.FilledTonalButton
import androidx.compose.material3.Icon
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
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.mutluet.optimizer.system.BatteryInfo
import com.mutluet.optimizer.system.MemoryInfo
import com.mutluet.optimizer.system.ProcessScanner
import com.mutluet.optimizer.system.StorageScanner
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

// ─── ViewModel ────────────────────────────────────────────────────────────────

@HiltViewModel
class HomeViewModel @Inject constructor(
    private val processScanner: ProcessScanner,
    private val storageScanner: StorageScanner
) : ViewModel() {

    data class UiState(
        val batteryInfo: BatteryInfo? = null,
        val memoryInfo: MemoryInfo? = null,
        val cpuUsage: Float = 0f,
        val storageFreePercent: Float = 1f,
        val storageFreeText: String = "…",
        val isLoading: Boolean = true
    )

    private val _uiState = MutableStateFlow(UiState())
    val uiState: StateFlow<UiState> = _uiState.asStateFlow()

    fun loadStats() {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true)
            val battery = processScanner.getBatteryInfo()
            val memory = processScanner.getMemoryInfo()
            val cpu = processScanner.getCpuUsagePercent()
            val storage = storageScanner.getStorageBreakdown()

            _uiState.value = UiState(
                batteryInfo = battery,
                memoryInfo = memory,
                cpuUsage = cpu,
                storageFreePercent = storage.freeBytes.toFloat() / storage.totalBytes.coerceAtLeast(1),
                storageFreeText = "${storageScanner.formatSize(storage.freeBytes)} boş",
                isLoading = false
            )
        }
    }
}

// ─── Quick Action Data ─────────────────────────────────────────────────────────

private data class QuickAction(
    val label: String,
    val message: String,
    val icon: ImageVector
)

private val quickActions = listOf(
    QuickAction("Telefonu Optimize Et", "Telefonumu optimize et ve performans önerileri sun", Icons.Default.Speed),
    QuickAction("Fotoğrafları Düzenle", "Fotoğraflarımı organize et, benzerlerini grupla ve en iyisini seç", Icons.Default.Image),
    QuickAction("Depolama Temizle", "Depolama alanımı analiz et ve gereksiz dosyaları temizle", Icons.Default.Storage),
    QuickAction("Pil Analizi", "Batarya tüketen uygulamaları listele ve optimize et", Icons.Default.BatteryChargingFull),
    QuickAction("RAM Yönetimi", "Arka plan uygulamalarını listele ve gereksiz olanları kapat", Icons.Default.Memory),
    QuickAction("Geliştirme Ortamı", "Android geliştirme ortamı kur ve deploy ayarla", Icons.Default.Code),
)

// ─── Screen ───────────────────────────────────────────────────────────────────

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun HomeScreen(
    onNavigateToChat: (String) -> Unit,
    viewModel: HomeViewModel = hiltViewModel()
) {
    val uiState by viewModel.uiState.collectAsStateWithLifecycle()

    LaunchedEffect(Unit) { viewModel.loadStats() }

    Scaffold(
        topBar = {
            TopAppBar(title = { Text("Mutluet Optimizer") })
        }
    ) { padding ->
        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding),
            contentPadding = PaddingValues(16.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            item {
                Text(
                    "Sistem Durumu",
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.Bold
                )
            }

            // Stats row
            item {
                if (uiState.isLoading) {
                    Box(Modifier.fillMaxWidth(), contentAlignment = Alignment.Center) {
                        CircularProgressIndicator()
                    }
                } else {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(12.dp)
                    ) {
                        uiState.batteryInfo?.let { battery ->
                            StatCard(
                                modifier = Modifier.weight(1f),
                                label = "Batarya",
                                value = "${battery.level}%",
                                subtitle = if (battery.isCharging) "Şarj oluyor" else battery.health,
                                progress = battery.level / 100f,
                                icon = Icons.Default.BatteryChargingFull
                            )
                        }
                        uiState.memoryInfo?.let { mem ->
                            val usedPercent = mem.usedRamMb.toFloat() / mem.totalRamMb.coerceAtLeast(1)
                            StatCard(
                                modifier = Modifier.weight(1f),
                                label = "RAM",
                                value = "${mem.usedRamMb} MB",
                                subtitle = "${mem.availableRamMb} MB boş",
                                progress = usedPercent,
                                icon = Icons.Default.Memory
                            )
                        }
                        StatCard(
                            modifier = Modifier.weight(1f),
                            label = "Depolama",
                            value = uiState.storageFreeText,
                            subtitle = "kullanılabilir",
                            progress = 1f - uiState.storageFreePercent,
                            icon = Icons.Default.Storage
                        )
                    }
                }
            }

            // CPU Card
            if (!uiState.isLoading && uiState.cpuUsage > 0) {
                item {
                    ElevatedCard(modifier = Modifier.fillMaxWidth()) {
                        Row(
                            modifier = Modifier.padding(16.dp),
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(12.dp)
                        ) {
                            Icon(Icons.Default.Speed, contentDescription = null,
                                tint = MaterialTheme.colorScheme.primary)
                            Column(modifier = Modifier.weight(1f)) {
                                Text("CPU Kullanımı", style = MaterialTheme.typography.labelMedium)
                                Spacer(Modifier.height(4.dp))
                                val animatedProgress by animateFloatAsState(
                                    targetValue = uiState.cpuUsage / 100f,
                                    animationSpec = tween(1000),
                                    label = "cpu"
                                )
                                LinearProgressIndicator(
                                    progress = { animatedProgress },
                                    modifier = Modifier.fillMaxWidth(),
                                    strokeCap = StrokeCap.Round,
                                    color = when {
                                        uiState.cpuUsage > 80 -> MaterialTheme.colorScheme.error
                                        uiState.cpuUsage > 50 -> MaterialTheme.colorScheme.tertiary
                                        else -> MaterialTheme.colorScheme.primary
                                    }
                                )
                            }
                            Text(
                                "%.0f%%".format(uiState.cpuUsage),
                                style = MaterialTheme.typography.titleMedium,
                                fontWeight = FontWeight.Bold
                            )
                        }
                    }
                }
            }

            item {
                Text(
                    "Hızlı Eylemler",
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.Bold
                )
            }

            item {
                LazyVerticalGrid(
                    columns = GridCells.Fixed(2),
                    horizontalArrangement = Arrangement.spacedBy(12.dp),
                    verticalArrangement = Arrangement.spacedBy(12.dp),
                    modifier = Modifier.height(380.dp)  // Fixed height inside LazyColumn
                ) {
                    items(quickActions) { action ->
                        QuickActionCard(
                            action = action,
                            onClick = { onNavigateToChat(action.message) }
                        )
                    }
                }
            }

            item { Spacer(Modifier.height(8.dp)) }
        }
    }
}

@Composable
private fun StatCard(
    modifier: Modifier = Modifier,
    label: String,
    value: String,
    subtitle: String,
    progress: Float,
    icon: ImageVector
) {
    val animatedProgress by animateFloatAsState(
        targetValue = progress.coerceIn(0f, 1f),
        animationSpec = tween(800),
        label = "stat_progress"
    )
    ElevatedCard(modifier = modifier) {
        Column(
            modifier = Modifier.padding(12.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Icon(icon, contentDescription = null,
                tint = MaterialTheme.colorScheme.primary, modifier = Modifier.size(20.dp))
            Spacer(Modifier.height(4.dp))
            CircularProgressIndicator(
                progress = { animatedProgress },
                modifier = Modifier.size(52.dp),
                strokeWidth = 5.dp,
                color = when {
                    progress > 0.9f -> MaterialTheme.colorScheme.error
                    progress > 0.7f -> MaterialTheme.colorScheme.tertiary
                    else -> MaterialTheme.colorScheme.primary
                },
                strokeCap = StrokeCap.Round
            )
            Spacer(Modifier.height(4.dp))
            Text(label, style = MaterialTheme.typography.labelSmall)
            Text(value, style = MaterialTheme.typography.bodyMedium, fontWeight = FontWeight.Bold)
            Text(
                subtitle,
                style = MaterialTheme.typography.labelSmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
private fun QuickActionCard(action: QuickAction, onClick: () -> Unit) {
    ElevatedCard(
        onClick = onClick,
        modifier = Modifier.fillMaxWidth()
    ) {
        Column(
            modifier = Modifier.padding(16.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            Icon(
                action.icon,
                contentDescription = null,
                modifier = Modifier.size(32.dp),
                tint = MaterialTheme.colorScheme.primary
            )
            Text(
                action.label,
                style = MaterialTheme.typography.labelMedium,
                fontWeight = FontWeight.Medium,
                textAlign = androidx.compose.ui.text.style.TextAlign.Center
            )
        }
    }
}

@Composable
private fun <T> kotlinx.coroutines.flow.StateFlow<T>.collectAsStateWithLifecycle(): androidx.compose.runtime.State<T> {
    return androidx.lifecycle.compose.collectAsStateWithLifecycle()
}
