import {existsSync} from 'node:fs';
import {defineConfig} from '@playwright/test';

const basePath='/sw-arts-website/';
export default defineConfig({
  testDir:'tests',fullyParallel:true,workers:2,timeout:30000,
  use:{
    baseURL:`http://127.0.0.1:4173${basePath}`,headless:true,
    launchOptions:existsSync('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome')
      ?{executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'}:{},
    viewport:{width:1440,height:1000}
  },
  webServer:{
    command:'node tools/serve.mjs',
    env:{SITE_BASE_PATH:basePath},
    url:`http://127.0.0.1:4173${basePath}`
  },
  reporter:'list'
});
