/**
 * Foto real do artista via API pública da Deezer (sem chave).
 * É a fonte usada para preencher a foto dos artistas do acervo (o seed do
 * iTunes não traz foto de artista, só a capa do álbum).
 */

interface DeezerArtist {
  name?: string;
  picture_xl?: string;
  picture_big?: string;
}

interface DeezerSearch {
  data?: DeezerArtist[];
}

export class DeezerService {
  /** Maior foto disponível do artista, ou null se não houver. */
  async getArtistImage(name: string): Promise<string | null> {
    if (!name.trim()) return null;

    const url = `https://api.deezer.com/search/artist?q=${encodeURIComponent(name.trim())}&limit=1`;
    try {
      const res = await fetch(url);
      if (!res.ok) return null;
      const data = (await res.json()) as DeezerSearch;
      const artist = data.data?.[0];
      const picture = artist?.picture_xl || artist?.picture_big || "";
      // Quando a Deezer não tem foto, o md5 vem vazio (".../artist//1000x1000...").
      if (!picture || picture.includes("/artist//")) return null;
      return picture;
    } catch {
      return null;
    }
  }
}
