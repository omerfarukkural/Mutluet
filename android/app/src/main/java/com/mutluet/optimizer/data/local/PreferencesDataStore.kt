package com.mutluet.optimizer.data.local

import android.content.Context
import android.content.SharedPreferences
import androidx.security.crypto.EncryptedSharedPreferences
import androidx.security.crypto.MasterKey
import com.mutluet.optimizer.data.remote.models.ClaudeModels
import dagger.hilt.android.qualifiers.ApplicationContext
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class PreferencesDataStore @Inject constructor(
    @ApplicationContext private val context: Context
) {
    companion object {
        private const val PREFS_FILE = "optimizer_encrypted_prefs"
        private const val KEY_API_KEY = "claude_api_key"
        private const val KEY_MODEL = "claude_model"
        private const val KEY_DAILY_SCAN_ENABLED = "daily_scan_enabled"
        private const val KEY_ONBOARDING_DONE = "onboarding_done"
    }

    private val prefs: SharedPreferences by lazy {
        val masterKey = MasterKey.Builder(context)
            .setKeyScheme(MasterKey.KeyScheme.AES256_GCM)
            .build()
        EncryptedSharedPreferences.create(
            context,
            PREFS_FILE,
            masterKey,
            EncryptedSharedPreferences.PrefKeyEncryptionScheme.AES256_SIV,
            EncryptedSharedPreferences.PrefValueEncryptionScheme.AES256_GCM
        )
    }

    suspend fun getApiKey(): String? = withContext(Dispatchers.IO) {
        prefs.getString(KEY_API_KEY, null)
    }

    suspend fun saveApiKey(apiKey: String) = withContext(Dispatchers.IO) {
        prefs.edit().putString(KEY_API_KEY, apiKey.trim()).apply()
    }

    suspend fun clearApiKey() = withContext(Dispatchers.IO) {
        prefs.edit().remove(KEY_API_KEY).apply()
    }

    suspend fun getModel(): String = withContext(Dispatchers.IO) {
        prefs.getString(KEY_MODEL, ClaudeModels.SONNET) ?: ClaudeModels.SONNET
    }

    suspend fun saveModel(model: String) = withContext(Dispatchers.IO) {
        prefs.edit().putString(KEY_MODEL, model).apply()
    }

    suspend fun isDailyScanEnabled(): Boolean = withContext(Dispatchers.IO) {
        prefs.getBoolean(KEY_DAILY_SCAN_ENABLED, true)
    }

    suspend fun setDailyScanEnabled(enabled: Boolean) = withContext(Dispatchers.IO) {
        prefs.edit().putBoolean(KEY_DAILY_SCAN_ENABLED, enabled).apply()
    }

    suspend fun isOnboardingDone(): Boolean = withContext(Dispatchers.IO) {
        prefs.getBoolean(KEY_ONBOARDING_DONE, false)
    }

    suspend fun setOnboardingDone(done: Boolean) = withContext(Dispatchers.IO) {
        prefs.edit().putBoolean(KEY_ONBOARDING_DONE, done).apply()
    }
}
