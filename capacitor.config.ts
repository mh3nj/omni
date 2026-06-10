import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.omni.app',
  appName: 'Omni',
  webDir: 'dist',  // or 'build' - wherever your build output goes
  bundledWebRuntime: false,
  server: {
    androidScheme: 'https',
    // NO "url" field! This ensures it loads local files, not a server
  },
  android: {
    buildOptions: {
      keystorePath: '',
      keystorePassword: '',
      keystoreAlias: '',
      keystoreAliasPassword: '',
    },
  },
};

export default config;