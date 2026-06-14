import { Routes, Route } from "react-router-dom";
import { Layout } from "./components/Layout";
import { DiscoverPage } from "./features/DiscoverPage";
import { PlaylistsPage } from "./features/PlaylistsPage";
import { PlaylistDetailPage } from "./features/PlaylistDetailPage";
import { UploadPage } from "./features/UploadPage";
import { ProfilePage } from "./features/ProfilePage";
import { ModerationPage } from "./features/ModerationPage";

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<DiscoverPage />} />
        <Route path="playlists" element={<PlaylistsPage />} />
        <Route path="playlists/:id" element={<PlaylistDetailPage />} />
        <Route path="enviar" element={<UploadPage />} />
        <Route path="perfil" element={<ProfilePage />} />
        <Route path="moderacao" element={<ModerationPage />} />
      </Route>
    </Routes>
  );
}
