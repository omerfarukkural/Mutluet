package com.mutluet.optimizer.system

import android.app.ActivityManager
import android.app.usage.UsageStatsManager
import android.content.Context
import android.content.pm.ApplicationInfo
import android.content.pm.PackageManager
import android.os.BatteryManager
import android.os.Build
import dagger.hilt.android.qualifiers.ApplicationContext
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import javax.inject.Inject
import javax.inject.Singleton

data class AppUsageInfo(
    val packageName: String,
    val appName: String,
    val totalForegroundTime: Long,       // ms
    val lastUsed: Long,                  // timestamp ms
    val isSystemApp: Boolean,
    val memoryUsageKb: Long = 0,
    val estimatedBatteryDrain: Float = 0f
)

data class MemoryInfo(
    val totalRamMb: Long,
    val availableRamMb: Long,
    val usedRamMb: Long,
    val isLowMemory: Boolean
)

data class BatteryInfo(
    val level: Int,          // 0-100
    val isCharging: Boolean,
    val temperature: Float,  // Celsius
    val health: String,
    val voltage: Int         // mV
)

@Singleton
class ProcessScanner @Inject constructor(
    @ApplicationContext private val context: Context
) {
    private val activityManager = context.getSystemService(Context.ACTIVITY_SERVICE) as ActivityManager
    private val packageManager = context.packageManager

    /**
     * Returns apps sorted by foreground usage in the last 24 hours.
     * Requires PACKAGE_USAGE_STATS permission.
     */
    suspend fun getTopUsageApps(limitHours: Int = 24): List<AppUsageInfo> = withContext(Dispatchers.IO) {
        val usageStatsManager = context.getSystemService(Context.USAGE_STATS_SERVICE) as? UsageStatsManager
            ?: return@withContext emptyList()

        val endTime = System.currentTimeMillis()
        val startTime = endTime - limitHours * 60 * 60 * 1000L

        val stats = usageStatsManager.queryUsageStats(
            UsageStatsManager.INTERVAL_DAILY, startTime, endTime
        ) ?: return@withContext emptyList()

        stats
            .filter { it.totalTimeInForeground > 0 }
            .map { stat ->
                val appName = try {
                    packageManager.getApplicationLabel(
                        packageManager.getApplicationInfo(stat.packageName, 0)
                    ).toString()
                } catch (_: PackageManager.NameNotFoundException) {
                    stat.packageName
                }
                val isSystem = try {
                    (packageManager.getApplicationInfo(stat.packageName, 0).flags
                            and ApplicationInfo.FLAG_SYSTEM) != 0
                } catch (_: Exception) { false }

                AppUsageInfo(
                    packageName = stat.packageName,
                    appName = appName,
                    totalForegroundTime = stat.totalTimeInForeground,
                    lastUsed = stat.lastTimeUsed,
                    isSystemApp = isSystem
                )
            }
            .sortedByDescending { it.totalForegroundTime }
    }

    /**
     * Returns currently running processes with memory usage.
     */
    suspend fun getRunningProcesses(): List<AppUsageInfo> = withContext(Dispatchers.IO) {
        val runningApps = activityManager.runningAppProcesses ?: return@withContext emptyList()
        runningApps.map { proc ->
            val memInfo = activityManager.getProcessMemoryInfo(intArrayOf(proc.pid))
            val memKb = memInfo.firstOrNull()?.totalPss?.toLong() ?: 0L

            val appName = try {
                packageManager.getApplicationLabel(
                    packageManager.getApplicationInfo(proc.processName, 0)
                ).toString()
            } catch (_: Exception) { proc.processName }

            val isSystem = try {
                (packageManager.getApplicationInfo(proc.processName, 0).flags
                        and ApplicationInfo.FLAG_SYSTEM) != 0
            } catch (_: Exception) { false }

            AppUsageInfo(
                packageName = proc.processName,
                appName = appName,
                totalForegroundTime = 0L,
                lastUsed = System.currentTimeMillis(),
                isSystemApp = isSystem,
                memoryUsageKb = memKb
            )
        }
        .filter { !it.isSystemApp }
        .sortedByDescending { it.memoryUsageKb }
    }

    /**
     * Returns system memory information.
     */
    fun getMemoryInfo(): MemoryInfo {
        val memInfo = ActivityManager.MemoryInfo()
        activityManager.getMemoryInfo(memInfo)
        val totalMb = memInfo.totalMem / (1024 * 1024)
        val availMb = memInfo.availMem / (1024 * 1024)
        return MemoryInfo(
            totalRamMb = totalMb,
            availableRamMb = availMb,
            usedRamMb = totalMb - availMb,
            isLowMemory = memInfo.lowMemory
        )
    }

    /**
     * Returns current battery information.
     */
    fun getBatteryInfo(): BatteryInfo {
        val batteryManager = context.getSystemService(Context.BATTERY_SERVICE) as BatteryManager
        val level = batteryManager.getIntProperty(BatteryManager.BATTERY_PROPERTY_CAPACITY)
        val isCharging = batteryManager.isCharging

        // Get detailed info via sticky broadcast
        val intent = context.registerReceiver(null,
            android.content.IntentFilter(android.content.Intent.ACTION_BATTERY_CHANGED))
        val temp = (intent?.getIntExtra(BatteryManager.EXTRA_TEMPERATURE, 0) ?: 0) / 10f
        val voltage = intent?.getIntExtra(BatteryManager.EXTRA_VOLTAGE, 0) ?: 0
        val healthInt = intent?.getIntExtra(BatteryManager.EXTRA_HEALTH, BatteryManager.BATTERY_HEALTH_UNKNOWN) ?: 0
        val health = when (healthInt) {
            BatteryManager.BATTERY_HEALTH_GOOD -> "İyi"
            BatteryManager.BATTERY_HEALTH_OVERHEAT -> "Aşırı ısınma"
            BatteryManager.BATTERY_HEALTH_DEAD -> "Ölü"
            BatteryManager.BATTERY_HEALTH_OVER_VOLTAGE -> "Aşırı voltaj"
            BatteryManager.BATTERY_HEALTH_COLD -> "Soğuk"
            else -> "Bilinmiyor"
        }

        return BatteryInfo(
            level = level,
            isCharging = isCharging,
            temperature = temp,
            health = health,
            voltage = voltage
        )
    }

    /**
     * Reads CPU usage from /proc/stat (approximate).
     */
    suspend fun getCpuUsagePercent(): Float = withContext(Dispatchers.IO) {
        try {
            val stat1 = readCpuStat()
            Thread.sleep(200)
            val stat2 = readCpuStat()
            val idle1 = stat1[3]
            val idle2 = stat2[3]
            val total1 = stat1.sum()
            val total2 = stat2.sum()
            val deltaTotal = total2 - total1
            val deltaIdle = idle2 - idle1
            if (deltaTotal == 0L) 0f
            else ((deltaTotal - deltaIdle).toFloat() / deltaTotal) * 100f
        } catch (_: Exception) {
            0f
        }
    }

    private fun readCpuStat(): List<Long> {
        return java.io.File("/proc/stat").readLines()
            .firstOrNull { it.startsWith("cpu ") }
            ?.trim()?.split("\\s+".toRegex())
            ?.drop(1)
            ?.mapNotNull { it.toLongOrNull() }
            ?: emptyList()
    }

    /**
     * Attempts to kill background processes for a package.
     * Note: Limited without root — only kills processes the system allows.
     */
    fun killBackgroundProcess(packageName: String): Boolean {
        return try {
            activityManager.killBackgroundProcesses(packageName)
            true
        } catch (_: SecurityException) {
            false
        }
    }

    fun formatDuration(ms: Long): String {
        val minutes = ms / 60000
        return when {
            minutes < 60 -> "${minutes}dk"
            else -> "${minutes / 60}sa ${minutes % 60}dk"
        }
    }
}
