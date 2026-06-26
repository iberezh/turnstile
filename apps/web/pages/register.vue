<script setup lang="ts">
const { register } = useAuth();
const name = ref('');
const email = ref('');
const password = ref('');
const error = ref('');
const pending = ref(false);

async function submit() {
  error.value = '';
  pending.value = true;
  try {
    await register(email.value, password.value, name.value);
    await navigateTo('/dashboard');
  } catch {
    error.value = 'Could not create the account (email may already be registered).';
  } finally {
    pending.value = false;
  }
}

useSeoMeta({ title: 'Create account' });
</script>

<template>
  <div class="mx-auto max-w-sm py-6">
    <Card>
      <CardHeader>
        <CardTitle>Create your account</CardTitle>
        <CardDescription>Start selling tickets on Turnstile.</CardDescription>
      </CardHeader>
      <CardContent>
        <form class="space-y-4" @submit.prevent="submit">
          <div class="space-y-1.5">
            <Label for="name">Name</Label>
            <Input id="name" v-model="name" type="text" autocomplete="name" />
          </div>
          <div class="space-y-1.5">
            <Label for="email">Email</Label>
            <Input id="email" v-model="email" type="email" autocomplete="email" required />
          </div>
          <div class="space-y-1.5">
            <Label for="password">Password</Label>
            <Input id="password" v-model="password" type="password" autocomplete="new-password" required />
          </div>
          <p v-if="error" class="text-sm text-destructive" data-testid="error">{{ error }}</p>
          <Button type="submit" class="w-full" :disabled="pending">
            {{ pending ? 'Creating…' : 'Create account' }}
          </Button>
        </form>
        <p class="mt-4 text-sm text-muted-foreground">
          Already have an account?
          <NuxtLink to="/login" class="text-primary underline-offset-4 hover:underline">Sign in</NuxtLink>
        </p>
      </CardContent>
    </Card>
  </div>
</template>
