import * as Sentry from "@sentry/react";
import { createRoot } from "react-dom/client";
import App from "./app/App.tsx";
import { AuthProvider } from "./contexts/AuthContext.tsx";
import { ErrorBoundary } from "./components/ErrorBoundary.tsx";
import "./styles/index.css";

const sentryDsn = import.meta.env.VITE_SENTRY_DSN;
if (sentryDsn) {
  Sentry.init({
    dsn: sentryDsn,
    environment: import.meta.env.VITE_ENV || "development",
    tracesSampleRate: import.meta.env.VITE_ENV === "production" ? 0.1 : 1.0,
    integrations: [Sentry.browserTracingIntegration()],
  });
}

createRoot(document.getElementById("root")!).render(
  <ErrorBoundary>
    <AuthProvider>
      <App />
    </AuthProvider>
  </ErrorBoundary>
);
  