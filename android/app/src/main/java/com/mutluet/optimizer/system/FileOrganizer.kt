package com.mutluet.optimizer.system

import android.content.Context
import android.os.Environment
import android.webkit.MimeTypeMap
import dagger.hilt.android.qualifiers.ApplicationContext
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import java.io.File
import javax.inject.Inject
import javax.inject.Singleton

data class OrganizationPlan(
    val moves: List<FileMoveAction>,
    val totalFiles: Int,
    val estimatedNewStructure: Map<String, Int>  // folder → file count
)

data class FileMoveAction(
    val sourcePath: String,
    val destinationPath: String,
    val fileName: String,
    val sizeBytes: Long
)

@Singleton
class FileOrganizer @Inject constructor(
    @ApplicationContext private val context: Context
) {
    companion object {
        // MIME type prefix → target folder under /sdcard/Organized/
        private val MIME_TO_FOLDER = mapOf(
            "image/" to "Organized/Fotoğraflar",
            "video/" to "Organized/Videolar",
            "audio/" to "Organized/Müzik",
            "application/pdf" to "Organized/Belgeler/PDF",
            "application/msword" to "Organized/Belgeler/Word",
            "application/vnd.openxmlformats-officedocument.wordprocessingml" to "Organized/Belgeler/Word",
            "application/vnd.ms-excel" to "Organized/Belgeler/Excel",
            "application/vnd.openxmlformats-officedocument.spreadsheetml" to "Organized/Belgeler/Excel",
            "application/vnd.ms-powerpoint" to "Organized/Belgeler/PowerPoint",
            "text/" to "Organized/Belgeler/Metin",
            "application/zip" to "Organized/Arşivler",
            "application/x-rar-compressed" to "Organized/Arşivler",
            "application/x-7z-compressed" to "Organized/Arşivler",
            "application/vnd.android.package-archive" to "Organized/APK'lar"
        )
    }

    /**
     * Analyzes the Download folder and generates an organization plan (no moves yet).
     */
    suspend fun buildOrganizationPlan(sourceDir: File? = null): OrganizationPlan = withContext(Dispatchers.IO) {
        val root = sourceDir ?: Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_DOWNLOADS)
        val moves = mutableListOf<FileMoveAction>()
        val destCounts = mutableMapOf<String, Int>()

        try {
            root.walkTopDown()
                .filter { !it.isDirectory }
                .forEach { file ->
                    val destFolder = getDestinationFolder(file)
                    val destPath = "${Environment.getExternalStorageDirectory().path}/$destFolder/${file.name}"
                    moves.add(FileMoveAction(
                        sourcePath = file.absolutePath,
                        destinationPath = destPath,
                        fileName = file.name,
                        sizeBytes = file.length()
                    ))
                    destCounts[destFolder] = (destCounts[destFolder] ?: 0) + 1
                }
        } catch (_: Exception) {}

        OrganizationPlan(
            moves = moves,
            totalFiles = moves.size,
            estimatedNewStructure = destCounts
        )
    }

    /**
     * Executes the moves from a plan.
     */
    suspend fun executeMoves(moves: List<FileMoveAction>): Pair<Int, Int> = withContext(Dispatchers.IO) {
        var success = 0
        var failed = 0
        moves.forEach { action ->
            try {
                val src = File(action.sourcePath)
                val dest = File(action.destinationPath)
                dest.parentFile?.mkdirs()
                if (src.renameTo(dest)) success++ else failed++
            } catch (_: Exception) {
                failed++
            }
        }
        Pair(success, failed)
    }

    private fun getDestinationFolder(file: File): String {
        val ext = file.extension.lowercase()
        val mimeType = MimeTypeMap.getSingleton().getMimeTypeFromExtension(ext) ?: ""

        for ((prefix, folder) in MIME_TO_FOLDER) {
            if (mimeType.startsWith(prefix)) return folder
        }
        return "Organized/Diğer"
    }
}
