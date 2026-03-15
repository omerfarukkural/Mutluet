import 'package:flutter/material.dart';
import 'package:mutluet_app/core/services/api_service.dart';
import 'package:provider/provider.dart';
import 'core/services/auth_service.dart';
import 'core/theme/app_theme.dart';
import 'features/auth/presentation/screens/login_screen.dart';
import 'features/home/presentation/screens/home_screen.dart'; // Oluşturulacak

void main() {
  runApp(
    // Uygulamanın state'lerini (durumlarını) yönetmek için
    // servislerimizi en üst seviyede sağlıyoruz.
    MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => AuthService()),
        // Buraya gelecekte başka provider'lar eklenebilir.
        // Örneğin: Provider(create: (_) => ApiService()),
      ],
      child: const MutluetApp(),
    ),
  );
}

class MutluetApp extends StatelessWidget {
  const MutluetApp({super.key});
  
  // NavigatorKey'ı ApiService gibi yerlerden context olmadan
  // erişim sağlamak için statik olarak tanımlıyoruz.
  static final GlobalKey<NavigatorState> navigatorKey = GlobalKey<NavigatorState>();

  @override
  Widget build(BuildContext context) {
    // ApiService'e navigatorKey'ı atıyoruz.
    ApiService.navigatorKey = navigatorKey;

    return MaterialApp(
      title: 'Mutluet',
      theme: AppTheme.lightTheme,
      debugShowCheckedModeBanner: false,
      navigatorKey: navigatorKey,
      
      // Consumer<AuthService> kullanarak kullanıcının giriş durumunu dinliyoruz.
      // Giriş yapılmışsa HomeScreen'e, yapılmamışsa LoginScreen'e yönlendiriyoruz.
      home: Consumer<AuthService>(
        builder: (context, authService, child) {
          if (authService.isAuthenticated) {
            // TODO: HomeScreen'i oluştur.
            return HomeScreen(); 
          } else {
            return LoginScreen();
          }
        },
      ),
      // Rotaları (sayfa yollarını) burada tanımlayabiliriz.
      // routes: {
      //   '/login': (context) => LoginScreen(),
      //   '/home': (context) => HomeScreen(),
      // },
    );
  }
}
