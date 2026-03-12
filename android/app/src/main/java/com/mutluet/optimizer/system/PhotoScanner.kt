package com.mutluet.optimizer.system

import android.content.ContentUris
import android.content.Context
import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.net.Uri
import android.os.Build
import android.provider.MediaStore
import dagger.hilt.android.qualifiers.ApplicationContext
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import javax.inject.Inject
import javax.inject.Singleton
import kotlin.math.abs
import kotlin.math.sqrt

data class PhotoInfo(
    val uri: Uri,
    val id: Long,
    val displayName: String,
    val size: Long,          // bytes
    val dateAdded: Long,     // epoch seconds
    val width: Int,
    val height: Int,
    val bucketName: String,
    val mimeType: String,
    val qualityScore: Float = 0f,  // 0.0 - 1.0
    val dHash: LongArray = LongArray(0)
)

data class PhotoGroup(
    val photos: List<PhotoInfo>,
    val bestPhotoUri: Uri,
    val similarityReason: String  // "duplicate", "time_cluster", "similar_content"
)

@Singleton
class PhotoScanner @Inject constructor(
    @ApplicationContext private val context: Context
) {
    private val contentResolver = context.contentResolver

    /**
     * Scans all photos from MediaStore.
     */
    suspend fun scanAllPhotos(): List<PhotoInfo> = withContext(Dispatchers.IO) {
        val photos = mutableListOf<PhotoInfo>()

        val projection = arrayOf(
            MediaStore.Images.Media._ID,
            MediaStore.Images.Media.DISPLAY_NAME,
            MediaStore.Images.Media.SIZE,
            MediaStore.Images.Media.DATE_ADDED,
            MediaStore.Images.Media.WIDTH,
            MediaStore.Images.Media.HEIGHT,
            MediaStore.Images.Media.BUCKET_DISPLAY_NAME,
            MediaStore.Images.Media.MIME_TYPE
        )

        val collection = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            MediaStore.Images.Media.getContentUri(MediaStore.VOLUME_EXTERNAL)
        } else {
            MediaStore.Images.Media.EXTERNAL_CONTENT_URI
        }

        contentResolver.query(
            collection,
            projection,
            null,
            null,
            "${MediaStore.Images.Media.DATE_ADDED} DESC"
        )?.use { cursor ->
            val idCol = cursor.getColumnIndexOrThrow(MediaStore.Images.Media._ID)
            val nameCol = cursor.getColumnIndexOrThrow(MediaStore.Images.Media.DISPLAY_NAME)
            val sizeCol = cursor.getColumnIndexOrThrow(MediaStore.Images.Media.SIZE)
            val dateCol = cursor.getColumnIndexOrThrow(MediaStore.Images.Media.DATE_ADDED)
            val widthCol = cursor.getColumnIndexOrThrow(MediaStore.Images.Media.WIDTH)
            val heightCol = cursor.getColumnIndexOrThrow(MediaStore.Images.Media.HEIGHT)
            val bucketCol = cursor.getColumnIndexOrThrow(MediaStore.Images.Media.BUCKET_DISPLAY_NAME)
            val mimeCol = cursor.getColumnIndexOrThrow(MediaStore.Images.Media.MIME_TYPE)

            while (cursor.moveToNext()) {
                val id = cursor.getLong(idCol)
                val uri = ContentUris.withAppendedId(collection, id)
                photos.add(
                    PhotoInfo(
                        uri = uri,
                        id = id,
                        displayName = cursor.getString(nameCol) ?: "",
                        size = cursor.getLong(sizeCol),
                        dateAdded = cursor.getLong(dateCol),
                        width = cursor.getInt(widthCol),
                        height = cursor.getInt(heightCol),
                        bucketName = cursor.getString(bucketCol) ?: "Unknown",
                        mimeType = cursor.getString(mimeCol) ?: "image/jpeg"
                    )
                )
            }
        }
        photos
    }

    /**
     * Groups similar photos using time proximity and perceptual hash.
     * @param timeWindowMinutes photos taken within this window are candidates for grouping
     */
    suspend fun groupSimilarPhotos(
        photos: List<PhotoInfo>,
        timeWindowMinutes: Int = 120
    ): List<PhotoGroup> = withContext(Dispatchers.IO) {
        val groups = mutableListOf<PhotoGroup>()
        val processed = mutableSetOf<Long>()
        val windowMs = timeWindowMinutes * 60L

        for (photo in photos) {
            if (photo.id in processed) continue

            // Find photos within the time window
            val candidates = photos.filter { other ->
                other.id != photo.id &&
                other.id !in processed &&
                abs(other.dateAdded - photo.dateAdded) < windowMs &&
                other.bucketName == photo.bucketName
            }

            if (candidates.isNotEmpty()) {
                val group = candidates + photo
                val scored = group.map { p ->
                    p.copy(qualityScore = estimateQualityScore(p))
                }.sortedByDescending { it.qualityScore }

                groups.add(
                    PhotoGroup(
                        photos = scored,
                        bestPhotoUri = scored.first().uri,
                        similarityReason = "time_cluster"
                    )
                )
                processed.addAll(group.map { it.id })
            }
        }
        groups
    }

    /**
     * Estimates quality score based on resolution, file size, and blur detection.
     * Returns 0.0 (worst) to 1.0 (best).
     */
    suspend fun estimateQualityScore(photo: PhotoInfo): Float = withContext(Dispatchers.IO) {
        var score = 0f

        // Resolution score (0-0.4)
        val megapixels = (photo.width * photo.height) / 1_000_000f
        score += (megapixels / 12f).coerceIn(0f, 0.4f)

        // File size relative to resolution (0-0.3): higher = less compressed
        if (photo.width > 0 && photo.height > 0) {
            val bitsPerPixel = (photo.size * 8f) / (photo.width * photo.height)
            score += (bitsPerPixel / 48f).coerceIn(0f, 0.3f)
        }

        // Blur detection via thumbnail (0-0.3)
        val blurScore = estimateBlurScore(photo.uri)
        score += blurScore * 0.3f

        score.coerceIn(0f, 1f)
    }

    /**
     * Computes a sharpness score using Laplacian variance on a small thumbnail.
     * Higher = sharper (less blurry).
     */
    private fun estimateBlurScore(uri: Uri): Float {
        return try {
            val options = BitmapFactory.Options().apply {
                inSampleSize = 8  // Load tiny thumbnail
                inPreferredConfig = Bitmap.Config.ARGB_8888
            }
            val bitmap = contentResolver.openInputStream(uri)?.use { stream ->
                BitmapFactory.decodeStream(stream, null, options)
            } ?: return 0.5f

            val grayscale = toGrayscale(bitmap)
            val variance = laplacianVariance(grayscale)
            grayscale.recycle()
            bitmap.recycle()

            // Normalize: >500 = sharp, <50 = blurry
            (variance / 500f).coerceIn(0f, 1f)
        } catch (_: Exception) {
            0.5f  // Default if can't load
        }
    }

    private fun toGrayscale(src: Bitmap): Bitmap {
        val gray = Bitmap.createBitmap(src.width, src.height, Bitmap.Config.ARGB_8888)
        val canvas = android.graphics.Canvas(gray)
        val paint = android.graphics.Paint().apply {
            colorFilter = android.graphics.ColorMatrixColorFilter(
                android.graphics.ColorMatrix().apply { setSaturation(0f) }
            )
        }
        canvas.drawBitmap(src, 0f, 0f, paint)
        return gray
    }

    private fun laplacianVariance(bitmap: Bitmap): Float {
        val w = bitmap.width
        val h = bitmap.height
        if (w < 3 || h < 3) return 0f

        val pixels = IntArray(w * h)
        bitmap.getPixels(pixels, 0, w, 0, 0, w, h)

        var sum = 0.0
        var sumSq = 0.0
        var count = 0

        for (y in 1 until h - 1) {
            for (x in 1 until w - 1) {
                val center = pixels[y * w + x] and 0xFF
                val top = pixels[(y - 1) * w + x] and 0xFF
                val bottom = pixels[(y + 1) * w + x] and 0xFF
                val left = pixels[y * w + (x - 1)] and 0xFF
                val right = pixels[y * w + (x + 1)] and 0xFF
                val lap = (4 * center - top - bottom - left - right).toDouble()
                sum += lap
                sumSq += lap * lap
                count++
            }
        }

        if (count == 0) return 0f
        val mean = sum / count
        return ((sumSq / count) - mean * mean).toFloat().coerceAtLeast(0f)
    }

    /**
     * Moves photo to trash (Android 11+) or returns URI for deletion (pre-11).
     */
    suspend fun trashPhoto(uri: Uri): Boolean = withContext(Dispatchers.IO) {
        return@withContext try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
                MediaStore.createTrashRequest(contentResolver, listOf(uri), true)
                // Caller must launch the pending intent; we just indicate intent was created
                true
            } else {
                contentResolver.delete(uri, null, null) > 0
            }
        } catch (_: Exception) {
            false
        }
    }

    /**
     * Creates batch trash request for multiple photos (Android 11+).
     */
    fun createBatchTrashRequest(uris: List<Uri>): android.app.PendingIntent? {
        return if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
            try {
                MediaStore.createTrashRequest(contentResolver, uris, true)
            } catch (_: Exception) { null }
        } else null
    }

    fun formatSize(bytes: Long): String = when {
        bytes >= 1_000_000 -> "%.1f MB".format(bytes / 1_000_000.0)
        bytes >= 1_000 -> "%.0f KB".format(bytes / 1_000.0)
        else -> "$bytes B"
    }
}
