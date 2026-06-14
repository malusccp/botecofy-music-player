/** Enumerações de domínio compartilhadas (integridade conceitual). */

export const RHYTHMS = ["brega", "pagode", "sertanejo", "arrocha"] as const;
export type Rhythm = (typeof RHYTHMS)[number];

export const ROLES = ["listener", "curator", "admin"] as const;
export type Role = (typeof ROLES)[number];

export const TRACK_STATUS = ["active", "inactive"] as const;
export type TrackStatus = (typeof TRACK_STATUS)[number];

export function isRhythm(value: unknown): value is Rhythm {
  return typeof value === "string" && (RHYTHMS as readonly string[]).includes(value);
}
