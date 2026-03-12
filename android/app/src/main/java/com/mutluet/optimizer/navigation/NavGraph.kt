package com.mutluet.optimizer.navigation

import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Chat
import androidx.compose.material.icons.filled.Home
import androidx.compose.material.icons.filled.Image
import androidx.compose.material.icons.filled.Settings
import androidx.compose.material.icons.filled.Storage
import androidx.compose.material3.Icon
import androidx.compose.material3.NavigationBar
import androidx.compose.material3.NavigationBarItem
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.navigation.NavDestination.Companion.hierarchy
import androidx.navigation.NavGraph.Companion.findStartDestination
import androidx.navigation.NavType
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.currentBackStackEntryAsState
import androidx.navigation.compose.rememberNavController
import androidx.navigation.navArgument
import com.mutluet.optimizer.ui.screens.ChatScreen
import com.mutluet.optimizer.ui.screens.HomeScreen
import com.mutluet.optimizer.ui.screens.PhotoScreen
import com.mutluet.optimizer.ui.screens.SettingsScreen
import com.mutluet.optimizer.ui.screens.StorageScreen

private data class BottomNavItem(
    val route: String,
    val label: String,
    val icon: androidx.compose.ui.graphics.vector.ImageVector
)

@Composable
fun NavGraph() {
    val navController = rememberNavController()

    val bottomItems = listOf(
        BottomNavItem(Screen.Home.route, "Ana Sayfa", Icons.Default.Home),
        BottomNavItem(Screen.Chat.route.substringBefore("?"), "AI Asistan", Icons.Default.Chat),
        BottomNavItem(Screen.Photos.route, "Fotoğraflar", Icons.Default.Image),
        BottomNavItem(Screen.Storage.route, "Depolama", Icons.Default.Storage),
        BottomNavItem(Screen.Settings.route, "Ayarlar", Icons.Default.Settings),
    )

    Scaffold(
        bottomBar = {
            val navBackStackEntry by navController.currentBackStackEntryAsState()
            val currentDestination = navBackStackEntry?.destination
            NavigationBar {
                bottomItems.forEach { item ->
                    NavigationBarItem(
                        icon = { Icon(item.icon, contentDescription = item.label) },
                        label = { Text(item.label) },
                        selected = currentDestination?.hierarchy?.any {
                            it.route?.startsWith(item.route) == true
                        } == true,
                        onClick = {
                            navController.navigate(item.route) {
                                popUpTo(navController.graph.findStartDestination().id) {
                                    saveState = true
                                }
                                launchSingleTop = true
                                restoreState = true
                            }
                        }
                    )
                }
            }
        }
    ) { innerPadding ->
        NavHost(
            navController = navController,
            startDestination = Screen.Home.route,
            modifier = Modifier.padding(innerPadding)
        ) {
            composable(Screen.Home.route) {
                HomeScreen(
                    onNavigateToChat = { message ->
                        navController.navigate(Screen.Chat.withMessage(message))
                    }
                )
            }
            composable(
                route = "chat?initialMessage={initialMessage}",
                arguments = listOf(
                    navArgument("initialMessage") {
                        type = NavType.StringType
                        defaultValue = ""
                        nullable = true
                    }
                )
            ) { backStackEntry ->
                val initialMessage = backStackEntry.arguments?.getString("initialMessage") ?: ""
                ChatScreen(initialMessage = initialMessage)
            }
            composable(Screen.Photos.route) {
                PhotoScreen(
                    onNavigateToChat = { message ->
                        navController.navigate(Screen.Chat.withMessage(message))
                    }
                )
            }
            composable(Screen.Storage.route) {
                StorageScreen(
                    onNavigateToChat = { message ->
                        navController.navigate(Screen.Chat.withMessage(message))
                    }
                )
            }
            composable(Screen.Settings.route) {
                SettingsScreen()
            }
        }
    }
}
