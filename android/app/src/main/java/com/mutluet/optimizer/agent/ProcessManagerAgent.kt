package com.mutluet.optimizer.agent

import android.content.Context
import android.content.Intent
import android.net.Uri
import android.provider.Settings
import com.mutluet.optimizer.agent.base.BaseAgent
import com.mutluet.optimizer.data.local.PreferencesDataStore
import com.mutluet.optimizer.data.remote.ClaudeApiService
import com.mutluet.optimizer.data.remote.models.JsonSchema
import com.mutluet.optimizer.data.remote.models.PendingApproval
import com.mutluet.optimizer.data.remote.models.ToolDefinition
import com.mutluet.optimizer.system.ProcessScanner
import dagger.hilt.android.qualifiers.ApplicationContext
import kotlinx.serialization.json.JsonElement
import kotlinx.serialization.json.buildJsonArray
import kotlinx.serialization.json.buildJsonObject
import kotlinx.serialization.json.put
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class ProcessManagerAgent @Inject constructor(
    claudeApiService: ClaudeApiService,
    preferencesDataStore: PreferencesDataStore,
    @ApplicationContext context: Context,
    private val processScanner: ProcessScanner
) : BaseAgent(claudeApiService, preferencesDataStore, context) {

    override val systemPrompt = """
        Sen Mutluet AI Optimizer'ın süreç yönetim uzmanısın.
        Kullanıcının telefonunda çalışan uygulamaları analiz eder, batarya ve RAM tüketen
        gereksiz süreçleri tespit eder ve kullanıcı onayıyla güvenli şekilde durdurursun.

        ÖNEMLİ KURALLAR:
        - Sistem uygulamalarını (isSystemApp: true) durdurma önerisinde BULUNMA
        - Kritik sistem süreçlerine DOKUNMA
        - Her durdurma işlemi için MUTLAKA kullanıcıdan onay al (force_stop_app aracı bunu otomatik yapar)
        - Uygulamanın ne yaptığını açıkla, neden durdurmak gerektiğini belirt
        Türkçe yanıt ver.
    """.trimIndent()

    override fun getTools(): List<ToolDefinition> = listOf(
        ToolDefinition(
            name = "list_memory_heavy_apps",
            description = "En çok RAM kullanan arka plan uygulamalarını listeler.",
            inputSchema = JsonSchema(properties = buildJsonObject {}, required = emptyList())
        ),
        ToolDefinition(
            name = "list_battery_drain_apps",
            description = "Son 24 saatte en uzun süre ön planda çalışan (batarya tüketen) uygulamaları listeler.",
            inputSchema = JsonSchema(properties = buildJsonObject {}, required = emptyList())
        ),
        ToolDefinition(
            name = "force_stop_app",
            description = "Bir uygulamanın arka plan süreçlerini durdurur. KULLANICI ONAYI GEREKTİRİR.",
            inputSchema = JsonSchema(
                properties = buildJsonObject {
                    put("package_name", buildJsonObject {
                        put("type", "string")
                        put("description", "Durdurulacak uygulamanın paket adı")
                    })
                    put("app_name", buildJsonObject {
                        put("type", "string")
                        put("description", "Kullanıcıya gösterilecek uygulama adı")
                    })
                    put("reason", buildJsonObject {
                        put("type", "string")
                        put("description", "Durdurma nedeni - kullanıcıya gösterilecek")
                    })
                },
                required = listOf("package_name", "app_name", "reason")
            )
        ),
        ToolDefinition(
            name = "open_app_settings",
            description = "Bir uygulamanın sistem ayarları sayfasını açar. Kullanıcı buradan manuel olarak durdurabilir veya devre dışı bırakabilir.",
            inputSchema = JsonSchema(
                properties = buildJsonObject {
                    put("package_name", buildJsonObject {
                        put("type", "string")
                        put("description", "Ayarları açılacak uygulamanın paket adı")
                    })
                },
                required = listOf("package_name")
            )
        )
    )

    override suspend fun executeTool(toolName: String, toolInput: JsonElement): String {
        return when (toolName) {
            "list_memory_heavy_apps" -> {
                val processes = processScanner.getRunningProcesses()
                if (processes.isEmpty()) return "Arka planda çalışan kullanıcı uygulaması bulunamadı."
                buildJsonArray {
                    processes.take(10).forEach { proc ->
                        add(buildJsonObject {
                            put("app_name", proc.appName)
                            put("package_name", proc.packageName)
                            put("memory_mb", proc.memoryUsageKb / 1024)
                            put("can_stop", true)
                        })
                    }
                }.toString()
            }

            "list_battery_drain_apps" -> {
                val apps = processScanner.getTopUsageApps(24)
                    .filter { !it.isSystemApp }
                if (apps.isEmpty()) return "Son 24 saatte öne çıkan bir kullanım bulunamadı. PACKAGE_USAGE_STATS izni gerekli olabilir."
                buildJsonArray {
                    apps.take(10).forEach { app ->
                        add(buildJsonObject {
                            put("app_name", app.appName)
                            put("package_name", app.packageName)
                            put("foreground_time", processScanner.formatDuration(app.totalForegroundTime))
                            put("last_used", java.text.SimpleDateFormat("HH:mm", java.util.Locale.getDefault())
                                .format(java.util.Date(app.lastUsed)))
                        })
                    }
                }.toString()
            }

            "force_stop_app" -> {
                val packageName = toolInput.getString("package_name")
                    ?: return "Hata: package_name belirtilmedi"
                val appName = toolInput.getString("app_name") ?: packageName
                val reason = toolInput.getString("reason") ?: "Batarya/RAM optimizasyonu"

                // Request user approval before stopping
                val approved = approvalCallback?.invoke(
                    PendingApproval(
                        id = "stop_$packageName",
                        action = "Uygulamayı Durdur",
                        description = "$appName uygulaması durdurulsun mu?",
                        details = mapOf(
                            "Uygulama" to appName,
                            "Paket" to packageName,
                            "Neden" to reason
                        )
                    )
                ) ?: false

                if (!approved) return "İşlem iptal edildi: Kullanıcı onaylamadı."

                val success = processScanner.killBackgroundProcess(packageName)
                if (success) {
                    "$appName başarıyla durduruldu."
                } else {
                    "$appName durdurulamadı. Sistem uygulamaları veya korumalı uygulamalar direkt durdurulamaz. " +
                    "Ayarlar > Uygulamalar > $appName > Zorla Durdur yolunu kullanabilirsiniz."
                }
            }

            "open_app_settings" -> {
                val packageName = toolInput.getString("package_name")
                    ?: return "Hata: package_name belirtilmedi"
                try {
                    val intent = Intent(Settings.ACTION_APPLICATION_DETAILS_SETTINGS).apply {
                        data = Uri.parse("package:$packageName")
                        flags = Intent.FLAG_ACTIVITY_NEW_TASK
                    }
                    context.startActivity(intent)
                    "Uygulama ayarları açıldı. Oradan 'Zorla Durdur' seçeneğini kullanabilirsiniz."
                } catch (e: Exception) {
                    "Ayarlar açılamadı: ${e.message}"
                }
            }

            else -> "Bilinmeyen araç: $toolName"
        }
    }
}
