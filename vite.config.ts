import { VitePWA } from 'vite-plugin-pwa'
import {defineConfig} from "vite";
export default defineConfig({
    plugins: [
        VitePWA({
            registerType: 'autoUpdate',
            workbox: {
                globPatterns: ['**/*.{js,css,html,ico,png,svg}']
            },
            devOptions: {
                enabled: true
            },
            includeAssets: ['favicon.ico', 'apple-touch-icon.png'],
            manifest: {
                "name": "vagonWEB +",
                "short_name": "vagonWEB +",
                "icons": [
                    {
                        "src": "/android-chrome-192x192.png",
                        "sizes": "192x192",
                        "type": "image/png"
                    },
                    {
                        "src": "/android-chrome-512x512.png",
                        "sizes": "512x512",
                        "type": "image/png"
                    }
                ],
                "theme_color": "#233827FF",
                "background_color": "#233827FF",
                "display": "standalone"
            }
        })
    ]
})