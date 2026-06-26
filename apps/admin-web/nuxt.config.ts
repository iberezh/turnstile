// The admin console is a SPA (no SSR): it talks to the separate admin-api and is fully behind
// authentication, so there is nothing to server-render.
export default defineNuxtConfig({
  compatibilityDate: '2025-01-01',
  ssr: false,
  devtools: { enabled: true },
  devServer: { port: 3004 },
  modules: ['@nuxtjs/tailwindcss', 'shadcn-nuxt'],
  css: ['~/assets/css/tailwind.css'],
  shadcn: { prefix: '', componentDir: '~/components/ui' },
  app: {
    head: {
      htmlAttrs: { lang: 'en' },
      titleTemplate: '%s · Turnstile Admin',
    },
  },
  runtimeConfig: {
    public: {
      adminApiBase: process.env.NUXT_PUBLIC_ADMIN_API_BASE ?? 'http://localhost:4003/admin/v1',
    },
  },
});
