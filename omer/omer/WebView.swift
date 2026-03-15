//
//  WebView.swift
//  Mutluet Preview
//
//  Vite dev server'ını (localhost:5173) WebView ile gösteren bileşen.
//  macOS ve iOS platformlarını destekler.
//

import SwiftUI
import WebKit

// ═══════════════════════════════════════════════════════════════
// MARK: - WebView Coordinator (Shared)
// ═══════════════════════════════════════════════════════════════

class WebViewCoordinator: NSObject, WKNavigationDelegate {
    var isLoading: Binding<Bool>
    var errorMessage: Binding<String?>
    var canGoBack: Binding<Bool>
    var canGoForward: Binding<Bool>

    init(isLoading: Binding<Bool>, errorMessage: Binding<String?>, canGoBack: Binding<Bool>, canGoForward: Binding<Bool>) {
        self.isLoading = isLoading
        self.errorMessage = errorMessage
        self.canGoBack = canGoBack
        self.canGoForward = canGoForward
    }

    func webView(_ webView: WKWebView, didStartProvisionalNavigation navigation: WKNavigation!) {
        isLoading.wrappedValue = true
        errorMessage.wrappedValue = nil
    }

    func webView(_ webView: WKWebView, didFinish navigation: WKNavigation!) {
        isLoading.wrappedValue = false
        canGoBack.wrappedValue = webView.canGoBack
        canGoForward.wrappedValue = webView.canGoForward
    }

    func webView(_ webView: WKWebView, didFail navigation: WKNavigation!, withError error: Error) {
        isLoading.wrappedValue = false
        errorMessage.wrappedValue = error.localizedDescription
    }

    func webView(_ webView: WKWebView, didFailProvisionalNavigation navigation: WKNavigation!, withError error: Error) {
        isLoading.wrappedValue = false

        let nsError = error as NSError
        if nsError.code == NSURLErrorCannotConnectToHost || nsError.code == NSURLErrorCannotFindHost || nsError.code == NSURLErrorTimedOut || nsError.code == NSURLErrorNetworkConnectionLost {
            errorMessage.wrappedValue = """
                🔌 Vite Dev Server'a bağlanılamıyor!

                Lütfen terminalde şu komutu çalıştırın:
                  cd Mutluet && pnpm dev

                Sunucu başladıktan sonra ↻ Yenile butonuna basın.

                Hata: \(error.localizedDescription)
                """
        } else {
            errorMessage.wrappedValue = error.localizedDescription
        }
    }
}

// ═══════════════════════════════════════════════════════════════
// MARK: - Shared WebView Factory
// ═══════════════════════════════════════════════════════════════

private func createWebView(url: URL, coordinator: WebViewCoordinator) -> WKWebView {
    let config = WKWebViewConfiguration()
    config.preferences.setValue(true, forKey: "developerExtrasEnabled")

    let webView = WKWebView(frame: .zero, configuration: config)
    webView.navigationDelegate = coordinator
    webView.allowsBackForwardNavigationGestures = true
    webView.load(URLRequest(url: url))

    WebViewStore.shared.webView = webView
    return webView
}

// ═══════════════════════════════════════════════════════════════
// MARK: - WebView (macOS — NSViewRepresentable)
// ═══════════════════════════════════════════════════════════════

#if os(macOS)
struct WebView: NSViewRepresentable {
    let url: URL
    @Binding var isLoading: Bool
    @Binding var errorMessage: String?
    @Binding var canGoBack: Bool
    @Binding var canGoForward: Bool

    func makeCoordinator() -> WebViewCoordinator {
        WebViewCoordinator(isLoading: $isLoading, errorMessage: $errorMessage, canGoBack: $canGoBack, canGoForward: $canGoForward)
    }

    func makeNSView(context: Context) -> WKWebView {
        createWebView(url: url, coordinator: context.coordinator)
    }

    func updateNSView(_ nsView: WKWebView, context: Context) {
        // URL değişirse yeniden yükle
    }
}
#endif

// ═══════════════════════════════════════════════════════════════
// MARK: - WebView (iOS — UIViewRepresentable)
// ═══════════════════════════════════════════════════════════════

#if os(iOS)
struct WebView: UIViewRepresentable {
    let url: URL
    @Binding var isLoading: Bool
    @Binding var errorMessage: String?
    @Binding var canGoBack: Bool
    @Binding var canGoForward: Bool

    func makeCoordinator() -> WebViewCoordinator {
        WebViewCoordinator(isLoading: $isLoading, errorMessage: $errorMessage, canGoBack: $canGoBack, canGoForward: $canGoForward)
    }

    func makeUIView(context: Context) -> WKWebView {
        createWebView(url: url, coordinator: context.coordinator)
    }

    func updateUIView(_ uiView: WKWebView, context: Context) {
        // URL değişirse yeniden yükle
    }
}
#endif

// ═══════════════════════════════════════════════════════════════
// MARK: - WebView Store (Singleton — navigation kontrolü için)
// ═══════════════════════════════════════════════════════════════

class WebViewStore: ObservableObject {
    static let shared = WebViewStore()
    var webView: WKWebView?

    func reload() {
        webView?.reload()
    }

    func goBack() {
        webView?.goBack()
    }

    func goForward() {
        webView?.goForward()
    }

    func loadURL(_ url: URL) {
        webView?.load(URLRequest(url: url))
    }
}
