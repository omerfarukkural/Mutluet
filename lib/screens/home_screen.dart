import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

class HomeScreen extends StatelessWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Mutluet Uygulaması'),
        actions: [
          IconButton(
            icon: const Icon(Icons.admin_panel_settings),
            onPressed: () => context.push('/admin'),
          ),
        ],
      ),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(Icons.sentiment_very_satisfied, size: 100, color: Colors.orange),
            const SizedBox(height: 20),
            const Text(
              'Mutluet Sistemine Hoş Geldiniz!',
              style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 10),
            const Text('Bu uygulama AI tarafından otomatik olarak güncellenebilir.'),
            const SizedBox(height: 30),
            ElevatedButton(
              onPressed: () {},
              child: const Text('Keşfetmeye Başla'),
            ),
            const SizedBox(height: 50),
            TextButton.icon(
              onPressed: () => context.push('/admin'),
              icon: const Icon(Icons.settings, color: Colors.grey),
              label: const Text('Admin Girişi (AI Kontrol)', style: TextStyle(color: Colors.grey)),
            ),
          ],
        ),
      ),
    );
  }
}
