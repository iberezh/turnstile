<script setup lang="ts">
useSeoMeta({
  title: 'Trusted by',
  description: 'The venues, promoters, and festivals that run their events on Turnstile.',
});
</script>

<template>
  <section class="container max-w-4xl pb-20 pt-28">
    <p class="font-display text-xs font-semibold uppercase tracking-[0.22em] text-primary">
      Trusted by
    </p>
    <h1 class="mt-4 max-w-2xl font-display text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
      The people who fill rooms run them on Turnstile.
    </h1>
    <p class="mt-4 max-w-xl text-lg text-muted-foreground">
      From corner clubs to multi-day festivals — these organizers sell, scan, and get paid here.
      Featured organizers also show up first when people search for events near them.
    </p>

    <div class="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
      <div
        v-for="c in featuredCustomers"
        :key="c.name"
        class="flex flex-col items-center gap-3 rounded-xl border bg-card p-5 text-center"
      >
        <span class="grid h-12 w-12 place-items-center rounded-xl bg-primary/10 font-display text-base font-semibold text-primary">
          {{ initials(c.name) }}
        </span>
        <div>
          <p class="text-sm font-semibold leading-tight">{{ c.name }}</p>
          <p class="mt-0.5 text-xs text-muted-foreground">{{ c.category }}</p>
        </div>
      </div>
    </div>

    <div class="mt-16 grid gap-5 md:grid-cols-3">
      <figure v-for="t in testimonials" :key="t.name" class="rounded-xl border bg-card p-6">
        <blockquote class="text-sm leading-relaxed">"{{ t.quote }}"</blockquote>
        <figcaption class="mt-4">
          <p class="font-display text-sm font-semibold">{{ t.name }}</p>
          <p class="text-xs text-muted-foreground">{{ t.role }}</p>
        </figcaption>
      </figure>
    </div>

    <div class="mt-16 rounded-2xl border bg-secondary/40 p-8 text-center">
      <h2 class="font-display text-2xl font-semibold tracking-tight">Want to be featured?</h2>
      <p class="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
        Featured organizers get promoted placement across the marketplace and in nearby search.
        Tell us about your events and we'll set you up.
      </p>
      <NuxtLink
        to="/contact"
        class="mt-5 inline-block rounded-lg bg-primary px-6 py-3 font-display text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
      >
        Get in touch
      </NuxtLink>
    </div>
  </section>
</template>
