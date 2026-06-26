<template>
  <div class="min-h-screen">
    <header class="sticky top-0 z-30 border-b border-border/70 bg-background/85 backdrop-blur">
      <div class="container flex h-16 items-center justify-between">
        <NuxtLink to="/" aria-label="Turnstile home">
          <Logo />
        </NuxtLink>
        <nav class="flex items-center gap-2 sm:gap-4">
          <NuxtLink
            to="/"
            class="hidden px-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground sm:block"
          >
            What's on
          </NuxtLink>
          <NuxtLink
            to="/dashboard"
            class="rounded-md bg-primary px-3.5 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Sell tickets
          </NuxtLink>
          <ThemeToggle />
        </nav>
      </div>
    </header>

    <main>
      <slot />
    </main>

    <footer class="mt-24 border-t border-border/70">
      <div class="container flex flex-col items-center justify-between gap-4 py-10 sm:flex-row">
        <Logo />
        <p class="text-sm text-muted-foreground">Live events · walk right in</p>
      </div>
    </footer>
  </div>
</template>
