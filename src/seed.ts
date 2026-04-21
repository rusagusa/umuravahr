/**
 * DEPRECATED: Seeding is now handled via the POST /api/seed endpoint.
 * This file is kept as a stub to avoid any import errors during build.
 */
export default function seedDatabase() {
  console.warn('seed.ts is deprecated. Use POST /api/seed endpoint instead.');
  return Promise.resolve();
}
