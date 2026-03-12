package com.mutluet.optimizer.agent

import com.mutluet.optimizer.data.remote.models.AgentEvent
import com.mutluet.optimizer.data.remote.models.PendingApproval
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.emitAll
import kotlinx.coroutines.flow.flow
import javax.inject.Inject
import javax.inject.Singleton

/**
 * Routes user commands to the appropriate specialist agent based on intent detection.
 */
@Singleton
class AgentOrchestrator @Inject constructor(
    private val phoneOptimizationAgent: PhoneOptimizationAgent,
    private val processManagerAgent: ProcessManagerAgent,
    private val photoManagerAgent: PhotoManagerAgent,
    private val fileOrganizationAgent: FileOrganizationAgent,
    private val storageCleanupAgent: StorageCleanupAgent,
    private val devEnvironmentAgent: DevEnvironmentAgent
) {
    var approvalCallback: (suspend (PendingApproval) -> Boolean)? = null
        set(value) {
            field = value
            // Propagate to all agents
            phoneOptimizationAgent.approvalCallback = value
            processManagerAgent.approvalCallback = value
            photoManagerAgent.approvalCallback = value
            fileOrganizationAgent.approvalCallback = value
            storageCleanupAgent.approvalCallback = value
            devEnvironmentAgent.approvalCallback = value
        }

    fun processMessage(userMessage: String): Flow<AgentEvent> = flow {
        val intent = detectIntent(userMessage.lowercase())
        val agent = when (intent) {
            Intent.PHOTO -> photoManagerAgent
            Intent.STORAGE -> storageCleanupAgent
            Intent.FILE_ORGANIZE -> fileOrganizationAgent
            Intent.PROCESS -> processManagerAgent
            Intent.OPTIMIZE -> phoneOptimizationAgent
            Intent.DEV_ENV -> devEnvironmentAgent
            Intent.GENERAL -> phoneOptimizationAgent  // Default fallback
        }
        emitAll(agent.run(userMessage))
    }

    private fun detectIntent(message: String): Intent {
        return when {
            message.containsAny("fotoğraf", "resim", "foto", "galeri", "image", "photo", "picture",
                "benzer fotoğraf", "duplicate foto", "selfie") -> Intent.PHOTO

            message.containsAny("geliştirme", "development", "android studio", "termux",
                "sdk", "deploy", "build", "apk", "gradle", "kotlin", "java",
                "programlama", "kod", "uygulama geliştir", "dev env") -> Intent.DEV_ENV

            message.containsAny("uygulama durdur", "process", "süreç", "arka plan",
                "background", "çalışan uygulama", "running app", "kill", "durdur",
                "kapat", "cpu tüket", "ram tüket", "pil tüket") -> Intent.PROCESS

            message.containsAny("depolama", "storage", "yer aç", "temizle", "cache",
                "önbellek", "büyük dosya", "gereksiz", "junk", "clean", "disk") -> Intent.STORAGE

            message.containsAny("dosya organize", "dosyaları düzenle", "klasörle",
                "file organize", "organize dosya", "belgeler", "indir", "download") -> Intent.FILE_ORGANIZE

            message.containsAny("optimize", "hızlandır", "batarya", "pil", "ram",
                "bellek", "yavaş", "ısın", "sıcak", "performans", "speed up",
                "battery", "memory", "optimize et") -> Intent.OPTIMIZE

            else -> Intent.GENERAL
        }
    }

    private fun String.containsAny(vararg keywords: String): Boolean =
        keywords.any { this.contains(it) }

    private enum class Intent {
        PHOTO, STORAGE, FILE_ORGANIZE, PROCESS, OPTIMIZE, DEV_ENV, GENERAL
    }
}
