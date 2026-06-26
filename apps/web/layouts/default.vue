<template>
  <div class="min-h-screen">
    <SiteHeader />
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
