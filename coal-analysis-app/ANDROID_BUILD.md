# Android 打包指南

将 Web App 打包为安卓原生 APK，以下提供两种方式。

## 方式一：Android Studio + WebView（推荐）

### 步骤

1. **构建前端项目**
   ```bash
   cd coal-analysis-app
   npm run build
   ```
   输出在 `dist/` 目录。

2. **创建 Android 项目**
   - 打开 Android Studio → New Project → Empty Views Activity
   - 项目名：`CoalAnalysis`，包名：`com.coal.analysis`

3. **将前端文件放入 assets**
   - 将 `dist/` 目录下的所有文件复制到 `app/src/main/assets/` 目录下
   - 确保 `index.html` 在 assets 根目录

4. **修改 MainActivity**

   ```kotlin
   // MainActivity.kt
   package com.coal.analysis

   import android.os.Bundle
   import android.webkit.WebView
   import android.webkit.WebViewClient
   import androidx.appcompat.app.AppCompatActivity

   class MainActivity : AppCompatActivity() {
       override fun onCreate(savedInstanceState: Bundle?) {
           super.onCreate(savedInstanceState)
           val webView = WebView(this)
           setContentView(webView)
           
           webView.settings.apply {
               javaScriptEnabled = true
               allowFileAccess = true
               domStorageEnabled = true
               loadWithOverviewMode = true
               useWideViewPort = true
               builtInZoomControls = false
           }
           
           webView.webViewClient = WebViewClient()
           webView.loadUrl("file:///android_asset/index.html")
       }
       
       override fun onBackPressed() {
           val webView = findViewById<WebView>(android.R.id.content).getChildAt(0) as? WebView
           if (webView?.canGoBack() == true) {
               webView.goBack()
           } else {
               super.onBackPressed()
           }
       }
   }
   ```

5. **配置 AndroidManifest.xml**

   ```xml
   <application
       android:allowBackup="true"
       android:label="煤炭工业分析计算器"
       android:supportsRtl="true"
       android:theme="@style/Theme.AppCompat.Light.NoActionBar">
       <activity
           android:name=".MainActivity"
           android:exported="true"
           android:screenOrientation="portrait">
           <intent-filter>
               <action android:name="android.intent.action.MAIN" />
               <category android:name="android.intent.category.LAUNCHER" />
           </intent-filter>
       </activity>
   </application>
   ```

6. **构建 APK**
   - Build → Build Bundle(s) / APK(s) → Build APK(s)
   - 生成的 APK 在 `app/build/outputs/apk/debug/`

## 方式二：使用 HBuilder (uni-app)

1. 在 HBuilder 中新建 Wap2App 项目
2. 将 `dist/` 目录内容放入
3. 打包为 APK

## 方式三：PWA（无需打包）

直接部署到任何静态服务器（如 GitHub Pages），用户用 Chrome 打开后：
1. 点击地址栏右侧的"安装"图标
2. 即可像原生 App 一样使用

## 注意事项

- 最小支持 Android 5.0 (API 21)
- 建议使用 Android 8.0+ 以获得最佳体验
- 在 WebView 中运行时，确保允许 JavaScript 执行
- 应用完全离线工作，无需网络权限
