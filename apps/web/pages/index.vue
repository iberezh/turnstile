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
    <h1 class="text-2xl font-bold tracking-tight">Upcoming events</h1>
    <p v-if="!events || events.length === 0" class="mt-2 text-muted-foreground">
      No published events yet.
    </p>
    <div
      v-else
      class="mt-6 grid gap-5 [grid-template-columns:repeat(auto-fill,minmax(240px,1fr))]"
    >
      <NuxtLink v-for="e in events" :key="e.id" :to="`/events/${e.slug}`" class="group">
        <Card class="h-full overflow-hidden transition-colors group-hover:border-primary">
          <img
            v-if="e.coverImageUrl"
            :src="e.coverImageUrl"
            :alt="e.title"
            class="h-36 w-full object-cover"
          />
          <CardHeader>
            <CardTitle class="text-base">{{ e.title }}</CardTitle>
            <CardDescription>{{ formatDateTime(e.startsAt, e.timezone) }}</CardDescription>
            <CardDescription v-if="e.venueName">{{ e.venueName }}</CardDescription>
          </CardHeader>
        </Card>
      </NuxtLink>
    </div>
  </section>
</template>
