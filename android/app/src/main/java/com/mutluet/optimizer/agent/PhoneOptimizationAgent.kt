package com.mutluet.optimizer.agent

import android.content.Context
import com.mutluet.optimizer.agent.base.BaseAgent
import com.mutluet.optimizer.data.local.PreferencesDataStore
import com.mutluet.optimizer.data.remote.ClaudeApiService
import com.mutluet.optimizer.data.remote.models.JsonSchema
import com.mutluet.optimizer.data.remote.models.ToolDefinition
import com.mutluet.optimizer.system.ProcessScanner
import dagger.hilt.android.qualifiers.ApplicationContext
import kotlinx.serialization.json.JsonElement
import kotlinx.serialization.json.buildJsonObject
import kotlinx.serialization.json.put
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class PhoneOptimizationAgent @Inject constructor(
    claudeApiService: ClaudeApiService,
    preferencesDataStore: PreferencesDataStore,
    @ApplicationContext context: Context,
    private val processScanner: ProcessScanner
) : BaseAgent(claudeApiService, preferencesDataStore, context) {

    override val systemPrompt = """
        Sen Mutluet AI Optimizer'ın telefon performans uzmanısın.
        Android telefonun CPU, RAM, batarya ve termal durumunu analiz edip kullanıcıya somut,
        uygulanabilir öneriler sunarsın. Türkçe yanıt ver.

        Araçları kullanarak gerçek sistem verilerini topla, sonra analiz et ve öncelikli
        optimizasyon adımlarını sırala. Her öneride neden önemli olduğunu açıkla.

        Önemli: Silme veya devre dışı bırakma gibi kritik işlemlerde MUTLAKA kullanıcı onayı iste.
    """.trimIndent()

    override fun getTools(): List<ToolDefinition> = listOf(
        ToolDefinition(
            name = "get_battery_info",
            description = "Mevcut batarya seviyesi, şarj durumu, sıcaklık ve sağlık bilgisini döndürür.",
            inputSchema = JsonSchema(
                properties = buildJsonObject {},
                required = emptyList()
            )
        ),
        ToolDefinition(
            name = "get_memory_info",
            description = "Toplam RAM, kullanılan RAM, boş RAM ve düşük bellek uyarısı durumunu döndürür.",
            inputSchema = JsonSchema(
                properties = buildJsonObject {},
                required = emptyList()
            )
        ),
        ToolDefinition(
            name = "get_cpu_usage",
            description = "Anlık CPU kullanım yüzdesini döndürür.",
            inputSchema = JsonSchema(
                properties = buildJsonObject {},
                required = emptyList()
            )
        ),
        ToolDefinition(
            name = "get_running_processes",
            description = "Arka planda çalışan uygulamaları RAM kullanımına göre sıralı listeler.",
            inputSchema = JsonSchema(
                properties = buildJsonObject {},
                required = emptyList()
            )
        ),
        ToolDefinition(
            name = "get_top_battery_drain_apps",
            description = "Son 24 saatte en çok ön planda çalışan uygulamaları listeler. Bunlar genellikle en çok batarya tüketenlerdir.",
            inputSchema = JsonSchema(
                properties = buildJsonObject {},
                required = emptyList()
            )
        )
    )

    override suspend fun executeTool(toolName: String, toolInput: JsonElement): String {
        return when (toolName) {
            "get_battery_info" -> {
                val info = processScanner.getBatteryInfo()
                buildJsonObject {
                    put("level_percent", info.level)
                    put("is_charging", info.isCharging)
                    put("temperature_celsius", info.temperature)
                    put("health", info.health)
                    put("voltage_mv", info.voltage)
                }.toString()
            }

            "get_memory_info" -> {
                val info = processScanner.getMemoryInfo()
                buildJsonObject {
                    put("total_ram_mb", info.totalRamMb)
                    put("available_ram_mb", info.availableRamMb)
                    put("used_ram_mb", info.usedRamMb)
                    put("usage_percent", ((info.usedRamMb.toDouble() / info.totalRamMb) * 100).toInt())
                    put("is_low_memory", info.isLowMemory)
                }.toString()
            }

            "get_cpu_usage" -> {
                val usage = processScanner.getCpuUsagePercent()
                buildJsonObject {
                    put("cpu_usage_percent", usage)
                    put("status", when {
                        usage > 80 -> "Kritik - Yüksek CPU Kullanımı"
                        usage > 50 -> "Orta - Normal"
                        else -> "İyi - Düşük CPU Kullanımı"
                    })
                }.toString()
            }

            "get_running_processes" -> {
                val processes = processScanner.getRunningProcesses()
                kotlinx.serialization.json.buildJsonArray {
                    processes.take(15).forEach { proc ->
                        add(buildJsonObject {
                            put("app_name", proc.appName)
                            put("package_name", proc.packageName)
                            put("memory_kb", proc.memoryUsageKb)
                            put("memory_mb", proc.memoryUsageKb / 1024)
                        })
                    }
                }.toString()
            }

            "get_top_battery_drain_apps" -> {
                val apps = processScanner.getTopUsageApps(24)
                kotlinx.serialization.json.buildJsonArray {
                    apps.take(10).forEach { app ->
                        add(buildJsonObject {
                            put("app_name", app.appName)
                            put("package_name", app.packageName)
                            put("foreground_time", processScanner.formatDuration(app.totalForegroundTime))
                            put("is_system_app", app.isSystemApp)
                        })
                    }
                }.toString()
            }

            else -> "Bilinmeyen araç: $toolName"
        }
    }
}
