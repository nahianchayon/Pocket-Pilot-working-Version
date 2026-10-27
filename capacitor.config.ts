import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.pocketpilot.tracker',
  appName: 'PocketPilot',
  webDir: 'dist',
  server: {
    // Loads the live app inside the Android shell so the SSR
    // routes, Supabase auth, and database all work with zero rebuild.
    // Rebuild the APK only when you want to change native settings.
    url: 'https://pocketpilotexpensetracker.app',
    cleartext: false,
    androidScheme: 'https',
  },
  android: {
    backgroundColor: '#F0F6FF',
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 1500,
      backgroundColor: '#0056D2',
      showSpinner: false,
    },
    StatusBar: {
      style: 'LIGHT',
      backgroundColor: '#0056D2',
    },
  },
};

export default config;
