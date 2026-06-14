# Botecofy — Guia de Apresentação por Integrante

> Guia de **estudo e preparação** para a apresentação final de Engenharia de Software II.
> Objetivo: cada integrante conseguir **explicar e defender** a parte que está no seu nome no histórico do Git — porque o edital penaliza "uso de IA sem entendimento pleno do que foi feito" e "participação desigual não justificada".
>
> **Como usar:** leia a seção da sua parte, abra os arquivos citados, e treine respondendo as "perguntas prováveis". Não decore frases — entenda o porquê de cada decisão.

---

## Abertura (30s — quem começar)

> "O **Botecofy** é uma plataforma de streaming com curadoria focada em ritmos de bar — brega, pagode, sertanejo e arrocha. O problema: plataformas genéricas tratam esses ritmos como secundários e não têm curadoria humana. Nosso sistema organiza o acervo **por ritmo**, com playlists curadas por pessoas, player próprio e interação (curtidas/plays) **em tempo real**. É um monorepo TypeScript: React no front, Express + Mongoose no back, arquitetura **em camadas**."

**Stack:** TypeScript · React/Vite/Zustand/React Query (front) · Express/Mongoose/Socket.io/Clerk (back) · MongoDB.

---

## Mapa rápido — quem fala o quê

| Integrante | Papel | Bloco que domina | Padrões/conceitos que "são dele" |
|---|---|---|---|
| **Maria Luiza** | PO + Dev | Visão, backlog, histórias, critérios, RN, relatório; base de dados/infra (com Álvaro) | MoSCoW, Story Points, DoR/DoD, Repository/interfaces, DTO |
| **Álvaro** | SM + Dev | Cerimônias Scrum, planning poker, board; base do servidor e do cliente (com Maria) | Sprints, arquitetura em camadas, injeção de dependência (container/DIP) |
| **Isaac** | Dev | Acervo, descoberta, perfil (HU01, HU02, HU08) | **Factory Method**, **Strategy**, RN02/RN06/RN08, upload Multer |
| **Mourão** | Dev | Curadoria, tempo real, moderação (HU03–HU07) | **State** (player), **Observer** (tempo real), RN05/RN07/RN09 |

> **Todos** precisam saber o "tronco comum": tema, arquitetura em camadas, os 7 padrões e onde os 5 SOLID aparecem (seções no fim deste guia).

---

## 1. Maria Luiza — Product Owner + Desenvolvimento

**O que está no seu nome (commits):**
- `docs: adicionar visao do produto, backlog priorizado e divisao da equipe`
- `docs: substituir README inicial pela documentacao completa do projeto`
- `chore: estrutura inicial do monorepo (configs e dependencias)` *(com Álvaro)*
- `feat: contratos de dados base (interfaces, enums, dtos, storage)` *(com Álvaro)*
- `chore: seed de dados para demonstracao` *(com Álvaro)*
- `docs: adicionar relatorio final e evidencias de teste`

**O que explicar (papel de PO):**
- **Visão do produto** (`docs/po/PRODUCT_BACKLOG.md` §1): saber recitar o template "Para… que… o Botecofy… diferente de…".
- **Priorização** (§2): por que HU01/HU02 (criar e expor o acervo) vêm antes de HU03/HU04 (consumo) e depois HU05–HU08 (engajamento/governança). Regra: "sem conteúdo, nada mais tem valor".
- **MoSCoW + Story Points**: Must/Should/Could; SP estimados em Planning Poker (Fibonacci).
- **DoR e DoD** (§4/§5): quando uma história *entra* na sprint e quando está *pronta*.
- **Critérios de aceitação**: pegar 1–2 histórias e ler os critérios (estão no `PLANEJAMENTO_TECNICO.md` §6).

**O que explicar (parte de código que é sua):**
- `server/src/repositories/interfaces.ts` — os **contratos** dos repositórios (`ITrackRepository`, etc.). Conecta ao **SOLID/DIP e ISP**: serviços dependem dessas interfaces, não do Mongoose.
- `server/src/models/enums.ts` — o enum `Rhythm` (brega, pagode, sertanejo, arrocha) usado em todas as camadas (**integridade conceitual**, RN01).
- `server/src/dtos/mappers.ts` — **DTO**: por que não devolver o documento Mongoose cru na API (esconde `__v`, refs internas).
- `server/src/seed/seed.ts` — dados de exemplo para a demonstração.

**Perguntas prováveis:**
- *"Por que essa ordem de prioridade?"* → racional acima.
- *"O que é DoD aqui?"* → código na main via branch + critério validado + RN na camada de serviço + `npm test` verde + backlog atualizado.
- *"Por que DTO?"* → não vazar campos internos e desacoplar o contrato da API do schema do banco.

---

## 2. Álvaro — Scrum Master + Desenvolvimento

**O que está no seu nome (commits):**
- `docs: adicionar artefatos scrum (planning poker, sprint reviews, retrospectivas e atas)`
- `feat: base do servidor express (config, db, middlewares, erros)` *(com Maria)*
- `feat: base do cliente react (vite, layout, sessao, api)` *(com Maria)*

**O que explicar (papel de SM):**
- **3 sprints** (`docs/SCRUM.md`): Sprint 1 = análise + base arquitetural; Sprint 2 = HU01–HU04 (funcionalidades centrais + SOLID/padrões); Sprint 3 = HU05–HU08 + qualidade/testes/relatório.
- **Planning Poker**: escala Fibonacci, voto por consenso; saber explicar por que HU03 (player) ficou em 8 (máquina de estados, seek, fila, contagem de play).
- **Reviews e Retrospectives** de cada sprint (o que foi bem / o que melhorar).
- **Quadro de acompanhamento**: o board (ver `scripts/setup-board.ps1`) — colunas Backlog → A fazer → Em progresso → Revisão → Concluído.

**O que explicar (parte de código que é sua):**
- `server/src/app.ts` / `index.ts` — como a aplicação Express é montada; middlewares de erro, CORS, rotas.
- `server/src/config/container.ts` — **Composition Root**: o único lugar que instancia implementações concretas e injeta nos serviços. Este arquivo é a sua "prova viva" de **SOLID/DIP**. Saber explicar: "os serviços recebem repositórios e o `StorageService`/`RealtimeNotifier` por construtor; eles só conhecem interfaces."
- `server/src/middlewares/` — `auth.ts` (modo DEV vs Clerk), `validate.ts` (validação com Zod), `errorHandler.ts`, `requireRole.ts` (RN03).
- `client/src/` base — Vite, `Layout`, `SessionContext`, `lib/api.ts` (axios), `lib/queries.ts` (React Query).

**Perguntas prováveis:**
- *"Onde está a injeção de dependência?"* → abrir `container.ts` e mostrar os `new` + construtores.
- *"Como vocês autenticam?"* → Clerk; e há um **modo DEV** (headers `x-dev-user-id`/`x-dev-role`) para demonstrar sem chaves externas, mantendo a mesma interface `req.actor`.
- *"Por que arquitetura em camadas?"* → tamanho do projeto, separação clara apresentação/domínio/persistência, testabilidade.

---

## 3. Isaac — Acervo, Descoberta e Perfil (HU01, HU02, HU08)

**Commits (na ordem):**
1. `feat: cadastrar faixa com upload e validacao (HU01)`
2. `feat: buscar e filtrar acervo por ritmo (HU02)`
3. `feat: perfil sincronizado e historico (HU08)`
4. `test: adicionar testes de TrackService e rotas de faixa`
5. `merge: integrar acervo, descoberta e perfil`

### HU01 — Cadastrar faixa (commit 1)
**Arquivos:** `models/Track.ts`, `repositories/TrackRepository.ts`, `services/TrackService.ts`, `services/TrackFactory.ts`, `controllers/TrackController.ts`, `routes/track.routes.ts`, `middlewares/upload.ts`, `client/.../UploadPage.tsx`.
**Explique:**
- **Factory Method** (`TrackFactory.ts`): há duas fontes de faixa — upload de arquivo (`UploadedTrackFactory`) ou URL externa (`ExternalTrackFactory`). A classe-base `TrackFactory.build()` centraliza os defaults (status `active`, contadores zerados); só o método `resolveAudioUrl()` varia. *"Usei Factory Method para criar a faixa a partir de fontes diferentes sem encher o `TrackService` de `if`."*
- **Upload (Multer)** + **RN08**: áudio `mp3`/`aac`, máx. 15 MB (validado em `upload.ts`).
- **RN03**: só Curador/Admin cadastram (`requireRole`). **RN04**: faixa nasce ativa. **RN02**: índice único parcial `(artist,title)` para faixas ativas evita duplicado.

### HU02 — Buscar e filtrar (commit 2)
**Arquivos:** `services/strategies/SortStrategy.ts`, `client/.../DiscoverPage.tsx`, `components/TrackCard.tsx`.
**Explique:**
- **Strategy + OCP** (`SortStrategy.ts`): cada ordenação (recentes, mais tocadas, mais curtidas) é uma estratégia com `toMongoSort()`. *"Adicionar uma nova ordenação = nova classe na lista `STRATEGIES`, sem tocar no `TrackService` nem no repositório."* — esse é seu exemplo de **OCP**.
- **RN04**: a busca só retorna faixas `active` (faixa inativa some) — validado no teste de integração.

### HU08 — Perfil + histórico (commit 3)
**Arquivos:** `models/User.ts`, `PlayHistory.ts`, repos de User/PlayHistory, `services/UserService.ts`, `services/PlaybackService.ts`, `controllers/UserController.ts`, `routes/user.routes.ts`, `client/.../ProfilePage.tsx`.
**Explique:**
- **RN10 — Provisionamento**: o usuário é criado no **primeiro acesso autenticado**, a partir do `clerkId`. Não há "cadastro" separado.
- **RN06 — contagem honesta de play** (`PlaybackService.ts`): um play só conta após **≥ 20s** (`MIN_PLAY_SECONDS`); reprodução curta entra no histórico mas não infla a métrica. Mostre o `if (listenedSeconds < MIN_PLAY_SECONDS)`.

### Testes (commit 4)
`TrackService.test.ts` (RN01/RN02 + criação), `PlaybackService.test.ts` (RN06), `tests/track.routes.test.ts` (integração: 403 ouvinte, 401 sem auth, filtro só ativas).

**Perguntas prováveis:**
- *"Mostre o OCP no código."* → `SortStrategy.ts`.
- *"Como o play não é fraudado?"* → RN06, ≥20s, `PlaybackService`.
- *"Por que Factory para faixa?"* → duas fontes de áudio, defaults centralizados.

---

## 4. Mourão — Curadoria, Tempo Real e Moderação (HU03–HU07)

**Commits (na ordem):**
1. `feat: player com fila e maquina de estados (HU03)`
2. `feat: playlists tematicas por ritmo (HU04)`
3. `feat: curtir com atualizacao em tempo real (HU05)`
4. `feat: seguir playlist e moderacao do acervo (HU06, HU07)`
5. `test: adicionar testes de LikeService`
6. `merge: integrar curadoria, tempo real e moderacao`

### HU03 — Player + fila (commit 1)
**Arquivos:** `client/src/store/playerStore.ts`, `components/PlayerBar.tsx`.
**Explique:**
- **State (máquina de estados)** (`playerStore.ts`): estados `idle → loading → playing ⇄ paused → ended`. As ações (`togglePlay`, `next`, `prev`, `enqueue`) fazem as transições; o `PlayerBar` reage ao estado e controla o elemento `<audio>`. *"O player é uma máquina de estados — por isso não dá pra 'pausar' o que está `idle`."* Mostre as transições em `next()`/`togglePlay()`.

### HU04 — Playlists temáticas (commit 2)
**Arquivos:** `models/Playlist.ts`, `repositories/PlaylistRepository.ts`, `services/PlaylistService.ts`, `controllers/PlaylistController.ts`, `routes/playlist.routes.ts`, `client/.../PlaylistsPage.tsx`, `PlaylistDetailPage.tsx`.
**Explique:**
- **RN05**: nome **único por curador** + ao menos um ritmo (índice `(owner,name)`).
- **RN09**: playlist privada só aparece para o dono; pública para todos.
- **RN03**: só o dono/Admin edita.

### HU05 — Curtir em tempo real (commit 3)
**Arquivos:** `models/Like.ts`, `repositories/LikeRepository.ts`, `services/LikeService.ts`, `services/events/RealtimeNotifier.ts`, `sockets/index.ts`, `client/src/lib/socket.ts`.
**Explique (seu carro-chefe):**
- **RN07 — toggle idempotente** (`LikeService.toggle`): curtir/descurtir; índice único `(user,track)` garante "no máximo 1 curtida" mesmo em corrida.
- **Observer** (`RealtimeNotifier.ts` + `sockets/index.ts`): o serviço **emite** um evento de domínio (`track:liked`) **sem conhecer Socket.io**. A camada de sockets **assina** (`subscribe`) e retransmite para os clientes. *"Isso desacopla a regra de negócio do transporte em tempo real — DIP + baixo acoplamento."* Mostre `this.notifier.emit(...)` no serviço e o `notifier.subscribe(...)` nos sockets.
- Contadores **desnormalizados** com `$inc` atômico (sem transação) → consistência eventual; cite isso como decisão consciente (está nas limitações).

### HU06 + HU07 — Seguir + Moderar (commit 4)
**Arquivos:** `models/PlaylistFollow.ts`, `ModerationLog.ts`, repos, `services/ModerationService.ts`, `controllers/ModerationController.ts`, `routes/moderation.routes.ts`, `client/.../ModerationPage.tsx`.
**Explique:**
- **HU06**: seguir/deixar de seguir; privada não aparece (RN09).
- **HU07/RN04**: só Admin inativa/reativa **com justificativa**; gera **log** (`ModerationLog`); faixa inativa some das buscas (efeito que o teste de integração comprova).

### Testes (commit 5)
`LikeService.test.ts` — RN07 (toggle) + emissão do evento Observer.

**Perguntas prováveis:**
- *"Como funciona o tempo real sem acoplar o domínio?"* → Observer: `RealtimeNotifier` (emit) ↔ `sockets` (subscribe). Domínio não importa Socket.io.
- *"E se dois likes chegarem juntos?"* → índice único `(user,track)` (RN07) + `$inc` atômico.
- *"Por que o player é uma máquina de estados?"* → estados/transições explícitas evitam estados inválidos (tocar sem fila, pausar parado).

---

## Parte compartilhada — Base/Infra (Maria Luiza + Álvaro, "fizeram juntos")

Commits `chore/feat` de base: monorepo, configs, base do servidor, base do cliente, contratos de dados, seed. Cada um tem um autor principal e o outro como `Co-Authored-By` (registro honesto de trabalho em par). Quem apresentar a arquitetura geral usa o `container.ts` como peça central.

---

## Tronco comum — todos devem saber

### Arquitetura (em camadas)
```
Apresentação   routes / controllers / sockets / middlewares
      ↓
Aplicação/Domínio   services  (← aqui ficam as regras RN01–RN10)
      ↓
Persistência   repositories (interfaces) / models (Mongoose)
```
Regra de ouro: **regra de negócio mora nos `services`, fora da camada de interface** (requisito técnico 12 do edital). Controllers não conhecem Mongoose; services não conhecem `req`/`res`.

### SOLID — onde está cada um
| Princípio | Onde mostrar |
|---|---|
| **SRP** | `*Service` (negócio) vs `*Controller` (HTTP) vs `*Repository` (dados) |
| **OCP** | `services/strategies/SortStrategy.ts` (nova ordenação sem alterar serviço) |
| **LSP** | implementações de repositório substituíveis por mocks nos testes |
| **ISP** | interfaces pequenas em `repositories/interfaces.ts` (`ITrackRepository`…) |
| **DIP** | `config/container.ts` injeta concretos; serviços dependem de abstrações |

### Padrões de projeto — onde está cada um
| Padrão | Arquivo | Por quê |
|---|---|---|
| Repository | `repositories/*Repository.ts` | isola Mongoose; testar sem banco |
| Service Layer | `services/*Service.ts` | regras fora de controller/UI |
| DTO | `dtos/mappers.ts` | não vazar campos internos na API |
| Strategy | `services/strategies/SortStrategy.ts` | trocar ordenação (OCP) |
| Factory Method | `services/TrackFactory.ts` | criar faixa de upload ou URL |
| Observer | `services/events/RealtimeNotifier.ts` + `sockets/index.ts` | tempo real desacoplado |
| State | `client/src/store/playerStore.ts` | máquina de estados do player |

### Perguntas difíceis (qualquer um pode levar)
- *"Vocês usaram IA?"* → Responder com honestidade e **demonstrando domínio**: explicar uma decisão de arquitetura e abrir o código na hora. O que conta é entender, não esconder.
- *"Cadê a regra de negócio?"* → sempre nos `services`; abrir um e apontar a RN.
- *"Como testaram sem banco real?"* → repositórios mockados (unitário) + MongoDB em memória (integração, Supertest).
- *"Qual a maior limitação?"* → contadores desnormalizados/eventualmente consistentes e áudio em disco local (abstraído por `StorageService` para troca futura).

### Roteiro de demonstração
Seguir o passo a passo do `README.md` §"Roteiro de demonstração" (HU01→HU07, incluindo abrir duas abas para ver o contador subir ao vivo na HU05).
</content>
</invoke>
