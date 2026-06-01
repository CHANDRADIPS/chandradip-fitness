# Chandradip Fitness - Android App Wrapper

This directory contains a complete, ready-to-import **Android Studio** project that wraps your Mahabharata-themed fitness application in a high-performance Android package.

## Features
- **Full-Screen WebView Integration**: Uses hardware-accelerated layouts to display your custom CSS client in full mobile fidelity.
- **Pitch-Black System Bar Integration**: Lock colors so Android's native status bar aligns with your pitch-black and gold theme.
- **Host Loopback Configuration**: Configured out of the box to load `http://10.0.2.2:8000` which automatically connects to the Node.js SQL server running on your computer from the emulator.
- **Timeless Connection Fallback**: If the server is offline, the app displays a beautiful ancient-style recovery page guiding you to start the server!

## How to Compile & Run

1. **Start the Backend Server**:
   Make sure your backend is active in your terminal:
   ```bash
   node server.js
   ```

2. **Open in Android Studio**:
   - Open Android Studio.
   - Click **File -> Open...** and select the `android-app` folder inside `e:\chandradip-fitness\android-app`.
   - Android Studio will automatically resolve Gradle dependencies and sync the project.

3. **Run on Emulator or Device**:
   - Create or start an Android Virtual Device (AVD) or connect your physical Android phone with USB Debugging enabled.
   - Click the green **Run** button (or press `Shift + F10`).
   - The app will build, install, and load your fitness dashboard in real-time!

4. **Running on Physical Device (WiFi Sync)**:
   - If running on a physical Android phone, change the `serverUrl` in `MainActivity.kt` from `http://10.0.2.2:8000` to your computer's local IP address (e.g. `http://192.168.1.XX:8000`), ensuring both devices are on the same WiFi network.
