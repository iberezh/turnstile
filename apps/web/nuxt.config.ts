// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-01-01',
  devtools: { enabled: true },
  devServer: { port: 3003 },
  modules: ['@nuxtjs/tailwindcss', 'shadcn-nuxt'],
  css: ['~/assets/css/tailwind.css'],
  // shadcn-vue components live in components/ui and are used without a prefix (<Button/>).
  shadcn: { prefix: '', componentDir: '~/components/ui' },
  app: {
    head: {
      // Default to the dark theme (shadcn .dark token set).
      htmlAttrs: { lang: 'en', class: 'dark' },
      titleTemplate: '%s · Turnstile',
    },
  },
  runtimeConfig: {
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE ?? 'http://localhost:4002/api/v1',
    },
  },
});
