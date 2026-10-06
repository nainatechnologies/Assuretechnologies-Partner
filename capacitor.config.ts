import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.assuretechnologies.partner',
  appName: 'Assure Partner',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
    // hostname: 'assuretech.chenchala.com'
    hostname: 'assuretechnologies-backend-production.up.railway.app'
  },
  plugins: {
    CapacitorHttp: {
      enabled: true,
    },
  },
};

export default config;
