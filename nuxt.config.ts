// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  ssr: true,

  app: {
    head: {
      titleTemplate: 'Gåsebäck — %s',
      htmlAttrs: {
        lang: 'en'
      },
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'format-detection', content: 'telephone=no' }
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
        { rel: "apple-touch-icon", sizes: "180x180", href: "/apple-touch-icon.png" },
        { rel: "icon", type: "image/png", sizes: "32x32", href: "/favicon-32x32.png" },
        { rel: "icon", type: "image/png", sizes: "16x16", href: "/favicon-16x16.png" },
        { rel: "mask-icon", href: "/safari-pinned-tab.svg", color: "#FBAF1D" },
        {
          rel: 'stylesheet',
          href: 'https://use.typekit.net/ijl5pip.css'
        }
      ]
    }
  },

  css: [
    '@/assets/css/main.css',
    '@/assets/css/buttonBlock.css',
  ],

  modules: [
    '@nuxt/content',
    '@nuxtjs/tailwindcss',
    '@nuxt/image',
  ],

  content: {
    // Content module configuration
  },

  image: {
    provider: 'ipx',
    dir: 'public',
    // Optional: default image options
    screens: {
      xs: 320,
      sm: 640,
      md: 768,
      lg: 1024,
      xl: 1280,
      xxl: 1536,
    },
    presets: {
      default: {
        modifiers: {
          format: 'webp',
          quality: 80,
        }
      }
    }
  },

  postcss: {
    plugins: {
      tailwindcss: {},
      autoprefixer: {},
    },
  },

  compatibilityDate: '2025-03-13',

  nitro: {
    prerender: {
      failOnError: false // Temporarily add this to debug image issues
    }
  }
})
