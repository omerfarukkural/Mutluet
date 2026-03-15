import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../../core/services/auth_service.dart';

class LoginScreen extends StatefulWidget {
  @override
  _LoginScreenState createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _formKey = GlobalKey<FormState>();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  bool _isLoading = false;

  Future<void> _login() async {
    // Form geçerli değilse işlemi başlatma.
    if (!(_formKey.currentState?.validate() ?? false)) return;
    
    setState(() => _isLoading = true);
    
    try {
      // Provider ile AuthService'e erişip login fonksiyonunu çağırıyoruz.
      // listen: false çünkü burada sadece bir fonksiyonu çağırıyoruz,
      // state'i dinleyerek UI'ı yeniden çizmeye ihtiyacımız yok.
      await context.read<AuthService>().login(
        email: _emailController.text.trim(),
        password: _passwordController.text.trim(),
      );
      
      // Giriş başarılı olursa, main.dart'taki Consumer bizi otomatik olarak
      // HomeScreen'e yönlendireceği için burada bir yönlendirme kodu yazmıyoruz.
      
    } catch (e) {
      // Giriş başarısız olursa kullanıcıya hata mesajı göster.
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(e.toString().replaceFirst('Exception: ', '')),
          backgroundColor: Theme.of(context).colorScheme.error,
        ),
      );
    } finally {
      // İşlem bittiğinde (başarılı veya başarısız) loading state'ini kaldır.
      if (mounted) {
        setState(() => _isLoading = false);
      }
    }
  }

  @override
  void dispose() {
    _emailController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: Center(
          child: SingleChildScrollView(
            padding: EdgeInsets.all(24),
            child: Form(
              key: _formKey,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  // TODO: 'assets/images/logo.png' dosyasını eklemeniz gerekmektedir.
                  // Image.asset('assets/images/logo.png', height: 80),
                  Text('Mutluet', textAlign: TextAlign.center, style: Theme.of(context).textTheme.headlineLarge?.copyWith(fontWeight: FontWeight.bold)),
                  SizedBox(height: 8),
                  Text('Gönüllülük ve Sosyal Etki Platformu', textAlign: TextAlign.center, style: Theme.of(context).textTheme.titleMedium),
                  SizedBox(height: 40),
                  
                  // Email
                  TextFormField(
                    controller: _emailController,
                    keyboardType: TextInputType.emailAddress,
                    decoration: InputDecoration(
                      labelText: 'E-posta',
                      prefixIcon: Icon(Icons.email_outlined),
                    ),
                    validator: (value) {
                      if (value?.isEmpty ?? true) return 'E-posta alanı boş bırakılamaz';
                      if (!value!.contains('@') || !value.contains('.')) return 'Geçerli bir e-posta adresi giriniz';
                      return null;
                    },
                  ),
                  SizedBox(height: 16),
                  
                  // Password
                  TextFormField(
                    controller: _passwordController,
                    obscureText: true,
                    decoration: InputDecoration(
                      labelText: 'Şifre',
                      prefixIcon: Icon(Icons.lock_outline),
                    ),
                    validator: (value) {
                      if (value?.isEmpty ?? true) return 'Şifre alanı boş bırakılamaz';
                      if (value!.length < 6) return 'Şifre en az 6 karakter olmalıdır';
                      return null;
                    },
                  ),
                  SizedBox(height: 24),
                  
                  // Login Button
                  ElevatedButton(
                    style: ElevatedButton.styleFrom(
                      padding: EdgeInsets.symmetric(vertical: 16),
                    ),
                    onPressed: _isLoading ? null : _login,
                    child: _isLoading
                        ? SizedBox(
                            height: 24,
                            width: 24,
                            child: CircularProgressIndicator(
                              strokeWidth: 3,
                              valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
                            ),
                          )
                        : Text('Giriş Yap', style: TextStyle(fontSize: 16)),
                  ),
                  
                  SizedBox(height: 24),
                  
                  // Google Sign In
                  OutlinedButton.icon(
                    style: OutlinedButton.styleFrom(
                      padding: EdgeInsets.symmetric(vertical: 12),
                    ),
                    onPressed: () {
                      // TODO: Google ile giriş implemente edilecek
                    },
                    // TODO: 'assets/icons/google.png' dosyasını eklemeniz gerekmektedir.
                    // icon: Image.asset('assets/icons/google.png', height: 20),
                    icon: Icon(Icons.g_mobiledata), // Placeholder icon
                    label: Text('Google ile Devam Et'),
                  ),
                  
                  SizedBox(height: 20),
                  
                  // Register Link
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Text('Hesabın yok mu?'),
                      TextButton(
                        onPressed: _isLoading ? null : () {
                          // TODO: Kayıt ol ekranına yönlendirme yapılacak.
                          // Navigator.pushNamed(context, '/register');
                        },
                        child: Text('Hemen Kayıt Ol'),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}
