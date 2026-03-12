package com.mutluet.optimizer.agent

import android.content.Context
import com.mutluet.optimizer.agent.base.BaseAgent
import com.mutluet.optimizer.data.local.PreferencesDataStore
import com.mutluet.optimizer.data.remote.ClaudeApiService
import com.mutluet.optimizer.data.remote.models.JsonSchema
import com.mutluet.optimizer.data.remote.models.PendingApproval
import com.mutluet.optimizer.data.remote.models.ToolDefinition
import com.mutluet.optimizer.system.FileOrganizer
import dagger.hilt.android.qualifiers.ApplicationContext
import kotlinx.serialization.json.JsonElement
import kotlinx.serialization.json.buildJsonArray
import kotlinx.serialization.json.buildJsonObject
import kotlinx.serialization.json.put
import java.io.File
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class FileOrganizationAgent @Inject constructor(
    claudeApiService: ClaudeApiService,
    preferencesDataStore: PreferencesDataStore,
    @ApplicationContext context: Context,
    private val fileOrganizer: FileOrganizer
) : BaseAgent(claudeApiService, preferencesDataStore, context) {

    override val systemPrompt = """
        Sen Mutluet AI Optimizer'ın dosya organizasyon uzmanısın.
        İndirilenler klasörü ve diğer dizinlerdeki dosyaları MIME türüne göre otomatik
        klasörlere taşıyarak düzenlersin.

        Organizasyon yapısı:
        - Fotoğraflar/ → resimler
        - Videolar/ → video dosyaları
        - Müzik/ → ses dosyaları
        - Belgeler/PDF, Word, Excel, PowerPoint → belgeler
        - Arşivler/ → zip, rar, 7z
        - APK'lar/ → android uygulama paketleri
        - Diğer/ → tanımlanamayan dosyalar

        Her taşıma işlemi için kullanıcı onayı al. Türkçe yanıt ver.
    """.trimIndent()

    override fun getTools(): List<ToolDefinition> = listOf(
        ToolDefinition(
            name = "analyze_downloads_folder",
            description = "İndirilenler klasörünü analiz eder ve ne kadar dosyanın organize edilebileceğini gösterir.",
            inputSchema = JsonSchema(properties = buildJsonObject {}, required = emptyList())
        ),
        ToolDefinition(
            name = "create_organization_plan",
            description = "Dosyaların nereye taşınacağını gösteren bir plan oluşturur (taşımaz, sadece planlar).",
            inputSchema = JsonSchema(properties = buildJsonObject {}, required = emptyList())
        ),
        ToolDefinition(
            name = "execute_organization",
            description = "Organizasyon planını uygular. KULLANICI ONAYI GEREKTİRİR.",
            inputSchema = JsonSchema(properties = buildJsonObject {}, required = emptyList())
        )
    )

    private var cachedPlan: com.mutluet.optimizer.system.OrganizationPlan? = null

    override suspend fun executeTool(toolName: String, toolInput: JsonElement): String {
        return when (toolName) {
            "analyze_downloads_folder" -> {
                val plan = fileOrganizer.buildOrganizationPlan()
                cachedPlan = plan

                if (plan.totalFiles == 0) {
                    return "İndirilenler klasörü boş veya erişilemiyor."
                }

                buildJsonObject {
                    put("total_files", plan.totalFiles)
                    put("folders_to_create", plan.estimatedNewStructure.size)
                    put("distribution", buildJsonArray {
                        plan.estimatedNewStructure.entries.sortedByDescending { it.value }.forEach { (folder, count) ->
                            add(buildJsonObject {
                                put("folder", folder)
                                put("file_count", count)
                            })
                        }
                    })
                }.toString()
            }

            "create_organization_plan" -> {
                val plan = cachedPlan ?: fileOrganizer.buildOrganizationPlan().also { cachedPlan = it }
                if (plan.moves.isEmpty()) return "Organize edilecek dosya bulunamadı."

                buildJsonArray {
                    plan.moves.take(50).forEach { move ->
                        add(buildJsonObject {
                            put("file", move.fileName)
                            put("from", move.sourcePath)
                            put("to", move.destinationPath)
                        })
                    }
                }.toString() + if (plan.moves.size > 50) "\n... ve ${plan.moves.size - 50} dosya daha" else ""
            }

            "execute_organization" -> {
                val plan = cachedPlan ?: fileOrganizer.buildOrganizationPlan().also { cachedPlan = it }
                if (plan.moves.isEmpty()) return "Organize edilecek dosya bulunamadı."

                val approved = approvalCallback?.invoke(
                    PendingApproval(
                        id = "organize_files_${System.currentTimeMillis()}",
                        action = "Dosyaları Organize Et",
                        description = "${plan.totalFiles} dosya türlerine göre klasörlere taşınacak.",
                        details = mapOf(
                            "Toplam Dosya" to "${plan.totalFiles}",
                            "Oluşturulacak Klasör" to "${plan.estimatedNewStructure.size}",
                            "Kaynak" to "İndirilenler klasörü",
                            "Hedef" to "Organized/ klasörü"
                        )
                    )
                ) ?: false

                if (!approved) return "İşlem iptal edildi."

                val (success, failed) = fileOrganizer.executeMoves(plan.moves)
                cachedPlan = null
                "$success dosya başarıyla organize edildi.${if (failed > 0) " $failed dosya taşınamadı." else ""}"
            }

            else -> "Bilinmeyen araç: $toolName"
        }
    }
}
