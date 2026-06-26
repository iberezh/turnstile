<template>
  <div class="min-h-screen">
    <header class="sticky top-0 z-30 border-b border-border/60 bg-background/80 backdrop-blur">
      <div class="container flex h-16 items-center justify-between">
        <NuxtLink to="/" aria-label="Turnstile home">
          <Logo />
        </NuxtLink>
        <nav class="flex items-center gap-6 font-mono text-xs uppercase tracking-widest text-muted-foreground">
          <NuxtLink to="/" class="transition-colors hover:text-foreground">What's on</NuxtLink>
          <NuxtLink
            to="/dashboard"
            class="rounded-md bg-primary/10 px-3 py-2 text-primary transition-colors hover:bg-primary/20"
          >
            Sell tickets
          </NuxtLink>
        </nav>
      </div>
    </header>

    <main>
      <slot />
    </main>

    <footer class="mt-24 border-t border-border/60">
      <div class="container flex flex-col items-center justify-between gap-4 py-10 sm:flex-row">
        <Logo />
        <p class="font-mono text-xs uppercase tracking-widest text-muted-foreground">
          Live events · walk right in
        </p>
      </div>
    </footer>
  </div>
</template>
