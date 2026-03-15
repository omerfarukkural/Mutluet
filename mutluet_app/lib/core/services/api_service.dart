import 'package:dio/dio.dart';
import '../constants/api_constants.dart';
import 'auth_service.dart';
import 'storage_service.dart';

class ApiService {
  late final Dio _dio;

  // Global bir navigator key'e erişim için bir setter.
  // Bu sayede herhangi bir yerden context olmadan yönlendirme yapabiliriz.
  static GlobalKey<NavigatorState>? navigatorKey;

  ApiService() {
    _dio = Dio(
      BaseOptions(
        baseUrl: ApiConstants.baseUrl,
        connectTimeout: Duration(seconds: 30),
        receiveTimeout: Duration(seconds: 30),
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      ),
    );

    _dio.interceptors.add(
      InterceptorsWrapper(
        onRequest: (options, handler) async {
          // Depolama servisinden token'ı oku
          final token = await StorageService.getToken();
          if (token != null) {
            // Token varsa, her isteğin header'ına ekle
            options.headers['Authorization'] = 'Bearer $token';
          }
          return handler.next(options);
        },
        onError: (error, handler) {
          // Eğer 401 (Unauthorized) hatası alırsak, token geçersiz veya süresi dolmuş demektir.
          if (error.response?.statusCode == 401) {
            // Kullanıcıyı bilgilendir ve giriş ekranına yönlendir.
            // Bu işlemi doğrudan burada yapmak yerine, merkezi bir yerden yönetmek daha iyi olabilir.
            // Örneğin bir AuthService veya AppProvider üzerinden.
            // Şimdilik basit bir print ile logluyoruz.
            print("Token expired or invalid. Logging out.");

            // AuthService'i çağırıp logout yaptırmak en temiz yöntem.
            // Ancak burada doğrudan bir instance oluşturmak yerine,
            // bunu state management üzerinden yönetmek daha doğru olur.
            // Bu kısım state management (Provider) kurulumundan sonra iyileştirilecek.
            
            // final context = navigatorKey?.currentContext;
            // if (context != null) {
            //   await Provider.of<AuthService>(context, listen: false).logout();
            // }

          }
          return handler.next(error);
        },
      ),
    );
  }

  // GET request
  Future<Response> get(String endpoint, {Map<String, dynamic>? queryParameters}) async {
    try {
      return await _dio.get(endpoint, queryParameters: queryParameters);
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  // POST request
  Future<Response> post(String endpoint, {dynamic data}) async {
    try {
      return await _dio.post(endpoint, data: data);
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  // PUT request
  Future<Response> put(String endpoint, {dynamic data}) async {
    try {
      return await _dio.put(endpoint, data: data);
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  // DELETE request
  Future<Response> delete(String endpoint) async {
    try {
      return await _dio.delete(endpoint);
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  String _handleError(DioException error) {
    String errorDescription = "";
    if (error.response != null && error.response!.data != null) {
        // API'den gelen özel bir hata mesajı varsa onu kullan
        final responseData = error.response!.data;
        if (responseData is Map<String, dynamic> && responseData.containsKey('message')) {
            return responseData['message'];
        }
    }

    switch (error.type) {
      case DioExceptionType.cancel:
        errorDescription = "İstek iptal edildi";
        break;
      case DioExceptionType.connectionTimeout:
        errorDescription = "Bağlantı zaman aşımına uğradı";
        break;
      case DioExceptionType.receiveTimeout:
        errorDescription = "Veri alımı zaman aşımına uğradı";
        break;
      case DioExceptionType.sendTimeout:
        errorDescription = "İstek gönderme zaman aşımına uğradı";
        break;
      case DioExceptionType.badResponse:
        errorDescription = "Sunucudan geçersiz yanıt: ${error.response?.statusCode}";
        break;
      case DioExceptionType.unknown:
        errorDescription = "Bağlantı hatası, internetinizi kontrol edin";
        break;
      case DioExceptionType.badCertificate:
        errorDescription = "Geçersiz SSL sertifikası";
        break;
      case DioExceptionType.connectionError:
        errorDescription = "Bağlantı hatası";
        break;
    }
    return errorDescription;
  }
}
