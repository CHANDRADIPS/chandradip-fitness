package com.chandradip.fitness

import android.os.Bundle
import android.webkit.WebResourceError
import android.webkit.WebResourceRequest
import android.webkit.WebView
import android.webkit.WebViewClient
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity

class MainActivity : AppCompatActivity() {

    private lateinit var webView: WebView

    // IP 10.0.2.2 is the special host loopback address in Android Emulators
    // representing the localhost of the running machine (your computer).
    private val serverUrl = "http://10.0.2.2:8000"

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        webView = findViewById(R.id.arenaWebView)
        setupWebView()
    }

    private fun setupWebView() {
        val settings = webView.settings
        
        // Critical settings for modern Single Page web applications
        settings.javaScriptEnabled = true
        settings.domStorageEnabled = true
        settings.allowFileAccess = true
        settings.allowContentAccess = true
        settings.databaseEnabled = true
        settings.useWideViewPort = true
        settings.loadWithOverviewMode = true

        // Keep page navigation within the WebView instead of opening Chrome
        webView.webViewClient = object : WebViewClient() {
            override fun shouldOverrideUrlLoading(
                view: WebView?,
                request: WebResourceRequest?
            ): Boolean {
                view?.loadUrl(request?.url.toString())
                return true
            }

            override fun onReceivedError(
                view: WebView?,
                request: WebResourceRequest?,
                error: WebResourceError?
            ): Boolean {
                // If it fails to load the local backend server, render a beautiful Mahabharata error card
                if (request?.isForMainFrame == true) {
                    val errorHtml = """
                        <!DOCTYPE html>
                        <html>
                        <head>
                            <meta charset="utf-8">
                            <meta name="viewport" content="width=device-width, initial-scale=1">
                            <title>Kurukshetra Battle Offline</title>
                            <style>
                                body {
                                    background-color: #080808;
                                    color: #FFFFFF;
                                    font-family: 'Cinzel', serif, sans-serif;
                                    display: flex;
                                    flex-direction: column;
                                    align-items: center;
                                    justify-content: center;
                                    height: 100vh;
                                    margin: 0;
                                    text-align: center;
                                    padding: 20px;
                                }
                                .card {
                                    background-color: #141414;
                                    border: 2px solid #FFD700;
                                    border-radius: 12px;
                                    padding: 30px;
                                    max-width: 450px;
                                    box-shadow: 0 10px 20px rgba(0,0,0,0.6);
                                }
                                h1 {
                                    color: #FFD700;
                                    font-size: 24px;
                                    margin-bottom: 10px;
                                }
                                h2 {
                                    color: #FF7600;
                                    font-size: 16px;
                                    margin-bottom: 20px;
                                }
                                p {
                                    font-size: 14px;
                                    color: #A5A5A5;
                                    line-height: 1.6;
                                }
                                .btn {
                                    background-color: #E53935;
                                    border: 1px solid #FFD700;
                                    color: #FFFFFF;
                                    padding: 12px 20px;
                                    border-radius: 6px;
                                    text-decoration: none;
                                    display: inline-block;
                                    margin-top: 20px;
                                    font-weight: bold;
                                    cursor: pointer;
                                }
                            </style>
                        </head>
                        <body>
                            <div class="card">
                                <h1>🔱 Kurukshetra Gate Closed 🔱</h1>
                                <h2>Host Server Offline</h2>
                                <p>
                                    The Android App could not connect to the fitness backend. 
                                    Please ensure your Express server is running on your host computer:
                                </p>
                                <code style="background-color:#1f1f1f; padding: 5px 10px; border-radius: 4px; color:#FFD700; display:block; margin: 10px 0;">node server.js</code>
                                <p>Then tap below to re-enter the battle arena.</p>
                                <div class="btn" onclick="location.reload()">Retry Connection</div>
                            </div>
                        </body>
                        </html>
                    """.trimIndent()
                    
                    view?.loadDataWithBaseURL(null, errorHtml, "text/html", "UTF-8", null)
                }
                return true
            }
        }

        // Load the server URL
        webView.loadUrl(serverUrl)
    }

    override fun onBackPressed() {
        if (webView.canGoBack()) {
            webView.goBack()
        } else {
            super.onBackPressed()
        }
    }
}
