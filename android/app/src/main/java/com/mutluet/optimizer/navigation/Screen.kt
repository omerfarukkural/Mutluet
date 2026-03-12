package com.mutluet.optimizer.navigation

sealed class Screen(val route: String) {
    object Home : Screen("home")
    object Chat : Screen("chat?initialMessage={initialMessage}") {
        fun withMessage(msg: String) = "chat?initialMessage=${java.net.URLEncoder.encode(msg, "UTF-8")}"
    }
    object Photos : Screen("photos")
    object Storage : Screen("storage")
    object Settings : Screen("settings")
}
