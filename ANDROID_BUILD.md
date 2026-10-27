# PocketPilot — Build the Android APK

This project is already wrapped as a native Android app via Capacitor.
The Android shell loads the deployed web app so every feature (auth,
database, OTP) works the same as in the browser.

You need to build the APK on your **own computer** (Play Store / Android
Studio signing must happen on your machine).

## One-time setup on your computer

1. Install **Node.js 20+**, **Bun** (or npm), **Java JDK 21**, and
   **Android Studio** (https://developer.android.com/studio).
2. In Android Studio → SDK Manager, install **Android SDK Platform 35** and
   **Build-Tools 35.0.0**.

## Get the code

1. Clone the repository locally and install dependencies:
   ```bash
   git clone <your-repo-url> pocketpilot && cd pocketpilot
   bun install        # or: npm install
   ```

## Add the Android platform (first time only)

```bash
bunx cap add android
bunx cap sync android
```

This creates an `android/` folder — a real Android Studio project.

## Run on a device / emulator (debug)

```bash
bunx cap run android
```

Or open Android Studio: `bunx cap open android`, then click ▶.

The APK installs and immediately shows PocketPilot pulling the live site.

## Build a release APK / AAB for Play Store

1. `bunx cap open android`
2. In Android Studio: **Build → Generate Signed Bundle / APK**
3. Create a keystore (keep it safe — you need it for every future update).
4. Choose **Android App Bundle (.aab)** for Play Store, or **APK** for
   direct install.
5. Select `release` build variant → Finish.
6. Upload the `.aab` to https://play.google.com/console (one-time $25 fee).

## When you change the web app

You don't need to rebuild anything — the Android shell loads the live URL,
so pushing an update to the deployed web app reaches Android users instantly.

You only rebuild the APK when you change native settings (app icon, splash,
permissions, plugins).

## Offline / bundled mode (optional, later)

If you later want the app to work offline, remove the `server.url` line in
`capacitor.config.ts`, run `bun run build`, then `bunx cap sync android`.
Capacitor will bundle the built assets into the APK.
