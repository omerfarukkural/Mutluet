package com.mutluet.optimizer.work

import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.os.Build
import androidx.core.app.NotificationCompat
import androidx.work.CoroutineWorker
import androidx.work.WorkerParameters
import com.mutluet.optimizer.MainActivity
import com.mutluet.optimizer.system.ProcessScanner
import com.mutluet.optimizer.system.StorageScanner
import dagger.assisted.Assisted
import dagger.assisted.AssistedInject

class ScheduledOptimizationWorker @AssistedInject constructor(
    @Assisted context: Context,
    @Assisted params: WorkerParameters,
    private val processScanner: ProcessScanner,
    private val storageScanner: StorageScanner
) : CoroutineWorker(context, params) {

    companion object {
        const val CHANNEL_ID = "optimizer_daily"
        const val WORK_NAME = "daily_optimization"
        const val NOTIFICATION_ID = 1001
    }

    override suspend fun doWork(): Result {
        return try {
            val memInfo = processScanner.getMemoryInfo()
            val battery = processScanner.getBatteryInfo()
            val storage = storageScanner.getStorageBreakdown()

            val issues = mutableListOf<String>()
            if (memInfo.usedRamMb.toFloat() / memInfo.totalRamMb > 0.85f) {
                issues.add("RAM kullanımı %${(memInfo.usedRamMb * 100 / memInfo.totalRamMb)}!")
            }
            val storageUsed = storage.usedBytes.toFloat() / storage.totalBytes.coerceAtLeast(1)
            if (storageUsed > 0.85f) {
                issues.add("Depolama %${(storageUsed * 100).toInt()} dolu!")
            }
            if (battery.temperature > 40f) {
                issues.add("Telefon ısınıyor: ${battery.temperature}°C")
            }

            if (issues.isNotEmpty()) {
                showNotification(issues)
            }

            Result.success()
        } catch (e: Exception) {
            Result.failure()
        }
    }

    private fun showNotification(issues: List<String>) {
        val nm = applicationContext.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            nm.createNotificationChannel(
                NotificationChannel(CHANNEL_ID, "Günlük Optimizasyon", NotificationManager.IMPORTANCE_DEFAULT)
            )
        }

        val intent = Intent(applicationContext, MainActivity::class.java)
        val pendingIntent = PendingIntent.getActivity(
            applicationContext, 0, intent,
            PendingIntent.FLAG_IMMUTABLE or PendingIntent.FLAG_UPDATE_CURRENT
        )

        val notification = NotificationCompat.Builder(applicationContext, CHANNEL_ID)
            .setSmallIcon(android.R.drawable.ic_dialog_info)
            .setContentTitle("Mutluet Optimizer")
            .setContentText(issues.first())
            .setStyle(NotificationCompat.BigTextStyle().bigText(issues.joinToString("\n")))
            .setContentIntent(pendingIntent)
            .setAutoCancel(true)
            .build()

        nm.notify(NOTIFICATION_ID, notification)
    }
}
