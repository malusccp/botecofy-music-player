# Botecofy — Divisão de Responsabilidades da Equipe

> Mapa de quem faz o quê. Cada integrante executa e **commita a própria parte na sua própria conta**, para que a participação fique registrada de forma transparente. Equipe: **Os Botequeiros**.

---

## Resumo dos papéis

| Integrante | Papel Scrum | Responsabilidade principal |
|---|---|---|
| **Maria Luiza N. Morais** | Product Owner | Backlog, histórias, critérios, priorização, validação de valor |
| **Alvaro Miguel** | Scrum Master | Organização das sprints, atas, board, condução das cerimônias |
| **Isaac** | Time de Dev | Funcionalidades de acervo e descoberta (backend + front) |
| **Mourão** | Time de Dev | Funcionalidades de curadoria, tempo real e moderação |

> Todos participam de análise, projeto e testes. PO e SM também contribuem com código.

---

## 1. Maria Luiza — Product Owner ✅ (já feito)

**Entregáveis (commitar):**
- `docs/po/PRODUCT_BACKLOG.md` — visão, backlog priorizado, DoR/DoD, quadro Kanban.
- Seções §2–§3, §6, §8, §16 do `PLANEJAMENTO_TECNICO.md` (visão, histórias, critérios, priorização, plano das sprints).

**Sugestão de commits (na conta da Maria Luiza):**
```
docs: adicionar visao do produto e backlog priorizado
docs: detalhar historias de usuario e criterios de aceitacao
docs: definir DoR, DoD e quadro de acompanhamento
```

---

## 2. Alvaro — Scrum Master

**Entregáveis (commitar):**
- `docs/SCRUM.md` — Planning Poker, Sprint Backlog, Reviews, Retrospectives, atas.
- Montar o **quadro de acompanhamento** (Trello ou GitHub Projects) a partir do §6 do `PRODUCT_BACKLOG.md`.
- (Opcional) Burndown/checklist por sprint.

**Como montar o board no GitHub Projects (se for usar GitHub):**
```bash
# autenticar uma vez
gh auth login

# criar uma issue por historia (exemplo)
gh issue create --title "HU01 Cadastrar faixa" --label "Must,Sprint 2" --body "Ver criterios em docs/po/PRODUCT_BACKLOG.md"
# ... repetir para HU02..HU08
# depois criar o Project (board) e adicionar as issues pela UI ou:
gh project create --owner @me --title "Botecofy — Sprints"
```

**Sugestão de commits (na conta do Alvaro):**
```
docs: registrar planning poker das sprints 2 e 3
docs: adicionar sprint reviews e retrospectivas
docs: adicionar atas de reuniao e status do backlog
```

---

## 3. Isaac — Dev (acervo e descoberta)

**Escopo de código:** HU01, HU02, HU08 (perfil/histórico).

**Arquivos principais:**
- Backend: `server/src/models/Track.ts`, `server/src/repositories/TrackRepository.ts`, `server/src/services/TrackService.ts`, `server/src/services/TrackFactory.ts`, `server/src/controllers/TrackController.ts`, `server/src/routes/track.routes.ts`, `server/src/middlewares/upload.ts`, `server/src/services/strategies/SortStrategy.ts`.
- Backend (perfil): `server/src/services/UserService.ts`, `server/src/controllers/UserController.ts`, `server/src/routes/user.routes.ts`, `server/src/services/PlaybackService.ts`.
- Frontend: `client/src/features/DiscoverPage.tsx`, `client/src/features/UploadPage.tsx`, `client/src/features/ProfilePage.tsx`, `client/src/components/TrackCard.tsx`.
- Testes: `server/src/services/TrackService.test.ts`, `server/src/services/PlaybackService.test.ts`, `server/src/tests/track.routes.test.ts`.

**Sugestão de branch + commits (na conta do Isaac):**
```
git checkout -b feat/acervo-descoberta
# ...
feat: cadastrar faixa com upload e validacao (HU01)
feat: buscar e filtrar acervo por ritmo (HU02)
feat: perfil sincronizado e historico (HU08)
test: adicionar testes de TrackService e rotas de faixa
```

---

## 4. Mourão — Dev (curadoria, tempo real e moderação)

**Escopo de código:** HU03 (player), HU04 (playlists), HU05 (tempo real), HU06 (seguir), HU07 (moderação).

**Arquivos principais:**
- Backend: `server/src/models/Playlist.ts`, `server/src/models/Like.ts`, `server/src/models/PlaylistFollow.ts`, `server/src/models/ModerationLog.ts`, repositórios correspondentes, `server/src/services/PlaylistService.ts`, `server/src/services/LikeService.ts`, `server/src/services/ModerationService.ts`, `server/src/services/events/RealtimeNotifier.ts`, `server/src/sockets/index.ts`, controllers e rotas de playlist/moderação.
- Frontend: `client/src/store/playerStore.ts`, `client/src/components/PlayerBar.tsx`, `client/src/features/PlaylistsPage.tsx`, `client/src/features/PlaylistDetailPage.tsx`, `client/src/features/ModerationPage.tsx`, `client/src/lib/socket.ts`.
- Testes: `server/src/services/LikeService.test.ts`.

**Sugestão de branch + commits (na conta do Mourão):**
```
git checkout -b feat/curadoria-tempo-real
# ...
feat: player com fila e maquina de estados (HU03)
feat: playlists tematicas por ritmo (HU04)
feat: curtir com atualizacao em tempo real (HU05)
feat: seguir playlist e moderacao do acervo (HU06, HU07)
test: adicionar testes de LikeService
```

---

## Observação de autoria (transparência)

Se algum integrante estiver impossibilitado de commitar (ex.: sem acesso à máquina) e a divisão for feita por outra pessoa **com ciência do professor**, registre isso de forma aberta no `README` e no relatório, indicando quem executou e por quê. Histórico transparente protege a equipe; histórico forjado, não.
