import type { TrackDoc } from "../models/Track.js";
import type { PlaylistDoc } from "../models/Playlist.js";
import type { UserDoc } from "../models/User.js";
import type { ArtistDoc } from "../models/Artist.js";
import type { AlbumDoc } from "../models/Album.js";

/**
 * Padrão DTO. Converte documentos internos (Mongoose) em contratos de saída
 * da API, sem vazar campos internos (`__v`, refs cruas). Ocultamento de
 * informação na fronteira HTTP.
 */

export interface TrackDTO {
  id: string;
  title: string;
  artist: string;
  rhythm: string;
  audioUrl: string;
  coverUrl: string;
  durationSec: number;
  status: string;
  playsCount: number;
  likesCount: number;
  liked?: boolean;
}

export function toTrackDTO(track: TrackDoc, liked?: boolean): TrackDTO {
  return {
    id: String(track._id),
    title: track.title,
    artist: track.artist,
    rhythm: track.rhythm,
    audioUrl: track.audioUrl,
    coverUrl: track.coverUrl ?? "",
    durationSec: track.durationSec ?? 0,
    status: track.status ?? "active",
    playsCount: track.playsCount ?? 0,
    likesCount: track.likesCount ?? 0,
    ...(liked === undefined ? {} : { liked }),
  };
}

export interface PlaylistDTO {
  id: string;
  name: string;
  description: string;
  rhythms: string[];
  isPublic: boolean;
  owner: string;
  trackCount: number;
  tracks?: TrackDTO[];
}

export function toPlaylistDTO(playlist: PlaylistDoc, includeTracks = false): PlaylistDTO {
  const tracksRaw = (playlist.tracks ?? []) as unknown[];
  const populated =
    includeTracks && tracksRaw.length > 0 && typeof tracksRaw[0] === "object" && (tracksRaw[0] as any)?.title;

  return {
    id: String(playlist._id),
    name: playlist.name,
    description: playlist.description ?? "",
    rhythms: (playlist.rhythms ?? []) as string[],
    isPublic: playlist.isPublic ?? true,
    owner: String(playlist.owner),
    trackCount: tracksRaw.length,
    ...(populated ? { tracks: (tracksRaw as TrackDoc[]).map((t) => toTrackDTO(t)) } : {}),
  };
}

export interface UserDTO {
  id: string;
  displayName: string;
  role: string;
}

export function toUserDTO(user: UserDoc): UserDTO {
  return {
    id: String(user._id),
    displayName: user.displayName,
    role: user.role,
  };
}

export interface ArtistDTO {
  id: string;
  name: string;
  photoUrl: string;
  rhythms: string[];
}

export function toArtistDTO(artist: ArtistDoc): ArtistDTO {
  return {
    id: String(artist._id),
    name: artist.name,
    photoUrl: artist.photoUrl ?? "",
    rhythms: (artist.rhythms ?? []) as string[],
  };
}

export interface AlbumDTO {
  id: string;
  title: string;
  coverUrl: string;
  rhythm?: string;
  trackCount: number;
  artist: ArtistDTO | string;
}

export function toAlbumDTO(album: AlbumDoc): AlbumDTO {
  const artistRaw = album.artist as unknown;
  const artistPopulated =
    typeof artistRaw === "object" && artistRaw !== null && (artistRaw as any).name;

  return {
    id: String(album._id),
    title: album.title,
    coverUrl: album.coverUrl ?? "",
    rhythm: album.rhythm ?? undefined,
    trackCount: (album.tracks ?? []).length,
    artist: artistPopulated ? toArtistDTO(artistRaw as ArtistDoc) : String(album.artist),
  };
}
