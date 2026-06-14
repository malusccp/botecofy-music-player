export type Rhythm = "brega" | "pagode" | "sertanejo" | "arrocha";
export type Role = "listener" | "curator" | "admin";

export interface Track {
  id: string;
  title: string;
  artist: string;
  rhythm: Rhythm;
  audioUrl: string;
  coverUrl: string;
  durationSec: number;
  status: "active" | "inactive";
  playsCount: number;
  likesCount: number;
  liked?: boolean;
}

export interface Playlist {
  id: string;
  name: string;
  description: string;
  rhythms: Rhythm[];
  isPublic: boolean;
  owner: string;
  trackCount: number;
  tracks?: Track[];
}

export interface Me {
  id: string;
  displayName: string;
  role: Role;
}

export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
}

export const RHYTHMS: Rhythm[] = ["brega", "pagode", "sertanejo", "arrocha"];
export const RHYTHM_LABEL: Record<Rhythm, string> = {
  brega: "Brega",
  pagode: "Pagode",
  sertanejo: "Sertanejo",
  arrocha: "Arrocha",
};
