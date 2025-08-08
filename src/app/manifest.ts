import type { MetadataRoute } from 'next'
 
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Tripid: AI-Driven Route Optimization',
    short_name: 'Tripid',
    description: 'A Progressive Web App for getting the most optimized and economic route',
    start_url: '/',
    display: 'standalone',
    background_color: '#4790cc',
    theme_color: '#ffffff',
    icons: [
        {
        "src": "/web-app-manifest-192x192.png",
        "sizes": "192x192",
        "type": "image/png",
        "purpose": "maskable"
        },
        {
        "src": "/web-app-manifest-512x512.png",
        "sizes": "512x512",
        "type": "image/png",
        "purpose": "maskable"
        }
    ],
    orientation: "portrait-primary",
    id: "tripid"
  }
}