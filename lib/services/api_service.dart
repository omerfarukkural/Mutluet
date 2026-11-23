import 'dart:convert';
import 'package:http/http.dart' as http;

class ApiService {
  // Production'da backend URL'nizi buraya yazın
  static const String baseUrl = 'https://mutluet-backend.vercel.app/api';
  
  static Map<String, String> get _headers => {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };

  // Auth: Giriş Yap
  static async Future<Map<String, dynamic>> login(String email, String password) async {
    final response = await http.post(
      Uri.parse('$baseUrl/auth/login'),
      headers: _headers,
      body: jsonEncode({
        'email': email,
        'password': password,
      }),
    );

    return _processResponse(response);
  }

  // Events: Etkinlikleri Getir
  static async Future<List<dynamic>> getEvents() async {
    final response = await http.get(
      Uri.parse('$baseUrl/events'),
      headers: _headers,
    );

    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    } else {
      throw Exception('Etkinlikler yüklenemedi: ${response.statusCode}');
    }
  }

  // Donations: Bağış Yap
  static async Future<Map<String, dynamic>> createDonation(Map<String, dynamic> data) async {
    final response = await http.post(
      Uri.parse('$baseUrl/donations'),
      headers: _headers,
      body: jsonEncode(data),
    );

    return _processResponse(response);
  }

  // Yardımcı Fonksiyon: Response İşleme
  static Map<String, dynamic> _processResponse(http.Response response) {
    final Map<String, dynamic> data = jsonDecode(response.body);
    if (response.statusCode >= 200 && response.statusCode < 300) {
      return data;
    } else {
      throw Exception(data['message'] ?? 'Bir hata oluştu: ${response.statusCode}');
    }
  }
}
