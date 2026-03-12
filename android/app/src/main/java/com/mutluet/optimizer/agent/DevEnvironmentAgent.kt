package com.mutluet.optimizer.agent

import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.net.Uri
import com.mutluet.optimizer.agent.base.BaseAgent
import com.mutluet.optimizer.data.local.PreferencesDataStore
import com.mutluet.optimizer.data.remote.ClaudeApiService
import com.mutluet.optimizer.data.remote.models.JsonSchema
import com.mutluet.optimizer.data.remote.models.ToolDefinition
import dagger.hilt.android.qualifiers.ApplicationContext
import kotlinx.serialization.json.JsonElement
import kotlinx.serialization.json.buildJsonObject
import kotlinx.serialization.json.put
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class DevEnvironmentAgent @Inject constructor(
    claudeApiService: ClaudeApiService,
    preferencesDataStore: PreferencesDataStore,
    @ApplicationContext context: Context
) : BaseAgent(claudeApiService, preferencesDataStore, context) {

    companion object {
        private const val TERMUX_PACKAGE = "com.termux"
        private const val TERMUX_API_PACKAGE = "com.termux.api"
        private const val TERMUX_PLAY_URL = "https://f-droid.org/packages/com.termux/"
        private const val TERMUX_API_PLAY_URL = "https://f-droid.org/packages/com.termux.api/"
    }

    override val systemPrompt = """
        Sen Mutluet AI Optimizer'ın geliştirme ortamı uzmanısın.
        Android telefon üzerinde Termux kullanarak yazılım geliştirme ortamları kurarsın.

        Desteklediğin ortamlar:
        - Android geliştirme (Java, Kotlin, Android SDK, Gradle)
        - Web geliştirme (Node.js, Python, PHP)
        - Genel araçlar (Git, Vim, Nano, wget, curl)

        Termux kurulu değilse kullanıcıyı F-Droid'e yönlendir (Play Store'daki versiyonlar güncel değil).
        Her komut için ne yapacağını Türkçe açıkla.
    """.trimIndent()

    override fun getTools(): List<ToolDefinition> = listOf(
        ToolDefinition(
            name = "check_termux_installed",
            description = "Termux ve Termux:API'nin kurulu olup olmadığını kontrol eder.",
            inputSchema = JsonSchema(properties = buildJsonObject {}, required = emptyList())
        ),
        ToolDefinition(
            name = "open_termux_install_guide",
            description = "Termux kurulum sayfasını açar (F-Droid).",
            inputSchema = JsonSchema(properties = buildJsonObject {}, required = emptyList())
        ),
        ToolDefinition(
            name = "run_termux_command",
            description = "Termux'ta bir komut çalıştırır. Termux kurulu ve izinler verilmiş olmalıdır.",
            inputSchema = JsonSchema(
                properties = buildJsonObject {
                    put("command", buildJsonObject {
                        put("type", "string")
                        put("description", "Çalıştırılacak bash komutu")
                    })
                    put("description", buildJsonObject {
                        put("type", "string")
                        put("description", "Komutun ne yaptığının açıklaması")
                    })
                },
                required = listOf("command", "description")
            )
        ),
        ToolDefinition(
            name = "provide_setup_instructions",
            description = "Bir geliştirme ortamı için adım adım kurulum talimatları üretir (doğrudan çalıştırmadan).",
            inputSchema = JsonSchema(
                properties = buildJsonObject {
                    put("environment", buildJsonObject {
                        put("type", "string")
                        put("description", "Kurulacak ortam: 'android_dev', 'nodejs', 'python', 'git', 'java'")
                    })
                },
                required = listOf("environment")
            )
        )
    )

    override suspend fun executeTool(toolName: String, toolInput: JsonElement): String {
        return when (toolName) {
            "check_termux_installed" -> {
                val termuxInstalled = isPackageInstalled(TERMUX_PACKAGE)
                val termuxApiInstalled = isPackageInstalled(TERMUX_API_PACKAGE)
                buildJsonObject {
                    put("termux_installed", termuxInstalled)
                    put("termux_api_installed", termuxApiInstalled)
                    put("ready", termuxInstalled)
                    put("recommendation", when {
                        !termuxInstalled -> "Termux kurulu değil. F-Droid'den kurun (Play Store versiyonu güncel değil)."
                        !termuxApiInstalled -> "Termux kurulu fakat Termux:API eksik. Komut çalıştırma için gereklidir."
                        else -> "Termux hazır. Komut çalıştırabilirsiniz."
                    })
                }.toString()
            }

            "open_termux_install_guide" -> {
                try {
                    val intent = Intent(Intent.ACTION_VIEW, Uri.parse(TERMUX_PLAY_URL)).apply {
                        flags = Intent.FLAG_ACTIVITY_NEW_TASK
                    }
                    context.startActivity(intent)
                    "F-Droid Termux sayfası açıldı. Not: Termux'u F-Droid üzerinden kurun, Play Store versiyonu artık güncellenmemektedir."
                } catch (e: Exception) {
                    "Sayfa açılamadı: ${e.message}. Manuel olarak şu adresi ziyaret edin: $TERMUX_PLAY_URL"
                }
            }

            "run_termux_command" -> {
                val command = toolInput.getString("command")
                    ?: return "Hata: command belirtilmedi"
                val description = toolInput.getString("description") ?: command

                if (!isPackageInstalled(TERMUX_PACKAGE)) {
                    return "Termux kurulu değil. Önce Termux'u F-Droid'den kurun: $TERMUX_PLAY_URL"
                }

                try {
                    val intent = Intent().apply {
                        setClassName(TERMUX_PACKAGE, "com.termux.app.RunCommandService")
                        action = "com.termux.RUN_COMMAND"
                        putExtra("com.termux.RUN_COMMAND_PATH", "/data/data/com.termux/files/usr/bin/bash")
                        putExtra("com.termux.RUN_COMMAND_ARGUMENTS", arrayOf("-c", command))
                        putExtra("com.termux.RUN_COMMAND_WORKDIR", "/data/data/com.termux/files/home")
                        putExtra("com.termux.RUN_COMMAND_BACKGROUND", false)
                        flags = Intent.FLAG_ACTIVITY_NEW_TASK
                    }
                    context.startActivity(intent)
                    "Termux'ta çalıştırıldı: $description\nKomut: $command"
                } catch (e: Exception) {
                    "Komut çalıştırılamadı: ${e.message}\n" +
                    "Lütfen Termux'u açıp şu komutu manuel çalıştırın:\n$command"
                }
            }

            "provide_setup_instructions" -> {
                val env = toolInput.getString("environment") ?: "general"
                getSetupInstructions(env)
            }

            else -> "Bilinmeyen araç: $toolName"
        }
    }

    private fun isPackageInstalled(packageName: String): Boolean {
        return try {
            context.packageManager.getPackageInfo(packageName, 0)
            true
        } catch (_: PackageManager.NameNotFoundException) { false }
    }

    private fun getSetupInstructions(environment: String): String {
        return when (environment.lowercase()) {
            "android_dev" -> """
                # Android Geliştirme Ortamı Kurulumu (Termux)

                ## 1. Termux'u Hazırlayın
                ```bash
                pkg update && pkg upgrade -y
                pkg install -y wget curl git
                ```

                ## 2. Java (OpenJDK 17) Kurun
                ```bash
                pkg install -y openjdk-17
                echo 'export JAVA_HOME=${'$'}(dirname $(dirname $(readlink -f $(which java))))' >> ~/.bashrc
                source ~/.bashrc
                java -version
                ```

                ## 3. Android SDK Command Line Tools
                ```bash
                mkdir -p ~/android-sdk/cmdline-tools
                cd ~/android-sdk/cmdline-tools
                wget https://dl.google.com/android/repository/commandlinetools-linux-11076708_latest.zip
                unzip commandlinetools-linux-*.zip
                mv cmdline-tools latest
                ```

                ## 4. Ortam Değişkenleri
                ```bash
                cat >> ~/.bashrc << 'EOF'
                export ANDROID_SDK_ROOT=${'$'}HOME/android-sdk
                export PATH=${'$'}PATH:${'$'}ANDROID_SDK_ROOT/cmdline-tools/latest/bin
                export PATH=${'$'}PATH:${'$'}ANDROID_SDK_ROOT/platform-tools
                EOF
                source ~/.bashrc
                ```

                ## 5. SDK Bileşenleri
                ```bash
                sdkmanager --licenses
                sdkmanager "platform-tools" "platforms;android-35" "build-tools;35.0.0"
                ```

                ## 6. Gradle Projesi Oluştur/Derle
                ```bash
                cd ~/proje
                ./gradlew assembleDebug
                # APK: app/build/outputs/apk/debug/app-debug.apk
                ```

                ## 7. ADB ile Yükle (USB ile bağlı cihaz için)
                ```bash
                adb install app/build/outputs/apk/debug/app-debug.apk
                ```
            """.trimIndent()

            "nodejs" -> """
                # Node.js Kurulumu (Termux)

                ```bash
                pkg update && pkg upgrade -y
                pkg install -y nodejs npm git
                node --version
                npm --version

                # Proje oluştur
                mkdir ~/myapp && cd ~/myapp
                npm init -y
                npm install express

                # Başlat
                node index.js
                ```
            """.trimIndent()

            "python" -> """
                # Python Kurulumu (Termux)

                ```bash
                pkg update && pkg upgrade -y
                pkg install -y python python-pip git
                python3 --version

                # Sanal ortam oluştur
                python3 -m venv ~/myenv
                source ~/myenv/bin/activate

                # Gerekli kütüphaneleri yükle
                pip install flask requests
                ```
            """.trimIndent()

            "git" -> """
                # Git Kurulumu ve Yapılandırma (Termux)

                ```bash
                pkg install -y git
                git config --global user.name "Adınız"
                git config --global user.email "email@domain.com"

                # SSH key oluştur
                ssh-keygen -t ed25519 -C "email@domain.com"
                cat ~/.ssh/id_ed25519.pub
                # Bu public key'i GitHub/GitLab'a ekleyin
                ```
            """.trimIndent()

            "java" -> """
                # Java Kurulumu (Termux)

                ```bash
                pkg update && pkg upgrade -y
                pkg install -y openjdk-17
                java -version
                javac -version

                # Maven de kurabilirsiniz
                pkg install -y maven

                # Basit Java programı
                cat > Hello.java << 'EOF'
                public class Hello {
                    public static void main(String[] args) {
                        System.out.println("Merhaba Dünya!");
                    }
                }
                EOF
                javac Hello.java
                java Hello
                ```
            """.trimIndent()

            else -> "Bilinmeyen ortam: $environment. Desteklenen ortamlar: android_dev, nodejs, python, git, java"
        }
    }
}
