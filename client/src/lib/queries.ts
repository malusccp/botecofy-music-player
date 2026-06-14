import { api } from "./api";
import type { Me, Paginated, Playlist, Rhythm, Track } from "../types";

export interface TrackFilters {
  rhythms: Rhythm[];
  text: string;
  sort: string;
}

export async function fetchTracks(filters: TrackFilters, page = 1): Promise<Paginated<Track>> {
  const { data } = await api.get<Paginated<Track>>("/tracks", {
    params: {
      rhythms: filters.rhythms.join(","),
      text: filters.text || undefined,
      sort: filters.sort,
      page,
      limit: 24,
    },
  });
  return data;
}

export async function fetchMe(): Promise<Me> {
  const { data } = await api.get<Me>("/me");
  return data;
}

export async function fetchHistory(): Promise<{ items: Track[] }> {
  const { data } = await api.get<{ items: Track[] }>("/me/history");
  return data;
}

export async function fetchPlaylists(): Promise<Playlist[]> {
  const { data } = await api.get<Playlist[]>("/playlists");
  return data;
}

export async function fetchFollowedPlaylists(): Promise<Playlist[]> {
  const { data } = await api.get<Playlist[]>("/playlists/followed/mine");
  return data;
}

export async function fetchPlaylist(id: string): Promise<Playlist> {
  const { data } = await api.get<Playlist>(`/playlists/${id}`);
  return data;
}

export async function toggleLike(trackId: string): Promise<{ liked: boolean; likesCount: number }> {
  const { data } = await api.post(`/tracks/${trackId}/like`);
  return data;
}

export async function registerPlay(trackId: string, listenedSeconds: number) {
  const { data } = await api.post(`/tracks/${trackId}/play`, { listenedSeconds });
  return data;
}

export async function createPlaylist(input: {
  name: string;
  description?: string;
  rhythms: Rhythm[];
  isPublic: boolean;
}): Promise<Playlist> {
  const { data } = await api.post<Playlist>("/playlists", input);
  return data;
}

export async function addTrackToPlaylist(playlistId: string, trackId: string) {
  const { data } = await api.post(`/playlists/${playlistId}/tracks`, { trackId });
  return data;
}

export async function toggleFollow(playlistId: string): Promise<{ following: boolean }> {
  const { data } = await api.post(`/playlists/${playlistId}/follow`);
  return data;
}

export async function uploadTrack(form: FormData): Promise<Track> {
  const { data } = await api.post<Track>("/tracks", form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
}

export async function fetchModerationTracks(): Promise<{ items: Track[] }> {
  const { data } = await api.get<{ items: Track[] }>("/moderation/tracks");
  return data;
}

export async function moderateTrack(
  trackId: string,
  action: "deactivate" | "reactivate",
  reason: string
) {
  const { data } = await api.post(`/moderation/tracks/${trackId}/${action}`, { reason });
  return data;
}
