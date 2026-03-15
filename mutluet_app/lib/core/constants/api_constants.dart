class ApiConstants {
  static const String baseUrl = 'https://mutluet-api.azurewebsites.net/api';
  
  // Auth Endpoints
  static const String login = '$baseUrl/auth/login';
  static const String register = '$baseUrl/auth/register';
  static const String googleAuth = '$baseUrl/auth/google';
  
  // Events
  static const String events = '$baseUrl/events';
  
  // Donations
  static const String donations = '$baseUrl/donations';
  
  // Users
  static const String users = '$baseUrl/users';
}
