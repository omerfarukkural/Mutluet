//
//  omerApp.swift
//  Mutluet Preview
//
//  Created by Ömer Faruk KURAL on 3.03.2026.
//
//  Bu uygulama Mutluet web uygulamasını macOS ve iOS'ta native bir
//  pencere içinde önizlemenizi sağlar.
//  Kullanmadan önce terminalde "pnpm dev" ile Vite sunucusunu başlatın.
//

import SwiftUI

@main
struct omerApp: App {
    var body: some Scene {
        WindowGroup {
            #if os(iOS)
            NavigationStack {
                ContentView()
                    .navigationBarTitleDisplayMode(.inline)
            }
            #else
            ContentView()
            #endif
        }
        #if os(macOS)
        .windowStyle(.titleBar)
        .defaultSize(width: 1280, height: 800)
        .commands {
            // ⌘R ile yenileme
            CommandGroup(replacing: .newItem) {}
        }
        #endif
    }
}
