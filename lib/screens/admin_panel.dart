import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';

class AdminPanel extends StatefulWidget {
  const AdminPanel({super.key});

  @override
  State<AdminPanel> createState() => _AdminPanelState();
}

class _AdminPanelState extends State<AdminPanel> {
  final TextEditingController _instructionController = TextEditingController();
  final TextEditingController _githubTokenController = TextEditingController();
  bool _isProcessing = false;

  // GitHub Bilgileri (Buraları kendi bilgilerinizle doldurabilirsiniz veya bir Settings sayfasından alabiliriz)
  final String owner = 'omerfarukkural';
  final String repo = 'Mutluet';

  Future<void> _sendInstructionToGitHub() async {
    final String instruction = _instructionController.text;
    final String token = _githubTokenController.text;

    if (instruction.isEmpty || token.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Lütfen hem talimatı hem de GitHub Token\'ı girin.')),
      );
      return;
    }

    setState(() {
      _isProcessing = true;
    });

    try {
      final url = Uri.parse('https://api.github.com/repos/$owner/$repo/dispatches');
      final response = await http.post(
        url,
        headers: {
          'Authorization': 'token $token',
          'Accept': 'application/vnd.github.v3+json',
        },
        body: jsonEncode({
          'event_type': 'ai_instruction',
          'client_payload': {
            'instruction': instruction,
            'file': 'lib/screens/home_screen.dart', // Varsayılan olarak ana ekranı hedefliyoruz
          }
        }),
      );

      if (response.statusCode == 204) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Talimat GitHub\'a gönderildi! AI güncelleme süreci başladı.'),
            backgroundColor: Colors.green,
          ),
        );
        _instructionController.clear();
      } else {
        throw Exception('GitHub API Hatası: ${response.body}');
      }
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Hata: $e'), backgroundColor: Colors.red),
      );
    } finally {
      setState(() {
        _isProcessing = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Mutluet Admin Panel (AI Control)'),
        backgroundColor: Colors.blueGrey,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Yapay Zeka Talimat Merkezi',
              style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 20),
            const Text('1. GitHub Personal Access Token (PAT)', style: TextStyle(fontWeight: FontWeight.bold)),
            const SizedBox(height: 5),
            TextField(
              controller: _githubTokenController,
              obscureText: true,
              decoration: const InputDecoration(
                hintText: 'ghp_xxxxxxxxxxxx',
                border: OutlineInputBorder(),
                filled: true,
                fillColor: Colors.white,
              ),
            ),
            const SizedBox(height: 20),
            const Text('2. Değişiklik Talimatı', style: TextStyle(fontWeight: FontWeight.bold)),
            const SizedBox(height: 5),
            TextField(
              controller: _instructionController,
              maxLines: 5,
              decoration: const InputDecoration(
                hintText: 'Örn: Ana ekrandaki başlığı "Merhaba Dünya" yap.',
                border: OutlineInputBorder(),
                fillColor: Colors.white,
                filled: true,
              ),
            ),
            const SizedBox(height: 20),
            SizedBox(
              width: double.infinity,
              height: 50,
              child: ElevatedButton.icon(
                onPressed: _isProcessing ? null : _sendInstructionToGitHub,
                icon: _isProcessing 
                  ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                  : const Icon(Icons.auto_awesome),
                label: Text(_isProcessing ? 'İşleniyor...' : 'Talimatı Uygula ve OTA Güncelleme Başlat'),
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.blueAccent,
                  foregroundColor: Colors.white,
                ),
              ),
            ),
            const SizedBox(height: 40),
            const Divider(),
            const Center(
              child: Text(
                'Bu sistem GitHub Actions ve Shorebird kullanarak uygulamanızı markete gitmeden günceller.',
                textAlign: TextAlign.center,
                style: TextStyle(color: Colors.grey, fontSize: 12),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
