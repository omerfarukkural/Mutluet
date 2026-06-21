import * as Sentry from '@sentry/node';

export function setupMonitoring() {
  const dsn = process.env.SENTRY_DSN;

  if (!dsn) {
    console.log('ℹ️  SENTRY_DSN tanımlı değil, error tracking devre dışı');
    return;
  }

  Sentry.init({
    dsn,
    environment: process.env.NODE_ENV || 'development',
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.2 : 1.0,
  });

  console.log('✅ Sentry error tracking aktif');
}

export function trackException(error: Error, context?: Record<string, unknown>) {
  Sentry.withScope((scope) => {
    if (context) scope.setExtras(context);
    Sentry.captureException(error);
  });
}

export function trackEvent(name: string, properties?: Record<string, unknown>) {
  Sentry.addBreadcrumb({ message: name, data: properties });
}

export function trackMetric(name: string, value: number) {
  Sentry.setMeasurement(name, value, 'none');
}

export { Sentry };
