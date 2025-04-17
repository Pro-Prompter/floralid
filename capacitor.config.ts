import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.android.floralid',
  appName: 'FloralID',
  webDir: 'out',
  server: {
    url: 'https://floralid.vercel.app',
    cleartext: true,
    androidScheme: 'https'
  },
  android: {
    buildOptions: {
      keystorePath: 'release-key.keystore',
      keystoreAlias: 'release-key-alias',
    }
  }
};

export default config;
