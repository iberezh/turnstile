<script setup lang="ts">
import type { EventDto } from '~/types/event';

const { public: config } = useRuntimeConfig();
const { data: events } = await useFetch<EventDto[]>(`${config.apiBase}/events`);

useSeoMeta({
  title: 'Discover events',
  description: 'Browse upcoming events and grab your tickets on Turnstile.',
  ogTitle: 'Turnstile — discover events',
  ogDescription: 'Browse upcoming events and grab your tickets.',
});
</script>

<template>
  <section>
    <h1>Upcoming events</h1>
    <p v-if="!events || events.length === 0" class="muted">No published events yet.</p>
    <div v-else class="grid">
      <NuxtLink v-for="e in events" :key="e.id" :to="`/events/${e.slug}`" class="card">
        <img v-if="e.coverImageUrl" :src="e.coverImageUrl" :alt="e.title" />
        <div class="card-body">
          <h2>{{ e.title }}</h2>
          <p class="muted">{{ formatDateTime(e.startsAt, e.timezone) }}</p>
          <p v-if="e.venueName" class="muted">{{ e.venueName }}</p>
        </div>
      </NuxtLink>
    </div>
  </section>
</template>
