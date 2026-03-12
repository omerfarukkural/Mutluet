# Retrofit + OkHttp
-dontwarn okhttp3.**
-dontwarn retrofit2.**
-keep class retrofit2.** { *; }
-keepattributes Signature
-keepattributes Exceptions

# Kotlinx Serialization
-keepattributes *Annotation*, InnerClasses
-dontnote kotlinx.serialization.AnnotationsKt
-keepclassmembers class kotlinx.serialization.json.** { *** Companion; }
-keepclasseswithmembers class **$$serializer { *; }
-keepclassmembers @kotlinx.serialization.Serializable class ** {
    *** Companion;
    *** INSTANCE;
    kotlinx.serialization.KSerializer serializer(...);
}
-keep,includedescriptorclasses class com.mutluet.optimizer.**$$serializer { *; }
-keepclassmembers class com.mutluet.optimizer.** {
    @kotlinx.serialization.Serializable <fields>;
}

# Hilt
-keep class dagger.hilt.** { *; }

# LaunchDarkly EventSource
-dontwarn com.launchdarkly.**
-keep class com.launchdarkly.** { *; }
