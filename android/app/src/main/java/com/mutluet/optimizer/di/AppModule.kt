package com.mutluet.optimizer.di

import android.content.Context
import com.mutluet.optimizer.agent.DevEnvironmentAgent
import com.mutluet.optimizer.agent.FileOrganizationAgent
import com.mutluet.optimizer.agent.PhoneOptimizationAgent
import com.mutluet.optimizer.agent.PhotoManagerAgent
import com.mutluet.optimizer.agent.ProcessManagerAgent
import com.mutluet.optimizer.agent.StorageCleanupAgent
import com.mutluet.optimizer.data.local.PreferencesDataStore
import com.mutluet.optimizer.data.remote.ClaudeApiService
import com.mutluet.optimizer.system.FileOrganizer
import com.mutluet.optimizer.system.PhotoScanner
import com.mutluet.optimizer.system.ProcessScanner
import com.mutluet.optimizer.system.StorageScanner
import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.android.qualifiers.ApplicationContext
import dagger.hilt.components.SingletonComponent
import javax.inject.Singleton

@Module
@InstallIn(SingletonComponent::class)
object AppModule {

    @Provides @Singleton
    fun providePreferencesDataStore(@ApplicationContext context: Context): PreferencesDataStore =
        PreferencesDataStore(context)

    @Provides @Singleton
    fun provideClaudeApiService(prefs: PreferencesDataStore): ClaudeApiService =
        ClaudeApiService(prefs)

    @Provides @Singleton
    fun provideProcessScanner(@ApplicationContext context: Context): ProcessScanner =
        ProcessScanner(context)

    @Provides @Singleton
    fun providePhotoScanner(@ApplicationContext context: Context): PhotoScanner =
        PhotoScanner(context)

    @Provides @Singleton
    fun provideStorageScanner(@ApplicationContext context: Context): StorageScanner =
        StorageScanner(context)

    @Provides @Singleton
    fun provideFileOrganizer(@ApplicationContext context: Context): FileOrganizer =
        FileOrganizer(context)

    @Provides @Singleton
    fun providePhoneOptimizationAgent(
        claudeApiService: ClaudeApiService,
        prefs: PreferencesDataStore,
        @ApplicationContext context: Context,
        processScanner: ProcessScanner
    ): PhoneOptimizationAgent = PhoneOptimizationAgent(claudeApiService, prefs, context, processScanner)

    @Provides @Singleton
    fun provideProcessManagerAgent(
        claudeApiService: ClaudeApiService,
        prefs: PreferencesDataStore,
        @ApplicationContext context: Context,
        processScanner: ProcessScanner
    ): ProcessManagerAgent = ProcessManagerAgent(claudeApiService, prefs, context, processScanner)

    @Provides @Singleton
    fun providePhotoManagerAgent(
        claudeApiService: ClaudeApiService,
        prefs: PreferencesDataStore,
        @ApplicationContext context: Context,
        photoScanner: PhotoScanner
    ): PhotoManagerAgent = PhotoManagerAgent(claudeApiService, prefs, context, photoScanner)

    @Provides @Singleton
    fun provideStorageCleanupAgent(
        claudeApiService: ClaudeApiService,
        prefs: PreferencesDataStore,
        @ApplicationContext context: Context,
        storageScanner: StorageScanner
    ): StorageCleanupAgent = StorageCleanupAgent(claudeApiService, prefs, context, storageScanner)

    @Provides @Singleton
    fun provideFileOrganizationAgent(
        claudeApiService: ClaudeApiService,
        prefs: PreferencesDataStore,
        @ApplicationContext context: Context,
        fileOrganizer: FileOrganizer
    ): FileOrganizationAgent = FileOrganizationAgent(claudeApiService, prefs, context, fileOrganizer)

    @Provides @Singleton
    fun provideDevEnvironmentAgent(
        claudeApiService: ClaudeApiService,
        prefs: PreferencesDataStore,
        @ApplicationContext context: Context
    ): DevEnvironmentAgent = DevEnvironmentAgent(claudeApiService, prefs, context)
}
