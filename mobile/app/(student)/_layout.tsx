import { Stack } from 'expo-router';

/**
 * Student stack. Phase 1 keeps it simple — we'll swap to a Tabs
 * layout (Home / Learn / Live / Support / Profile) once those screens
 * exist. For now `index` is the only mounted route.
 */
export default function StudentLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
