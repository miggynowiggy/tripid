import type { MetadataRoute } from 'next'
 
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Tripid',
    short_name: 'Tripid',
    description: 'Get the most optimized and economical trip with Tripid',
    start_url: '/',
    display: 'standalone',
    background_color: '#4790cc',
    theme_color: '#4790cc',
    icons: [
      {
        src: '/icon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  }
}