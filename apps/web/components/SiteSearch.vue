<script setup lang="ts">
import { Search } from 'lucide-vue-next';
import type { EventDto } from '~/types/event';

// Navbar search: an icon that opens a command-palette overlay. Type to live-search published events
// by name (the public GET /events?q= endpoint). "/" opens it from anywhere; Escape closes.
defineProps<{ scrolled: boolean }>();
const { public: cfg } = useRuntimeConfig();
const open = ref(false);
const q = ref('');
const results = ref<EventDto[]>([]);
const loading = ref(false);
const inputEl = ref<HTMLInputElement | null>(null);
let timer: ReturnType<typeof setTimeout> | undefined;

function show(): void {
  open.value = true;
  nextTick(() => inputEl.value?.focus());
}
function hide(): void {
  open.value = false;
  q.value = '';
  results.value = [];
}

watch(q, () => {
  if (timer) clearTimeout(timer);
  const term = q.value.trim();
  if (term.length < 2) {
    results.value = [];
    return;
  }
  timer = setTimeout(async () => {
    loading.value = true;
    try {
      results.value = await $fetch<EventDto[]>(`${cfg.apiBase}/events`, { query: { q: term, limit: 8 } });
    } finally {
      loading.value = false;
    }
  }, 300);
});

function onGlobalKey(e: KeyboardEvent): void {
  const tag = (e.target as HTMLElement | null)?.tagName ?? '';
  if (e.key === '/' && !open.value && !/INPUT|TEXTAREA/.test(tag)) {
    e.preventDefault();
    show();
  } else if (e.key === 'Escape' && open.value) {
    hide();
  }
}
onMounted(() => document.addEventListener('keydown', onGlobalKey));
onBeforeUnmount(() => document.removeEventListener('keydown', onGlobalKey));
watch(() => useRoute().fullPath, hide);
</script>

<template>
  <button
    type="button"
    aria-label="Search events"
    class="flex h-9 w-9 items-center justify-center rounded-full transition-colors"
    :class="scrolled ? 'text-background/80 hover:bg-background/20' : 'text-foreground/70 hover:bg-secondary'"
    @click="show"
  >
    <Search class="h-[18px] w-[18px]" />
  </button>

  <Teleport to="body">
    <div v-if="open" class="fixed inset-0 z-[70] bg-foreground/30 backdrop-blur-sm" @click="hide">
      <div
        class="absolute inset-x-4 top-[12vh] mx-auto max-w-lg overflow-hidden rounded-2xl border bg-popover text-popover-foreground shadow-2xl"
        @click.stop
      >
        <div class="flex items-center gap-2 border-b px-4">
          <Search class="h-4 w-4 shrink-0 text-muted-foreground" />
          <input
            ref="inputEl"
            v-model="q"
            type="text"
            placeholder="Search events by name…"
            class="h-12 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
        </div>
        <div data-testid="search-results" class="max-h-[55vh] overflow-y-auto p-2">
          <p v-if="loading" class="px-3 py-6 text-center text-sm text-muted-foreground">Searching…</p>
          <p v-else-if="q.trim().length >= 2 && !results.length" class="px-3 py-6 text-center text-sm text-muted-foreground">
            No events match "{{ q.trim() }}".
          </p>
          <p v-else-if="q.trim().length < 2" class="px-3 py-6 text-center text-sm text-muted-foreground">
            Type at least 2 characters to search.
          </p>
          <NuxtLink
            v-for="e in results"
            :key="e.id"
            :to="`/events/${e.slug}`"
            class="block rounded-lg px-3 py-2.5 transition-colors hover:bg-muted"
            @click="hide"
          >
            <p class="font-display text-sm font-semibold leading-tight">{{ e.title }}</p>
            <p class="mt-0.5 truncate text-xs text-muted-foreground">
              {{ formatDateTime(e.startsAt, e.timezone) }}<span v-if="e.venueName"> · {{ e.venueName }}</span>
            </p>
          </NuxtLink>
        </div>
      </div>
    </div>
  </Teleport>
</template>
