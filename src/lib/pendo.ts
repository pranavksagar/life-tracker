/**
 * Safe wrapper around the Pendo agent's track API. No-ops gracefully if the
 * Pendo snippet has not been loaded on this page.
 */
export function pendoTrack(
  name: string,
  properties?: Record<string, unknown>,
): void {
  if (typeof pendo !== 'undefined') {
    pendo.track(name, properties)
  }
}
