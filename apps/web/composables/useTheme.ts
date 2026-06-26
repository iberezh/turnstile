// Light/dark theme, persisted to localStorage and reflected as a `dark` class on <html>.
// The initial class is set pre-paint by an inline script in nuxt.config (no flash); this keeps
// reactive state in sync and handles toggling.
export function useTheme() {
  const isDark = useState<boolean>('ts-dark', () => false);

  function set(dark: boolean): void {
    isDark.value = dark;
    if (import.meta.client) {
      document.documentElement.classList.toggle('dark', dark);
      localStorage.setItem('ts-theme', dark ? 'dark' : 'light');
    }
  }
  function sync(): void {
    if (import.meta.client) isDark.value = document.documentElement.classList.contains('dark');
  }
  function toggle(): void {
    set(!isDark.value);
  }

  return { isDark, set, sync, toggle };
}
