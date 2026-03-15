import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../../core/services/auth_service.dart';

class HomeScreen extends StatelessWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    // AuthService'e erişmek için Provider'ı kullanıyoruz.
    final authService = context.read<AuthService>();

    return Scaffold(
      appBar: AppBar(
        title: Text('Ana Sayfa'),
        actions: [
          // Çıkış yapma butonu
          IconButton(
            icon: Icon(Icons.logout),
            onPressed: () async {
              // AuthService üzerinden çıkış yapma fonksiyonunu çağırıyoruz.
              await authService.logout();
              
              // Login ekranına geri yönlendirme main.dart'taki Consumer
              // tarafından otomatik olarak yapılacak.
            },
          ),
        ],
      ),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Text(
              'Giriş Başarılı!',
              style: Theme.of(context).textTheme.headlineMedium,
            ),
            SizedBox(height: 20),
            // TODO: Giriş yapan kullanıcının bilgilerini burada gösterebiliriz.
            // Text('Hoş geldin, ${authService.user?.name ?? 'Kullanıcı'}'),
            Text('Mutluet Uygulamasına Hoş Geldiniz.'),
          ],
        ),
      ),
    );
  }
}
