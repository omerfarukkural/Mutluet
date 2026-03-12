package com.mutluet.optimizer.agent

import android.content.Context
import android.net.Uri
import com.mutluet.optimizer.agent.base.BaseAgent
import com.mutluet.optimizer.data.local.PreferencesDataStore
import com.mutluet.optimizer.data.remote.ClaudeApiService
import com.mutluet.optimizer.data.remote.models.JsonSchema
import com.mutluet.optimizer.data.remote.models.PendingApproval
import com.mutluet.optimizer.data.remote.models.ToolDefinition
import com.mutluet.optimizer.system.PhotoScanner
import dagger.hilt.android.qualifiers.ApplicationContext
import kotlinx.serialization.json.JsonElement
import kotlinx.serialization.json.buildJsonArray
import kotlinx.serialization.json.buildJsonObject
import kotlinx.serialization.json.put
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class PhotoManagerAgent @Inject constructor(
    claudeApiService: ClaudeApiService,
    preferencesDataStore: PreferencesDataStore,
    @ApplicationContext context: Context,
    private val photoScanner: PhotoScanner
) : BaseAgent(claudeApiService, preferencesDataStore, context) {

    override val systemPrompt = """
        Sen Mutluet AI Optimizer'ın fotoğraf yönetim uzmanısın.
        Kullanıcının galerisindeki fotoğrafları analiz eder, benzer/tekrar fotoğrafları gruplar,
        her gruptan en kaliteli olanı seçer ve geri kalanları çöpe taşıma önerisi sunarsın.

        Kalite değerlendirmesi:
        - Çözünürlük (daha yüksek = daha iyi)
        - Dosya boyutu (aynı çözünürlükte daha büyük = az sıkıştırılmış = daha kaliteli)
        - Netlik/bulanıklık skoru (laplacian varyansı)

        ÖNEMLİ: Her silme/çöp işlemi için kullanıcı onayı al. Hangi fotoğrafların silineceğini
        açıkça belirt. Türkçe yanıt ver.
    """.trimIndent()

    override fun getTools(): List<ToolDefinition> = listOf(
        ToolDefinition(
            name = "scan_photos_summary",
            description = "Galerinin özet istatistiklerini döndürür: toplam sayı, toplam boyut, klasörler.",
            inputSchema = JsonSchema(properties = buildJsonObject {}, required = emptyList())
        ),
        ToolDefinition(
            name = "find_similar_photo_groups",
            description = "Yakın zamanda çekilmiş veya benzer içerikli fotoğrafları gruplar ve her grubun en iyisini önerir.",
            inputSchema = JsonSchema(
                properties = buildJsonObject {
                    put("time_window_minutes", buildJsonObject {
                        put("type", "integer")
                        put("description", "Bu süre içinde çekilen fotoğraflar benzer sayılır. Varsayılan: 120")
                    })
                },
                required = emptyList()
            )
        ),
        ToolDefinition(
            name = "get_largest_photos",
            description = "En büyük dosya boyutuna sahip fotoğrafları listeler.",
            inputSchema = JsonSchema(
                properties = buildJsonObject {
                    put("limit", buildJsonObject {
                        put("type", "integer")
                        put("description", "Kaç fotoğraf listeleneceği. Varsayılan: 20")
                    })
                },
                required = emptyList()
            )
        ),
        ToolDefinition(
            name = "trash_photos",
            description = "Belirtilen fotoğrafları çöpe taşır. KULLANICI ONAYI GEREKTİRİR.",
            inputSchema = JsonSchema(
                properties = buildJsonObject {
                    put("photo_uris", buildJsonObject {
                        put("type", "array")
                        put("description", "Çöpe taşınacak fotoğrafların URI listesi")
                    })
                    put("reason", buildJsonObject {
                        put("type", "string")
                        put("description", "İşlemin nedeni - kullanıcıya gösterilecek")
                    })
                },
                required = listOf("photo_uris", "reason")
            )
        )
    )

    override suspend fun executeTool(toolName: String, toolInput: JsonElement): String {
        return when (toolName) {
            "scan_photos_summary" -> {
                val photos = photoScanner.scanAllPhotos()
                val totalSize = photos.sumOf { it.size }
                val buckets = photos.groupBy { it.bucketName }

                buildJsonObject {
                    put("total_photos", photos.size)
                    put("total_size", photoScanner.formatSize(totalSize))
                    put("total_size_bytes", totalSize)
                    put("folders", buildJsonArray {
                        buckets.entries.sortedByDescending { it.value.size }.take(10).forEach { (name, list) ->
                            add(buildJsonObject {
                                put("name", name)
                                put("count", list.size)
                                put("size", photoScanner.formatSize(list.sumOf { it.size }))
                            })
                        }
                    })
                }.toString()
            }

            "find_similar_photo_groups" -> {
                val windowMinutes = toolInput.getLong("time_window_minutes")?.toInt() ?: 120
                val photos = photoScanner.scanAllPhotos()
                val groups = photoScanner.groupSimilarPhotos(photos, windowMinutes)

                if (groups.isEmpty()) {
                    return "Benzer fotoğraf grubu bulunamadı. Galeri zaten iyi organize edilmiş görünüyor."
                }

                val potentialSavings = groups.sumOf { group ->
                    group.photos.drop(1).sumOf { it.size }  // All except best
                }

                buildJsonObject {
                    put("group_count", groups.size)
                    put("potential_savings", photoScanner.formatSize(potentialSavings))
                    put("groups", buildJsonArray {
                        groups.take(20).forEach { group ->
                            add(buildJsonObject {
                                put("photo_count", group.photos.size)
                                put("best_photo_uri", group.bestPhotoUri.toString())
                                put("best_photo_score", "%.0f%%".format(group.photos.first().qualityScore * 100))
                                put("photos_to_trash", buildJsonArray {
                                    group.photos.drop(1).forEach { p ->
                                        add(buildJsonObject {
                                            put("uri", p.uri.toString())
                                            put("name", p.displayName)
                                            put("size", photoScanner.formatSize(p.size))
                                            put("quality_score", "%.0f%%".format(p.qualityScore * 100))
                                        })
                                    }
                                })
                                put("reason", group.similarityReason)
                            })
                        }
                    })
                }.toString()
            }

            "get_largest_photos" -> {
                val limit = toolInput.getLong("limit")?.toInt() ?: 20
                val photos = photoScanner.scanAllPhotos()
                    .sortedByDescending { it.size }
                    .take(limit)

                buildJsonArray {
                    photos.forEach { p ->
                        add(buildJsonObject {
                            put("uri", p.uri.toString())
                            put("name", p.displayName)
                            put("size", photoScanner.formatSize(p.size))
                            put("resolution", "${p.width}x${p.height}")
                            put("folder", p.bucketName)
                        })
                    }
                }.toString()
            }

            "trash_photos" -> {
                val uriStrings = toolInput.getStringList("photo_uris")
                val reason = toolInput.getString("reason") ?: "Fotoğraf optimizasyonu"

                if (uriStrings.isEmpty()) return "Hata: URI listesi boş"

                val approved = approvalCallback?.invoke(
                    PendingApproval(
                        id = "trash_photos_${System.currentTimeMillis()}",
                        action = "Fotoğrafları Çöpe Taşı",
                        description = "${uriStrings.size} fotoğraf çöpe taşınacak. Geri yükleme mümkündür.",
                        details = mapOf(
                            "Fotoğraf Sayısı" to "${uriStrings.size}",
                            "Neden" to reason,
                            "Not" to "Android 11+ sistemde geri alınabilir"
                        )
                    )
                ) ?: false

                if (!approved) return "İşlem iptal edildi."

                var successCount = 0
                uriStrings.forEach { uriStr ->
                    try {
                        val uri = Uri.parse(uriStr)
                        if (photoScanner.trashPhoto(uri)) successCount++
                    } catch (_: Exception) {}
                }
                "$successCount/${uriStrings.size} fotoğraf başarıyla çöpe taşındı."
            }

            else -> "Bilinmeyen araç: $toolName"
        }
    }
}
