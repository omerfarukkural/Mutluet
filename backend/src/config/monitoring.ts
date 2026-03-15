/**
 * Application Monitoring
 * 
 * Application Insights opsiyoneldir. Paket yüklü değilse veya
 * connection string tanımlı değilse sessizce devre dışı kalır.
 */

let appInsightsModule: any = null;

async function loadAppInsights() {
  try {
    // @ts-ignore - applicationinsights opsiyonel paket, yüklü olmayabilir
    appInsightsModule = await import('applicationinsights');
    return true;
  } catch {
    return false;
  }
}

export function setupMonitoring() {
  const connectionString = process.env.APPLICATIONINSIGHTS_CONNECTION_STRING;

  if (!connectionString) {
    console.log('ℹ️  Application Insights bağlantı dizesi tanımlı değil, monitoring devre dışı');
    return;
  }

  loadAppInsights().then((loaded) => {
    if (!loaded) {
      console.log('ℹ️  applicationinsights paketi yüklü değil, monitoring devre dışı');
      return;
    }

    try {
      const appInsights = appInsightsModule.default || appInsightsModule;
      appInsights.setup(connectionString)
        .setAutoDependencyCorrelation(true)
        .setAutoCollectRequests(true)
        .setAutoCollectPerformance(true, true)
        .setAutoCollectExceptions(true)
        .setAutoCollectDependencies(true)
        .setAutoCollectConsole(true)
        .setUseDiskRetryCaching(true)
        .setSendLiveMetrics(true)
        .start();

      appInsights.defaultClient.context.tags[appInsights.defaultClient.context.keys.cloudRole] = 'mutluet-backend';
      console.log('✅ Application Insights aktif');
    } catch (error) {
      console.warn('⚠️ Application Insights başlatılamadı:', error);
    }
  });
}

// Helper function to track custom events
export function trackEvent(name: string, properties?: Record<string, any>) {
  const appInsights = appInsightsModule?.default || appInsightsModule;
  if (appInsights?.defaultClient) {
    appInsights.defaultClient.trackEvent({ name, properties });
  }
}

// Helper function to track custom metrics
export function trackMetric(name: string, value: number) {
  const appInsights = appInsightsModule?.default || appInsightsModule;
  if (appInsights?.defaultClient) {
    appInsights.defaultClient.trackMetric({ name, value });
  }
}

// Helper function to track exceptions
export function trackException(error: Error, properties?: Record<string, any>) {
  const appInsights = appInsightsModule?.default || appInsightsModule;
  if (appInsights?.defaultClient) {
    appInsights.defaultClient.trackException({ exception: error, properties });
  } else {
    console.error('Exception:', error, properties);
  }
}
