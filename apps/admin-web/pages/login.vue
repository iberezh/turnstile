<script setup lang="ts">
const { login } = useAdminAuth();
const email = ref('');
const password = ref('');
const totp = ref('');
const error = ref('');
const pending = ref(false);

async function submit() {
  error.value = '';
  pending.value = true;
  try {
    await login(email.value, password.value, totp.value);
    await navigateTo('/');
  } catch {
    error.value = 'Invalid credentials or authentication code.';
  } finally {
    pending.value = false;
  }
}

useSeoMeta({ title: 'Sign in' });
</script>

<template>
  <div class="mx-auto flex min-h-screen max-w-sm items-center px-4">
    <Card class="w-full">
      <CardHeader>
        <CardTitle>Turnstile Admin</CardTitle>
        <CardDescription>Platform control plane — staff access only.</CardDescription>
      </CardHeader>
      <CardContent>
        <form class="space-y-4" @submit.prevent="submit">
          <div class="space-y-1.5">
            <Label for="email">Email</Label>
            <Input id="email" v-model="email" type="email" autocomplete="username" required />
          </div>
          <div class="space-y-1.5">
            <Label for="password">Password</Label>
            <Input id="password" v-model="password" type="password" autocomplete="current-password" required />
          </div>
          <div class="space-y-1.5">
            <Label for="totp">Authentication code</Label>
            <Input id="totp" v-model="totp" inputmode="numeric" placeholder="6-digit code" required />
          </div>
          <p v-if="error" class="text-sm text-destructive" data-testid="error">{{ error }}</p>
          <Button type="submit" class="w-full" :disabled="pending">
            {{ pending ? 'Signing in…' : 'Sign in' }}
          </Button>
        </form>
      </CardContent>
    </Card>
  </div>
</template>
