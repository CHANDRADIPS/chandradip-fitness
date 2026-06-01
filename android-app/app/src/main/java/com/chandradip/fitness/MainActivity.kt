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

    // Swap these lines when deploying live to Render!
    // 1. Local emulator testing:
    private val serverUrl = "http://10.0.2.2:8000"
    // 2. Production live URL (uncomment and replace with your actual Render service URL once live):
    // private val serverUrl = "https://cds-fitness.onrender.com"

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
                // If it fails to load the local backend server, render a beautiful Sadhana error card
                if (request?.isForMainFrame == true) {
                    val errorHtml = """
                        <!DOCTYPE html>
                        <html>
                        <head>
                            <meta charset="utf-8">
                            <meta name="viewport" content="width=device-width, initial-scale=1">
                            <title>CDS Fitness — Offline</title>
                            <link rel="preconnect" href="https://fonts.googleapis.com" />
                            <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
                            <link href="https://fonts.googleapis.com/css2?family=Marcellus&family=Outfit:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
                            <style>
                                body {
                                    background-color: #090606;
                                    color: #F3F4F6;
                                    font-family: 'Outfit', sans-serif;
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
                                    background-color: #151110;
                                    border: 1px solid rgba(255, 255, 255, 0.05);
                                    border-top: 3px solid #f97316;
                                    border-radius: 16px;
                                    padding: 30px;
                                    max-width: 450px;
                                    box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5);
                                }
                                h1 {
                                    font-family: 'Marcellus', serif;
                                    color: #FFFFFF;
                                    font-size: 24px;
                                    margin-top: 0;
                                    margin-bottom: 10px;
                                    text-shadow: 0 0 10px rgba(249, 115, 22, 0.25);
                                    text-transform: uppercase;
                                }
                                h2 {
                                    color: #f97316;
                                    font-size: 14px;
                                    margin-bottom: 20px;
                                    text-transform: uppercase;
                                    letter-spacing: 1px;
                                }
                                p {
                                    font-size: 14px;
                                    color: #9CA3AF;
                                    line-height: 1.6;
                                }
                                .btn {
                                    background: linear-gradient(135deg, #f97316 0%, #ea580c 100%);
                                    border: 1px solid #ea580c;
                                    color: #FFFFFF;
                                    padding: 12px 24px;
                                    border-radius: 8px;
                                    text-decoration: none;
                                    display: inline-block;
                                    margin-top: 20px;
                                    font-weight: 600;
                                    cursor: pointer;
                                    box-shadow: 0 4px 15px rgba(249, 115, 22, 0.2);
                                }
                            </style>
                        </head>
                        <body>
                            <div class="card">
                                <h1>🔱 Sadhana Mainframe Offline 🔱</h1>
                                <h2>Connection Timeout</h2>
                                <p>
                                    The mobile app could not connect to your fitness backend. 
                                    Please ensure your Express server is running on your host computer:
                                </p>
                                <code style="background-color:#0e0a0a; padding: 8px 12px; border-radius: 6px; color:#f97316; display:block; margin: 10px 0; border: 1px solid rgba(255,255,255,0.05); font-family: monospace;">node server.js</code>
                                <p>Then tap below to reconnect your discipline logs.</p>
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
