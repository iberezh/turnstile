<script setup lang="ts">
const values = [
  {
    title: 'For organizers',
    body: 'Spin up an event in minutes, set your tiers, and take payment straight into your own Stripe account. Scan tickets at the door from any phone.',
  },
  {
    title: 'For attendees',
    body: 'Find what’s on near you, buy in seconds, and keep every ticket in one place. A QR on your phone is all you need to get in.',
  },
  {
    title: 'Built fair',
    body: 'One flat 5% platform fee, no hidden add-ons. Money settles to the organizer directly — we never sit between you and your payout.',
  },
];

useSeoMeta({
  title: 'About',
  description: 'Turnstile is a two-sided marketplace for live events — sell tickets, discover what’s near you, and walk right in.',
});
</script>

<template>
  <section class="container max-w-3xl pb-20 pt-28">
    <p class="font-display text-xs font-semibold uppercase tracking-[0.22em] text-primary">
      About Turnstile
    </p>
    <h1 class="mt-4 font-display text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
      Built so you can walk right in.
    </h1>
    <div class="mt-6 space-y-4 text-lg text-muted-foreground">
      <p>
        Turnstile is a two-sided marketplace for live events. Organizers list and sell; people
        discover and buy. Tickets live on the phone, and the door reads a QR in a second — no
        printouts, no will-call queue, no clipboard.
      </p>
      <p>
        We started it because going out should feel effortless on both sides of the gate: simple
        enough that a first-time promoter can sell their first ticket tonight, and sturdy enough
        that a sold-out venue trusts every scan.
      </p>
    </div>

    <div class="mt-12 grid gap-5 sm:grid-cols-3">
      <div v-for="v in values" :key="v.title" class="rounded-xl border bg-card p-5">
        <h2 class="font-display text-base font-semibold">{{ v.title }}</h2>
        <p class="mt-2 text-sm leading-relaxed text-muted-foreground">{{ v.body }}</p>
      </div>
    </div>

    <div class="mt-12 flex flex-wrap items-center gap-3">
      <NuxtLink
        to="/dashboard"
        class="rounded-lg bg-primary px-6 py-3 font-display text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
      >
        Start selling
      </NuxtLink>
      <NuxtLink
        to="/#whats-on"
        class="rounded-lg border border-border px-6 py-3 font-display text-sm font-semibold transition-colors hover:bg-secondary"
      >
        Find events
      </NuxtLink>
    </div>
  </section>
</template>
