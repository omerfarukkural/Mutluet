//
//  ContentView.swift
//  omer
//
//  Created by Ömer Faruk KURAL on 3.03.2026.
//
//

import SwiftUI
import WebKit

struct ContentView: View {
    @State private var urlString: String = "http://localhost:5173"
    @State private var isLoading: Bool = true
    @State private var errorMessage: String? = nil
    @State private var canGoBack: Bool = false
    @State private var canGoForward: Bool = false
    @State private var showSettings: Bool = false
    @State private var currentRoute: String = "/home"

    // Hızlı navigasyon rotaları
    let quickRoutes: [(name: String, path: String, icon: String)] = [
        ("Ana Sayfa", "/home", "house.fill"),
        ("Giriş", "/login", "person.crop.circle"),
        ("Kategoriler", "/categories", "square.grid.2x2"),
        ("Etkinlikler", "/events", "calendar"),
        ("Bağış", "/donate", "heart.fill"),
        ("Harita", "/map", "map.fill"),
        ("Sohbet", "/chat", "bubble.left.fill"),
        ("Eşleşme", "/matching", "person.2.fill"),
        ("Profil", "/profile", "person.fill"),
        ("Admin", "/admin", "gear"),
        ("Oyunlar", "/games", "gamecontroller.fill"),
        ("Mutluluk", "/happiness", "face.smiling.fill"),
    ]

    var body: some View {
        VStack(spacing: 0) {
            // ─── Üst Bar ───────────────────────────
            if let error = errorMessage {
                errorView(error: error)
            } else {
                WebView(
                    url: URL(string: urlString)!,
                    isLoading: $isLoading,
                    errorMessage: $errorMessage,
                    canGoBack: $canGoBack,
                    canGoForward: $canGoForward
                )
            }

            // ─── Loading Bar ───────────────────────
            if isLoading {
                ProgressView()
                    .progressViewStyle(.linear)
            }
        }
        #if os(macOS)
        .toolbar {
            // Sol: Navigasyon
            ToolbarItemGroup(placement: .navigation) {
                Button(action: { WebViewStore.shared.goBack() }) {
                    Image(systemName: "chevron.left")
                }
                .disabled(!canGoBack)
                .help("Geri")

                Button(action: { WebViewStore.shared.goForward() }) {
                    Image(systemName: "chevron.right")
                }
                .disabled(!canGoForward)
                .help("İleri")

                Button(action: { reloadPage() }) {
                    Image(systemName: "arrow.clockwise")
                }
                .help("Yenile (⌘R)")
                .keyboardShortcut("r", modifiers: .command)
            }

            // Orta: URL alanı
            ToolbarItem(placement: .principal) {
                HStack {
                    Image(systemName: "globe")
                        .foregroundColor(.secondary)

                    TextField("URL", text: $urlString)
                        .textFieldStyle(.roundedBorder)
                        .frame(minWidth: 300)
                        .onSubmit {
                            if let url = URL(string: urlString) {
                                WebViewStore.shared.loadURL(url)
                            }
                        }
                }
            }

            // Sağ: Hızlı rotalar
            ToolbarItemGroup(placement: .primaryAction) {
                quickNavMenu
                deviceMenu
            }
        }
        .frame(minWidth: 1024, minHeight: 768)
        #else
        .toolbar {
            ToolbarItemGroup(placement: .topBarLeading) {
                Button(action: { WebViewStore.shared.goBack() }) {
                    Image(systemName: "chevron.left")
                }
                .disabled(!canGoBack)

                Button(action: { WebViewStore.shared.goForward() }) {
                    Image(systemName: "chevron.right")
                }
                .disabled(!canGoForward)

                Button(action: { reloadPage() }) {
                    Image(systemName: "arrow.clockwise")
                }
            }

            ToolbarItemGroup(placement: .topBarTrailing) {
                quickNavMenu
            }
        }
        #endif
    }

    // ─── Shared Views ────────────────────────────

    private func errorView(error: String) -> some View {
        VStack(spacing: 12) {
            Spacer()
            Image(systemName: "wifi.exclamationmark")
                .font(.system(size: 64))
                .foregroundColor(.orange)

            Text(error)
                .multilineTextAlignment(.center)
                .foregroundColor(.secondary)
                .padding(.horizontal, 40)

            Button(action: { reloadPage() }) {
                Label("Tekrar Dene", systemImage: "arrow.clockwise")
                    .font(.headline)
                    .padding(.horizontal, 24)
                    .padding(.vertical, 12)
            }
            .buttonStyle(.borderedProminent)
            .tint(.blue)

            Spacer()
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        #if os(macOS)
        .background(Color(NSColor.windowBackgroundColor))
        #else
        .background(Color(UIColor.systemBackground))
        #endif
    }

    private var quickNavMenu: some View {
        Menu {
            ForEach(quickRoutes, id: \.path) { route in
                Button(action: {
                    navigateTo(route.path)
                }) {
                    Label(route.name, systemImage: route.icon)
                }
            }
        } label: {
            Image(systemName: "sidebar.right")
        }
        #if os(macOS)
        .help("Hızlı Navigasyon")
        #endif
    }

    #if os(macOS)
    private var deviceMenu: some View {
        Menu {
            Button("📱 iPhone SE (375×667)") { /* resize */ }
            Button("📱 iPhone 15 (393×852)") { /* resize */ }
            Button("📱 iPad (768×1024)") { /* resize */ }
            Button("🖥️ Desktop (1280×800)") { /* resize */ }
            Divider()
            Button("🔍 JavaScript Konsolu") {
                WebViewStore.shared.webView?.evaluateJavaScript("console.log('Mutluet DevTools bağlandı')") { _, _ in }
            }
        } label: {
            Image(systemName: "rectangle.3.group")
        }
        .help("Cihaz Boyutları")
    }
    #endif

    // ─── Helpers ─────────────────────────────────

    private func navigateTo(_ path: String) {
        let fullURL = "http://localhost:5173\(path)"
        urlString = fullURL
        if let url = URL(string: fullURL) {
            WebViewStore.shared.loadURL(url)
        }
    }

    private func reloadPage() {
        errorMessage = nil
        if let url = URL(string: urlString) {
            WebViewStore.shared.loadURL(url)
        } else {
            WebViewStore.shared.reload()
        }
    }
}

#Preview {
    ContentView()
}
