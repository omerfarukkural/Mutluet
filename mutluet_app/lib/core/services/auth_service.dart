import 'package:flutter/material.dart';
import 'api_service.dart';
import 'storage_service.dart';

// TODO: Kullanıcı modelini oluşturduktan sonra burayı güncelle.
// import '../../features/auth/domain/models/user_model.dart';

class AuthService with ChangeNotifier {
  final ApiService _apiService = ApiService();
  
  String? _token;
  // User? _user; // TODO: User modeli eklenecek

  String? get token => _token;
  // User? get user => _user;
  bool get isAuthenticated => _token != null;

  AuthService() {
    // Uygulama açıldığında token'ı yüklemeyi dene
    _loadTokenFromStorage();
  }

  Future<void> _loadTokenFromStorage() async {
    _token = await StorageService.getToken();
    if (_token != null) {
      // Token varsa, uygulama genelinde durumu güncelle.
      // İsteğe bağlı olarak burada kullanıcı bilgilerini API'den çekebiliriz.
      // await fetchUserDetails();
      notifyListeners();
    }
  }

  Future<void> login({required String email, required String password}) async {
    try {
      final response = await _apiService.post(
        ApiConstants.login,
        data: {
          'email': email,
          'password': password,
        },
      );

      if (response.statusCode == 200 && response.data is Map && response.data.containsKey('token')) {
        _token = response.data['token'];
        
        // TODO: Gelen kullanıcı verisini User modeline parse et.
        // _user = User.fromJson(response.data['user']);
        
        // Token'ı cihaza kaydet.
        await StorageService.saveToken(_token!);

        // UI'ı güncellemek için dinleyicileri bilgilendir.
        notifyListeners();
      } else {
        // API'den gelen hata mesajını kullan, yoksa genel bir mesaj göster.
        final errorMessage = response.data is Map ? response.data['message'] : 'Geçersiz yanıt';
        throw Exception(errorMessage ?? 'Giriş başarısız oldu');
      }
    } catch (e) {
      // Hata mesajını fırlat ki UI katmanı yakalayıp kullanıcıya gösterebilsin.
      throw Exception(e.toString());
    }
  }

  Future<void> logout() async {
    _token = null;
    // _user = null;
    
    // Cihazdan token'ı sil.
    await StorageService.deleteToken();
    
    notifyListeners();
  }
}
