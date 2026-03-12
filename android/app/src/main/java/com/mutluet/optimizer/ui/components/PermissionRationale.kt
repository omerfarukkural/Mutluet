package com.mutluet.optimizer.ui.components

import android.content.Intent
import android.net.Uri
import android.provider.Settings
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Button
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.unit.dp

@Composable
fun PermissionRationaleCard(
    title: String,
    message: String,
    settingsAction: String? = null,
    onRequestPermission: (() -> Unit)? = null
) {
    val context = LocalContext.current

    Card(
        modifier = Modifier.fillMaxWidth(),
        colors = CardDefaults.cardColors(
            containerColor = MaterialTheme.colorScheme.errorContainer
        )
    ) {
        Column(
            modifier = Modifier.padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            Text(title, style = MaterialTheme.typography.titleSmall)
            Text(
                message,
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.onErrorContainer
            )
            if (onRequestPermission != null) {
                Button(onClick = onRequestPermission) {
                    Text("İzin Ver")
                }
            }
            if (settingsAction != null) {
                Button(onClick = {
                    context.startActivity(Intent(settingsAction).apply {
                        flags = Intent.FLAG_ACTIVITY_NEW_TASK
                    })
                }) {
                    Text("Ayarlara Git")
                }
            }
        }
    }
}
