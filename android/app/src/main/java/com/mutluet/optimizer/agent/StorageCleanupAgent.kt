package com.mutluet.optimizer.agent

import android.content.Context
import com.mutluet.optimizer.agent.base.BaseAgent
import com.mutluet.optimizer.data.local.PreferencesDataStore
import com.mutluet.optimizer.data.remote.ClaudeApiService
import com.mutluet.optimizer.data.remote.models.JsonSchema
import com.mutluet.optimizer.data.remote.models.PendingApproval
import com.mutluet.optimizer.data.remote.models.ToolDefinition
import com.mutluet.optimizer.system.StorageScanner
import dagger.hilt.android.qualifiers.ApplicationContext
import kotlinx.serialization.json.JsonElement
import kotlinx.serialization.json.buildJsonArray
import kotlinx.serialization.json.buildJsonObject
import kotlinx.serialization.json.put
import java.io.File
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class StorageCleanupAgent @Inject constructor(
    claudeApiService: ClaudeApiService,
    preferencesDataStore: PreferencesDataStore,
    @ApplicationContext context: Context,
    private val storageScanner: StorageScanner
) : BaseAgent(claudeApiService, preferencesDataStore, context) {

    override val systemPrompt = """
        Sen Mutluet AI Optimizer'ın depolama temizleme uzmanısın.
        Kullanıcının telefon depolama alanını analiz eder, gereksiz dosyaları ve önbellekleri
        tespit eder ve kullanıcı onayıyla temizlersin.

        Her silme işlemi MUTLAKA kullanıcı onayına ihtiyaç duyar.
        Sistem dosyalarına, APK'lara ve kullanıcı belgelere dokunmadan önce uyar.
        Türkçe yanıt ver.
    """.trimIndent()

    override fun getTools(): List<ToolDefinition> = listOf(
        ToolDefinition(
            name = "get_storage_overview",
            description = "Depolama alanı kullanımının genel özetini döndürür.",
            inputSchema = JsonSchema(properties = buildJsonObject {}, required = emptyList())
        ),
        ToolDefinition(
            name = "list_large_files",
            description = "Belirli boyutun üzerindeki büyük dosyaları listeler.",
            inputSchema = JsonSchema(
                properties = buildJsonObject {
                    put("min_size_mb", buildJsonObject {
                        put("type", "number")
                        put("description", "Minimum dosya boyutu MB cinsinden. Varsayılan: 50")
                    })
                },
                required = emptyList()
            )
        ),
        ToolDefinition(
            name = "list_cache_dirs",
            description = "Temizlenebilir önbellek dizinlerini ve boyutlarını listeler.",
            inputSchema = JsonSchema(properties = buildJsonObject {}, required = emptyList())
        ),
        ToolDefinition(
            name = "find_duplicate_files",
            description = "SHA-256 hash ile aynı içeriğe sahip tekrar dosyaları bulur.",
            inputSchema = JsonSchema(properties = buildJsonObject {}, required = emptyList())
        ),
        ToolDefinition(
            name = "delete_files",
            description = "Belirtilen dosya/dizinleri siler. KULLANICI ONAYI GEREKTİRİR.",
            inputSchema = JsonSchema(
                properties = buildJsonObject {
                    put("paths", buildJsonObject {
                        put("type", "array")
                        put("description", "Silinecek dosya/dizin yolları")
                    })
                    put("reason", buildJsonObject {
                        put("type", "string")
                        put("description", "Silme nedeni")
                    })
                },
                required = listOf("paths", "reason")
            )
        )
    )

    override suspend fun executeTool(toolName: String, toolInput: JsonElement): String {
        return when (toolName) {
            "get_storage_overview" -> {
                val breakdown = storageScanner.getStorageBreakdown()
                val usagePercent = ((breakdown.usedBytes.toDouble() / breakdown.totalBytes) * 100).toInt()
                buildJsonObject {
                    put("total", storageScanner.formatSize(breakdown.totalBytes))
                    put("used", storageScanner.formatSize(breakdown.usedBytes))
                    put("free", storageScanner.formatSize(breakdown.freeBytes))
                    put("usage_percent", usagePercent)
                    put("cache_size", storageScanner.formatSize(breakdown.cacheBytes))
                    put("status", when {
                        usagePercent > 90 -> "Kritik - Depolama dolu!"
                        usagePercent > 75 -> "Uyarı - Depolama dolmak üzere"
                        else -> "Normal"
                    })
                }.toString()
            }

            "list_large_files" -> {
                val minMb = toolInput.getLong("min_size_mb")?.toFloat() ?: 50f
                val files = storageScanner.listLargeFiles(minMb)
                if (files.isEmpty()) return "Bu boyutun üzerinde dosya bulunamadı. İzin gerekebilir."
                buildJsonArray {
                    files.take(30).forEach { f ->
                        add(buildJsonObject {
                            put("path", f.path)
                            put("name", f.name)
                            put("size", storageScanner.formatSize(f.sizeBytes))
                            put("mime_type", f.mimeType)
                            put("last_modified", java.text.SimpleDateFormat("dd/MM/yyyy", java.util.Locale.getDefault())
                                .format(java.util.Date(f.lastModified)))
                        })
                    }
                }.toString()
            }

            "list_cache_dirs" -> {
                val caches = storageScanner.listCacheDirs()
                val totalCache = caches.sumOf { it.sizeBytes }
                buildJsonObject {
                    put("total_cache", storageScanner.formatSize(totalCache))
                    put("directories", buildJsonArray {
                        caches.take(20).forEach { d ->
                            add(buildJsonObject {
                                put("path", d.path)
                                put("size", storageScanner.formatSize(d.sizeBytes))
                            })
                        }
                    })
                }.toString()
            }

            "find_duplicate_files" -> {
                val duplicates = storageScanner.findDuplicateFiles()
                if (duplicates.isEmpty()) return "Tekrar dosya bulunamadı."
                val totalWasted = duplicates.values.sumOf { files ->
                    files.drop(1).sumOf { it.sizeBytes }
                }
                buildJsonObject {
                    put("duplicate_groups", duplicates.size)
                    put("wasted_space", storageScanner.formatSize(totalWasted))
                    put("groups", buildJsonArray {
                        duplicates.entries.take(20).forEach { (_, files) ->
                            add(buildJsonObject {
                                put("file_count", files.size)
                                put("size_each", storageScanner.formatSize(files.first().sizeBytes))
                                put("wasted", storageScanner.formatSize(files.drop(1).sumOf { it.sizeBytes }))
                                put("copies", buildJsonArray {
                                    files.forEach { f ->
                                        add(buildJsonObject {
                                            put("path", f.path)
                                            put("name", f.name)
                                        })
                                    }
                                })
                            })
                        }
                    })
                }.toString()
            }

            "delete_files" -> {
                val paths = toolInput.getStringList("paths")
                val reason = toolInput.getString("reason") ?: "Depolama temizleme"

                if (paths.isEmpty()) return "Hata: Silinecek dosya listesi boş"

                val totalSize = paths.sumOf {
                    try { File(it).length() } catch (_: Exception) { 0L }
                }

                val approved = approvalCallback?.invoke(
                    PendingApproval(
                        id = "delete_files_${System.currentTimeMillis()}",
                        action = "Dosyaları Sil",
                        description = "${paths.size} dosya/dizin kalıcı olarak silinecek.",
                        details = mapOf(
                            "Dosya Sayısı" to "${paths.size}",
                            "Toplam Boyut" to storageScanner.formatSize(totalSize),
                            "Neden" to reason,
                            "Uyarı" to "Bu işlem GERİ ALINAMAZ!"
                        )
                    )
                ) ?: false

                if (!approved) return "İşlem iptal edildi."

                var success = 0
                var failed = 0
                paths.forEach { path ->
                    if (storageScanner.deleteFile(path)) success++ else failed++
                }
                "$success/${paths.size} dosya silindi. ${if (failed > 0) "$failed silinemedi." else ""}"
            }

            else -> "Bilinmeyen araç: $toolName"
        }
    }
}
