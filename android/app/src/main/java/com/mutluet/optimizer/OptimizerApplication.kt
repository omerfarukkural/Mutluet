package com.mutluet.optimizer

import android.app.Application
import androidx.work.Configuration
import dagger.hilt.android.HiltAndroidApp
import javax.inject.Inject

@HiltAndroidApp
class OptimizerApplication : Application(), Configuration.Provider {

    @Inject
    lateinit var workerFactory: androidx.work.WorkerFactory

    override val workManagerConfiguration: Configuration
        get() = Configuration.Builder()
            .setWorkerFactory(workerFactory)
            .build()
}
