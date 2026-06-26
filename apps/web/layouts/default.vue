<template>
  <div class="min-h-screen">
    <header class="border-b">
      <div class="container flex items-center justify-between py-4">
        <NuxtLink to="/" class="text-lg font-bold tracking-tight">◇ Turnstile</NuxtLink>
        <nav class="text-sm text-muted-foreground">discover events</nav>
      </div>
    </header>
    <main class="container py-10">
      <slot />
    </main>
  </div>
</template>
