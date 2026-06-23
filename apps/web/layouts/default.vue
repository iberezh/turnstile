<template>
  <div>
    <header class="site-header">
      <div class="container">
        <NuxtLink to="/" class="brand">◇ Turnstile</NuxtLink>
        <nav class="muted">discover events</nav>
      </div>
    </header>
    <main>
      <div class="container">
        <slot />
      </div>
    </main>
  </div>
</template>
