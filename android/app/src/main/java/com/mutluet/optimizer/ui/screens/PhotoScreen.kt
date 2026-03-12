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
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Image
import androidx.compose.material3.Button
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.ElevatedCard
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
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
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.mutluet.optimizer.system.PhotoGroup
import com.mutluet.optimizer.system.PhotoInfo
import com.mutluet.optimizer.system.PhotoScanner
import com.mutluet.optimizer.ui.components.PermissionRationaleCard
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class PhotoViewModel @Inject constructor(
    private val photoScanner: PhotoScanner
) : ViewModel() {

    data class UiState(
        val totalPhotos: Int = 0,
        val totalSizeText: String = "",
        val groups: List<PhotoGroup> = emptyList(),
        val isLoading: Boolean = false,
        val hasScanned: Boolean = false
    )

    private val _uiState = MutableStateFlow(UiState())
    val uiState: StateFlow<UiState> = _uiState.asStateFlow()

    fun scan() {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true)
            val photos = photoScanner.scanAllPhotos()
            val groups = photoScanner.groupSimilarPhotos(photos)
            val totalSize = photos.sumOf { it.size }

            _uiState.value = UiState(
                totalPhotos = photos.size,
                totalSizeText = photoScanner.formatSize(totalSize),
                groups = groups,
                isLoading = false,
                hasScanned = true
            )
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun PhotoScreen(
    onNavigateToChat: (String) -> Unit,
    viewModel: PhotoViewModel = hiltViewModel()
) {
    val uiState by viewModel.uiState.collectAsStateWithLifecycle()
    val context = LocalContext.current

    val permissions = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
        arrayOf(Manifest.permission.READ_MEDIA_IMAGES)
    } else {
        arrayOf(Manifest.permission.READ_EXTERNAL_STORAGE)
    }

    var hasPermission by remember { mutableStateOf(false) }

    val launcher = rememberLauncherForActivityResult(
        ActivityResultContracts.RequestMultiplePermissions()
    ) { results ->
        hasPermission = results.values.all { it }
        if (hasPermission) viewModel.scan()
    }

    LaunchedEffect(Unit) {
        val pm = context.packageManager
        hasPermission = permissions.all { perm ->
            context.checkSelfPermission(perm) == android.content.pm.PackageManager.PERMISSION_GRANTED
        }
        if (hasPermission) viewModel.scan()
    }

    Scaffold(
        topBar = { TopAppBar(title = { Text("Fotoğraf Yönetimi") }) }
    ) { padding ->
        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding),
            contentPadding = PaddingValues(16.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            if (!hasPermission) {
                item {
                    PermissionRationaleCard(
                        title = "Depolama İzni Gerekli",
                        message = "Fotoğraflarınızı analiz etmek için galeri erişim iznine ihtiyaç var.",
                        onRequestPermission = { launcher.launch(permissions) }
                    )
                }
            } else if (uiState.isLoading) {
                item {
                    Box(Modifier.fillMaxWidth(), contentAlignment = Alignment.Center) {
                        Column(horizontalAlignment = Alignment.CenterHorizontally) {
                            CircularProgressIndicator()
                            Spacer(Modifier.height(8.dp))
                            Text("Fotoğraflar taranıyor…")
                        }
                    }
                }
            } else if (uiState.hasScanned) {
                // Summary
                item {
                    ElevatedCard(modifier = Modifier.fillMaxWidth()) {
                        Row(
                            modifier = Modifier.padding(16.dp),
                            horizontalArrangement = Arrangement.SpaceEvenly,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            SummaryItem("Toplam Fotoğraf", "${uiState.totalPhotos}")
                            SummaryItem("Toplam Boyut", uiState.totalSizeText)
                            SummaryItem("Benzer Grup", "${uiState.groups.size}")
                        }
                    }
                }

                if (uiState.groups.isNotEmpty()) {
                    item {
                        Button(
                            onClick = {
                                onNavigateToChat("Fotoğraflarımı organize et. ${uiState.groups.size} benzer grup var.")
                            },
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Text("AI ile Organize Et (${uiState.groups.size} grup)")
                        }
                    }

                    items(uiState.groups.take(30)) { group ->
                        PhotoGroupCard(group = group, photoScanner = photoScanner)
                    }
                } else {
                    item {
                        Text(
                            "Benzer fotoğraf grubu bulunamadı. Galeri iyi organize edilmiş.",
                            style = MaterialTheme.typography.bodyMedium,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    }
                }
            }
        }
    }
}

@Composable
private fun SummaryItem(label: String, value: String) {
    Column(horizontalAlignment = Alignment.CenterHorizontally) {
        Text(value, style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.Bold)
        Text(label, style = MaterialTheme.typography.labelSmall,
            color = MaterialTheme.colorScheme.onSurfaceVariant)
    }
}

@Composable
private fun PhotoGroupCard(group: PhotoGroup, photoScanner: PhotoScanner) {
    ElevatedCard(modifier = Modifier.fillMaxWidth()) {
        Column(modifier = Modifier.padding(12.dp)) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Icon(Icons.Default.Image, contentDescription = null,
                    tint = MaterialTheme.colorScheme.primary, modifier = Modifier.size(20.dp))
                Text(
                    " ${group.photos.size} benzer fotoğraf",
                    style = MaterialTheme.typography.labelMedium,
                    fontWeight = FontWeight.SemiBold
                )
            }
            Spacer(Modifier.height(4.dp))
            val wasted = group.photos.drop(1).sumOf { it.size }
            Text(
                "Kazanılabilecek alan: ${photoScanner.formatSize(wasted)}",
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )
            Text(
                "En iyi: ${group.photos.firstOrNull()?.displayName ?: ""}",
                style = MaterialTheme.typography.bodySmall
            )
        }
    }
}

@Composable
private fun <T> kotlinx.coroutines.flow.StateFlow<T>.collectAsStateWithLifecycle(): androidx.compose.runtime.State<T> {
    return androidx.lifecycle.compose.collectAsStateWithLifecycle()
}
