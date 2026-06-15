# Botecofy 🍺

Plataforma de streaming musical com **curadoria focada em ritmos de bar** — brega, pagode, sertanejo e arrocha. Acervo organizado por ritmo, playlists temáticas curadas por pessoas, player próprio e interação (curtidas/plays) em tempo real.

Trabalho prático de **Engenharia de Software II**. O planejamento completo (visão, backlog, histórias, arquitetura, SOLID, padrões, 3 sprints) está em [`docs/PLANEJAMENTO_TECNICO.md`](docs/PLANEJAMENTO_TECNICO.md).

---

## 🧱 Arquitetura

Monorepo com arquitetura **em camadas** no back-end e front-end desacoplado.

```
botecofy/
├── client/   # React + Vite + TypeScript + Tailwind + Zustand + React Query
├── server/   # Node + Express + Mongoose + Clerk + Socket.io (camadas)
└── docs/     # planejamento, relatórios de sprint, evidências
```

Camadas do servidor: **apresentação** (`routes`/`controllers`/`sockets`) → **aplicação/domínio** (`services`) → **persistência** (`repositories`/`models`).
Padrões aplicados: **Repository, Service Layer, DTO, Strategy, Factory Method, Observer, State**. SOLID nos 5 princípios. Detalhes em [`docs/RELATORIO_FINAL.md`](docs/RELATORIO_FINAL.md).

---

## ✅ Pré-requisitos

| Ferramenta | Versão usada |
|---|---|
| Node.js | 20+ (testado em 24) |
| npm | 10+ |
| MongoDB | 6+ rodando localmente (`mongodb://127.0.0.1:27017`) — ou MongoDB Atlas |

> Não há MongoDB instalado? Use o [MongoDB Community](https://www.mongodb.com/try/download/community) ou o Docker:
> `docker run -d -p 27017:27017 --name botecofy-mongo mongo:7`

---

## 🚀 Instalação e execução

```bash
# 1. Instalar dependências (raiz instala client e server via workspaces)
npm install

# 2. Configurar variáveis de ambiente
cp server/.env.example server/.env
cp client/.env.example client/.env

# 3. Preencher as chaves do Clerk (obrigatório — ver abaixo)
#    server/.env  -> CLERK_PUBLISHABLE_KEY, CLERK_SECRET_KEY, ADMIN_EMAILS
#    client/.env  -> VITE_CLERK_PUBLISHABLE_KEY

# 4. Popular o banco com faixas reais (iTunes Search API)
npm run seed

# 5. Subir API + front-end juntos
npm run dev
```

- Front-end: http://localhost:5173
- API: http://localhost:4000/api/health

### 🖼️ Logo

Salve a imagem oficial da logo em **`client/public/logo.png`** (veja `client/public/LEIA-ME-LOGO.txt`). Enquanto o arquivo não existir, o cabeçalho mostra o wordmark "Botecofy 🍺" como fallback.

### 🔐 Autenticação (Clerk — login real obrigatório)

O app usa **Clerk** para autenticação real; **não há mais "modo dev"**. É obrigatório configurar as chaves:

1. Crie um app gratuito em https://dashboard.clerk.com e copie as chaves para `server/.env` e `client/.env`.
2. Rode o app e **cadastre-se** pela tela de login (Clerk `<SignUp/>`/`<SignIn/>`).
3. Todo novo usuário entra como **Ouvinte**. Para virar **Curador/Admin**, há duas opções:
   - **Atalho (recomendado p/ demo):** coloque seu e-mail em `ADMIN_EMAILS` (ou `CURATOR_EMAILS`) no `server/.env`. No próximo login o papel é aplicado automaticamente.
   - **Via Clerk:** no dashboard, defina `publicMetadata.role = "admin"` (ou `curator`) no usuário.

O backend valida o **JWT do Clerk** em toda requisição, resolve o papel e **bloqueia Ouvintes** nas rotas de Upload e Moderação (403).

---

## 🧪 Testes

```bash
npm test          # testes do servidor (Vitest)
```

Cobre regras de negócio (RN01, RN02, RN06, RN07) em testes unitários com repositórios *mockados* e os critérios de aceitação de HU01/HU02 em teste de integração (MongoDB em memória + Supertest).

---

## 🔌 Endpoints principais

| Método | Rota | História | Acesso |
|---|---|---|---|
| GET | `/api/tracks` | HU02 buscar/filtrar | público |
| POST | `/api/tracks` | HU01 cadastrar (upload) | curador/admin |
| POST | `/api/tracks/:id/play` | HU03 registrar play | autenticado |
| POST | `/api/tracks/:id/like` | HU05 curtir (tempo real) | autenticado |
| GET/POST | `/api/playlists` | HU04 listar/criar | autenticado / curador |
| POST | `/api/playlists/:id/follow` | HU06 seguir | autenticado |
| GET | `/api/me`, `/api/me/history` | HU08 perfil/histórico | autenticado |
| GET/POST | `/api/moderation/tracks…` | HU07 moderar | admin |

WebSocket (Socket.io): eventos `track:liked` e `track:played` para atualização ao vivo dos contadores.

---

## 🎧 Sobre o áudio (iTunes Search API)

O `seed` consome a **iTunes Search API** e popula o acervo com **dados reais da Apple** por ritmo (pagode, sertanejo, arrocha, brega): `trackName`→título, `artistName`→artista, `previewUrl` (preview de ~30s)→`audioUrl`, e a capa em alta resolução (`artworkUrl100` → `600x600bb`)→`coverUrl`. Não há mais `sample.mp3`. O player toca os previews diretamente; uploads próprios (tela "Enviar faixa") são servidos com suporte a *seek* (HTTP Range).

---

## 🗺️ Roteiro de demonstração

1. **Cadastre-se** pela tela de login (Clerk). Coloque seu e-mail em `ADMIN_EMAILS` no `server/.env` para entrar como Admin/Curador.
2. **Descobrir** → filtre por ritmo / ordene / busque (HU02) → **Tocar** um preview real do iTunes (HU03).
3. Curta uma faixa e veja o contador subir ao vivo em outra aba (HU05, tempo real).
4. Como **Curador** → **Enviar faixa** cadastra no acervo (HU01); crie uma **Playlist** temática (HU04).
5. **Seguir** a playlist; veja em **Perfil** o histórico e as seguidas (HU06/HU08).
6. Como **Admin** → **Moderação** → inative uma faixa e confirme que some da busca (HU07/RN04).
7. Faça logout e tente acessar Upload/Moderação como Ouvinte comum → bloqueado (403).

---

## 📌 Limitações conhecidas

- Armazenamento de áudio em disco local (abstraído por `StorageService` para troca futura por nuvem).
- Contadores desnormalizados (eventualmente consistentes) — sem transações multi-documento.
- Sem recomendação algorítmica (a curadoria é humana, por design).

## 👥 Equipe — Os Botequeiros

| Integrante | Papel |
|---|---|
| Maria Luiza Nascimento Morais | Product Owner + Desenvolvimento |
| Alvaro Miguel | Scrum Master + Desenvolvimento |
| Isaac | Desenvolvimento |
| Mourão | Desenvolvimento |

Divisão detalhada em [`docs/PLANEJAMENTO_TECNICO.md`](docs/PLANEJAMENTO_TECNICO.md).
