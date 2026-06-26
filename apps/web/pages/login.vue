<script setup lang="ts">
const { login } = useAuth();
const email = ref('');
const password = ref('');
const error = ref('');
const pending = ref(false);

async function submit() {
  error.value = '';
  pending.value = true;
  try {
    await login(email.value, password.value);
    const redirect = useRoute().query.redirect;
    await navigateTo(typeof redirect === 'string' ? redirect : '/dashboard');
  } catch {
    error.value = 'Invalid email or password.';
  } finally {
    pending.value = false;
  }
}

useSeoMeta({ title: 'Sign in' });
</script>

<template>
  <div class="mx-auto max-w-sm px-4 pb-16 pt-28">
    <Card>
      <CardHeader>
        <CardTitle>Sign in</CardTitle>
        <CardDescription>Your tickets and your events, all in one place.</CardDescription>
      </CardHeader>
      <CardContent>
        <form class="space-y-4" @submit.prevent="submit">
          <div class="space-y-1.5">
            <Label for="email">Email</Label>
            <Input id="email" v-model="email" type="email" autocomplete="email" required />
          </div>
          <div class="space-y-1.5">
            <Label for="password">Password</Label>
            <Input id="password" v-model="password" type="password" autocomplete="current-password" required />
          </div>
          <p v-if="error" class="text-sm text-destructive" data-testid="error">{{ error }}</p>
          <Button type="submit" class="w-full" :disabled="pending">
            {{ pending ? 'Signing in…' : 'Sign in' }}
          </Button>
        </form>
        <p class="mt-4 text-sm text-muted-foreground">
          No account?
          <NuxtLink to="/register" class="text-primary underline-offset-4 hover:underline">
            Create one
          </NuxtLink>
        </p>
      </CardContent>
    </Card>
  </div>
</template>
