/** Random ids for anonymous users, sessions, events and requests. Not used for security. */
export function newId(prefix: string): string {
  const random = Math.random().toString(36).slice(2, 10);
  return `${prefix}-${Date.now().toString(36)}-${random}`;
}
