import appInsights from 'applicationinsights';

export function setupMonitoring() {
  const connectionString = process.env.APPLICATIONINSIGHTS_CONNECTION_STRING;

  if (connectionString) {
    console.log('🔍 Setting up Application Insights...');

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

    // Custom properties for all telemetry
    appInsights.defaultClient.context.tags[appInsights.defaultClient.context.keys.cloudRole] = 'mutluet-backend';

    console.log('✅ Application Insights aktif');
  } else {
    console.log('⚠️  Application Insights connection string not found, monitoring disabled');
  }
}

// Helper function to track custom events
export function trackEvent(name: string, properties?: Record<string, any>) {
  if (appInsights.defaultClient) {
    appInsights.defaultClient.trackEvent({
      name,
      properties
    });
  }
}

// Helper function to track custom metrics
export function trackMetric(name: string, value: number) {
  if (appInsights.defaultClient) {
    appInsights.defaultClient.trackMetric({
      name,
      value
    });
  }
}

// Helper function to track exceptions
export function trackException(error: Error, properties?: Record<string, any>) {
  if (appInsights.defaultClient) {
    appInsights.defaultClient.trackException({
      exception: error,
      properties
    });
  } else {
    console.error('Exception:', error, properties);
  }
}
