<script setup lang="ts">
import { Github, Mail } from 'lucide-vue-next';

const name = ref('');
const email = ref('');
const message = ref('');
const sent = ref(false);
const error = ref('');

function submit() {
  error.value = '';
  const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value);
  if (!name.value.trim() || !validEmail || message.value.trim().length < 10) {
    error.value = 'Add your name, a valid email, and a message (10+ characters).';
    return;
  }
  // No backend yet — this is the small first step. A later phase posts to a support inbox.
  sent.value = true;
}

useSeoMeta({
  title: 'Contact us',
  description: 'Questions about selling or buying on Turnstile? Get in touch.',
});
</script>

<template>
  <section class="container max-w-3xl pb-20 pt-28">
    <p class="font-display text-xs font-semibold uppercase tracking-[0.22em] text-primary">
      Contact us
    </p>
    <h1 class="mt-4 font-display text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
      Let's talk.
    </h1>
    <p class="mt-4 text-lg text-muted-foreground">
      Running an event, weighing a switch, or just stuck on something? Send a note and a real person
      gets back to you.
    </p>

    <div class="mt-10 grid gap-10 md:grid-cols-[1.4fr_1fr]">
      <Card>
        <CardContent class="p-5 sm:p-6">
          <div v-if="sent" class="space-y-2 py-6 text-center">
            <p class="font-display text-xl font-semibold">Thanks, {{ name.split(' ')[0] }} 👋</p>
            <p class="text-sm text-muted-foreground">Your message is on its way. We'll reply to {{ email }}.</p>
          </div>
          <form v-else class="space-y-4" @submit.prevent="submit">
            <div class="space-y-1.5">
              <Label for="c-name">Name</Label>
              <Input id="c-name" v-model="name" autocomplete="name" />
            </div>
            <div class="space-y-1.5">
              <Label for="c-email">Email</Label>
              <Input id="c-email" v-model="email" type="email" autocomplete="email" />
            </div>
            <div class="space-y-1.5">
              <Label for="c-message">Message</Label>
              <Textarea id="c-message" v-model="message" rows="5" />
            </div>
            <p v-if="error" class="text-sm text-destructive" data-testid="contact-error">{{ error }}</p>
            <Button type="submit" data-testid="contact-submit">Send message</Button>
          </form>
        </CardContent>
      </Card>

      <div class="space-y-5">
        <div>
          <h2 class="font-display text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Other ways
          </h2>
          <ul class="mt-4 space-y-3 text-sm">
            <li>
              <a href="mailto:hello@turnstile.events" class="inline-flex items-center gap-2 text-foreground transition-colors hover:text-primary">
                <Mail class="h-4 w-4" /> hello@turnstile.events
              </a>
            </li>
            <li>
              <a href="https://github.com/iberezh/turnstile" target="_blank" rel="noreferrer" class="inline-flex items-center gap-2 text-foreground transition-colors hover:text-primary">
                <Github class="h-4 w-4" /> github.com/iberezh/turnstile
              </a>
            </li>
          </ul>
        </div>
        <p class="text-sm text-muted-foreground">
          Organizer already? Manage events from your
          <NuxtLink to="/dashboard" class="text-primary underline-offset-4 hover:underline">dashboard</NuxtLink>.
        </p>
      </div>
    </div>
  </section>
</template>
