# Otimização para remover código e recursos não utilizados
-dontwarn javax.**
-dontwarn org.apache.**
-dontwarn androidx.**

# Se o seu projeto usa o Firebase ou outras bibliotecas do Google, mantenha suas classes
-keep class com.google.firebase.** { *; }
-keep class com.google.android.gms.** { *; }
-dontwarn com.google.android.gms.**
-dontwarn com.google.firebase.**

# Exclui recursos internos de algumas bibliotecas populares (exemplo: Glide, Retrofit, etc.)
# Caso esteja usando essas bibliotecas, adicione as linhas para evitar que o ProGuard remova código necessário
-keep class com.bumptech.glide.** { *; }
-keep class retrofit2.** { *; }

# Para bibliotecas de terceiros que utilizam reflexão (por exemplo, Gson, Retrofit, etc.), mantenha as classes relevantes
-keepclassmembers class * {
    public <fields>;
    public <methods>;
}

# Caso esteja utilizando o WebView, preserve a interface de JavaScript
# Se seu projeto usa WebView com JS, descomente a linha abaixo e defina a interface corretamente:
# -keepclassmembers class fqcn.of.javascript.interface.for.webview {
#     public *;
# }

# Caso precise preservar a informação de linha para facilitar a depuração
-keepattributes SourceFile,LineNumberTable

# Caso precise renomear o nome do arquivo de origem, use a linha abaixo (isso pode reduzir um pouco o tamanho do APK)
# -renamesourcefileattribute SourceFile

# Remover os arquivos de debug e testes
-keep class com.example.** { *; }
-dontwarn com.example.**

# Minimiza a duplicação de classes
-dontwarn okhttp3.**
-dontwarn okio.**
