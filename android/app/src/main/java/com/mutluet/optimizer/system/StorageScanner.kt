package com.mutluet.optimizer.system

import android.app.usage.StorageStatsManager
import android.content.Context
import android.content.pm.PackageManager
import android.os.Environment
import android.os.StatFs
import android.os.storage.StorageManager
import dagger.hilt.android.qualifiers.ApplicationContext
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import java.io.File
import javax.inject.Inject
import javax.inject.Singleton

data class StorageBreakdown(
    val totalBytes: Long,
    val usedBytes: Long,
    val freeBytes: Long,
    val appDataBytes: Long,
    val mediaBytes: Long,
    val cacheBytes: Long
)

data class FileItem(
    val path: String,
    val name: String,
    val sizeBytes: Long,
    val lastModified: Long,
    val mimeType: String,
    val isDirectory: Boolean
)

data class AppStorageInfo(
    val packageName: String,
    val appName: String,
    val appBytes: Long,
    val cacheBytes: Long,
    val dataBytes: Long
)

@Singleton
class StorageScanner @Inject constructor(
    @ApplicationContext private val context: Context
) {
    private val packageManager = context.packageManager

    /**
     * Returns overall storage breakdown.
     */
    suspend fun getStorageBreakdown(): StorageBreakdown = withContext(Dispatchers.IO) {
        val stat = StatFs(Environment.getDataDirectory().path)
        val externalStat = StatFs(Environment.getExternalStorageDirectory().path)

        val totalBytes = externalStat.totalBytes
        val freeBytes = externalStat.availableBytes
        val usedBytes = totalBytes - freeBytes

        StorageBreakdown(
            totalBytes = totalBytes,
            usedBytes = usedBytes,
            freeBytes = freeBytes,
            appDataBytes = stat.usedBytes,
            mediaBytes = 0L,  // Approximated below
            cacheBytes = getTotalCacheSize()
        )
    }

    /**
     * Lists large files recursively from external storage.
     */
    suspend fun listLargeFiles(minSizeMb: Float = 10f): List<FileItem> = withContext(Dispatchers.IO) {
        val minBytes = (minSizeMb * 1024 * 1024).toLong()
        val results = mutableListOf<FileItem>()

        try {
            val root = Environment.getExternalStorageDirectory()
            root.walkTopDown()
                .filter { !it.isDirectory && it.length() >= minBytes }
                .sortedByDescending { it.length() }
                .take(100)
                .forEach { file ->
                    results.add(
                        FileItem(
                            path = file.absolutePath,
                            name = file.name,
                            sizeBytes = file.length(),
                            lastModified = file.lastModified(),
                            mimeType = getMimeType(file),
                            isDirectory = false
                        )
                    )
                }
        } catch (_: Exception) {}

        results
    }

    /**
     * Lists cache directories across apps.
     */
    suspend fun listCacheDirs(): List<FileItem> = withContext(Dispatchers.IO) {
        val items = mutableListOf<FileItem>()

        // App's own cache
        context.cacheDir?.let { items.add(toFileItem(it)) }
        context.externalCacheDir?.let { items.add(toFileItem(it)) }

        // Common cache locations
        val externalRoot = Environment.getExternalStorageDirectory()
        listOf(
            File(externalRoot, "Android/data"),
        ).forEach { dir ->
            if (dir.exists() && dir.isDirectory) {
                dir.listFiles()?.forEach { appDir ->
                    val cache = File(appDir, "cache")
                    if (cache.exists()) {
                        items.add(toFileItem(cache))
                    }
                }
            }
        }

        items.sortedByDescending { it.sizeBytes }
    }

    /**
     * Finds duplicate files by SHA-256 hash.
     */
    suspend fun findDuplicateFiles(directory: File = Environment.getExternalStorageDirectory()): Map<String, List<FileItem>> =
        withContext(Dispatchers.IO) {
            val hashMap = mutableMapOf<String, MutableList<FileItem>>()

            try {
                directory.walkTopDown()
                    .filter { !it.isDirectory && it.length() > 1024 }  // Skip tiny files
                    .take(1000)  // Safety limit
                    .forEach { file ->
                        val hash = computeSha256(file)
                        if (hash != null) {
                            hashMap.getOrPut(hash) { mutableListOf() }.add(toFileItem(file))
                        }
                    }
            } catch (_: Exception) {}

            // Only return entries with duplicates
            hashMap.filter { it.value.size > 1 }
        }

    private fun computeSha256(file: File): String? {
        return try {
            val digest = java.security.MessageDigest.getInstance("SHA-256")
            file.inputStream().use { stream ->
                val buffer = ByteArray(8192)
                var read: Int
                while (stream.read(buffer).also { read = it } != -1) {
                    digest.update(buffer, 0, read)
                }
            }
            digest.digest().joinToString("") { "%02x".format(it) }
        } catch (_: Exception) { null }
    }

    private fun getTotalCacheSize(): Long {
        var total = 0L
        try {
            context.cacheDir?.let { total += dirSize(it) }
            context.externalCacheDir?.let { total += dirSize(it) }
        } catch (_: Exception) {}
        return total
    }

    private fun dirSize(dir: File): Long {
        var size = 0L
        try {
            dir.walkTopDown().filter { !it.isDirectory }.forEach { size += it.length() }
        } catch (_: Exception) {}
        return size
    }

    private fun toFileItem(file: File): FileItem {
        val size = if (file.isDirectory) dirSize(file) else file.length()
        return FileItem(
            path = file.absolutePath,
            name = file.name,
            sizeBytes = size,
            lastModified = file.lastModified(),
            mimeType = if (file.isDirectory) "directory" else getMimeType(file),
            isDirectory = file.isDirectory
        )
    }

    private fun getMimeType(file: File): String {
        val ext = file.extension.lowercase()
        return android.webkit.MimeTypeMap.getSingleton().getMimeTypeFromExtension(ext) ?: "application/octet-stream"
    }

    /**
     * Deletes a file or directory recursively.
     */
    suspend fun deleteFile(path: String): Boolean = withContext(Dispatchers.IO) {
        try {
            val file = File(path)
            if (file.isDirectory) file.deleteRecursively() else file.delete()
        } catch (_: Exception) { false }
    }

    fun formatSize(bytes: Long): String = when {
        bytes >= 1_073_741_824 -> "%.1f GB".format(bytes / 1_073_741_824.0)
        bytes >= 1_048_576 -> "%.1f MB".format(bytes / 1_048_576.0)
        bytes >= 1024 -> "%.0f KB".format(bytes / 1024.0)
        else -> "$bytes B"
    }
}
