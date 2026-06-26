<script setup lang="ts">
import { Github } from 'lucide-vue-next';
</script>

<template>
  <div class="container">
    <div class="grid gap-12 py-16 md:grid-cols-[1.5fr_1fr_1fr_1fr] lg:py-20">
      <div>
        <span class="inline-flex items-center gap-2.5 text-white">
          <ChevronMark class="h-7 w-7" />
          <span class="font-display text-2xl font-semibold lowercase tracking-tight">turnstile</span>
        </span>
        <p class="mt-4 max-w-xs text-sm leading-relaxed text-white/55">
          Live events, one tap to the door. Discover, buy, and walk right in — no printouts, no
          queues.
        </p>
        <a
          href="https://github.com/iberezh/turnstile"
          target="_blank"
          rel="noreferrer"
          class="mt-6 inline-flex items-center gap-2 text-sm text-white/70 transition-colors hover:text-white"
        >
          <Github class="h-4 w-4" /> github.com/iberezh/turnstile
        </a>
      </div>

      <div>
        <h3 class="font-display text-xs font-semibold uppercase tracking-[0.18em] text-white/45">
          Marketplace
        </h3>
        <ul class="mt-4 space-y-3 text-sm">
          <li><NuxtLink to="/#whats-on" class="text-white/75 transition-colors hover:text-white">Browse events</NuxtLink></li>
          <li><NuxtLink to="/" class="text-white/75 transition-colors hover:text-white">All events</NuxtLink></li>
        </ul>
      </div>

      <div>
        <h3 class="font-display text-xs font-semibold uppercase tracking-[0.18em] text-white/45">
          Organizers
        </h3>
        <ul class="mt-4 space-y-3 text-sm">
          <li><NuxtLink to="/dashboard" class="text-white/75 transition-colors hover:text-white">Sell tickets</NuxtLink></li>
          <li><NuxtLink to="/trusted-by" class="text-white/75 transition-colors hover:text-white">Trusted by</NuxtLink></li>
          <li><NuxtLink to="/login" class="text-white/75 transition-colors hover:text-white">Sign in</NuxtLink></li>
        </ul>
      </div>

      <div>
        <h3 class="font-display text-xs font-semibold uppercase tracking-[0.18em] text-white/45">
          Company
        </h3>
        <ul class="mt-4 space-y-3 text-sm">
          <li><NuxtLink to="/about" class="text-white/75 transition-colors hover:text-white">About</NuxtLink></li>
          <li><NuxtLink to="/contact" class="text-white/75 transition-colors hover:text-white">Contact us</NuxtLink></li>
        </ul>
      </div>
    </div>

    <div
      class="flex flex-col items-center justify-between gap-3 border-t border-white/10 py-6 text-xs uppercase tracking-[0.18em] text-white/45 sm:flex-row"
    >
      <span class="font-display">© 2026 Turnstile</span>
      <span>Built with Nuxt · Koa · Stripe Connect</span>
    </div>
  </div>
</template>
