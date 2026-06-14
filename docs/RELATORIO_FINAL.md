# Botecofy — Relatório Final Técnico

> Relatório final do Trabalho Prático de Engenharia de Software II. Segue a estrutura sugerida no edital (itens 25–45). Complementa o [`PLANEJAMENTO_TECNICO.md`](PLANEJAMENTO_TECNICO.md).

## 25. Identificação da equipe
**Equipe: Os Botequeiros**
- Maria Luiza Nascimento Morais — **Product Owner** + Desenvolvimento
- Alvaro Miguel — **Scrum Master** + Desenvolvimento
- Isaac — Desenvolvimento
- Mourão — Desenvolvimento

## 26. Tema do sistema
Plataforma de streaming musical com curadoria focada em ritmos de bar: brega, pagode, sertanejo e arrocha.

## 27. Problema que o sistema resolve
As plataformas genéricas tratam esses ritmos como secundários, sem curadoria humana especializada. O Botecofy organiza o acervo **por ritmo** e oferece playlists temáticas curadas por pessoas.

## 28. Visão geral do produto
Ver seção 3 do planejamento. Em resumo: acervo por ritmo + curadoria humana + player próprio + interação (curtidas/plays) em tempo real.

## 29. Atores / perfis
**Ouvinte**, **Curador** e **Administrador**. Identidade delegada ao Clerk; o `role` é mantido localmente e sincronizado pelo `clerkId` (RN10).

## 30. Funcionalidades principais
1. Gerenciar acervo musical · 2. Curadoria por ritmo (playlists) · 3. Descoberta e reprodução · 4. Interação social em tempo real · 5. Moderação do acervo.

## 31–32. Histórias de usuário e critérios de aceitação
8 histórias (HU01–HU08) com critérios — ver seção 6 do planejamento. **Todas implementadas e validadas** (ver item 42).

## 33. Backlog e planejamento das sprints
Backlog priorizado (MoSCoW + Story Points) na seção 8; distribuição das 3 sprints na seção 16. Status final: ver [`SCRUM.md`](SCRUM.md).

## 34. Arquitetura adotada
**Arquitetura em camadas** (aceita pelo edital), monorepo `client` + `server`.
Apresentação (`routes`/`controllers`/`sockets`/`middlewares`) → Aplicação/Domínio (`services`) → Persistência (`repositories`/`models`). A regra de negócio fica nos serviços, fora da camada de interface (requisito técnico 12). Justificativa completa na seção 9 do planejamento.

## 35. Framework e linguagem
TypeScript em todo o stack. Back-end: **Express** (framework obrigatório) + Mongoose + Clerk + Socket.io. Front-end: **React + Vite** + Tailwind + Zustand + React Query. Justificativa e recursos usados na seção 10 do planejamento.

## 36–37. Modelo de domínio e modelo de dados
Diagrama de classes e enumerações na seção 11; coleções e índices na seção 12 do planejamento. Entidades: `User`, `Track`, `Playlist`, `Like`, `PlayHistory`, `PlaylistFollow`, `ModerationLog`.

## 38. Princípios de projeto aplicados
| Princípio | Onde |
|---|---|
| Integridade conceitual | enum `Rhythm` único em todas as camadas; nomenclatura `*Service`/`*Repository`/`*Controller` |
| Ocultamento de informação | `controllers` não conhecem Mongoose; `services` não conhecem `req`/`res`; acesso a dados atrás de interfaces |
| Coesão | `TrackService`, `LikeService`, `PlaybackService`, `StorageService` com responsabilidade única |
| Acoplamento | serviços dependem de interfaces de repositório, não de implementações |
| Separação de responsabilidades | pastas por finalidade: apresentação, domínio, persistência, validação, erro, configuração |

## 39. Princípios SOLID aplicados (com localização no código)
| Princípio | Arquivo / classe |
|---|---|
| **SRP** | `services/*Service.ts` vs `controllers/*Controller.ts` vs `repositories/*Repository.ts` — cada um com uma razão para mudar |
| **OCP** | `services/strategies/SortStrategy.ts` — nova ordenação = nova `SortStrategy`, sem alterar `TrackService`/`TrackRepository` |
| **LSP** | interfaces em `repositories/interfaces.ts`; implementações concretas substituíveis sem quebrar os serviços (ver `track.routes.test.ts`/mocks nos testes) |
| **ISP** | `ITrackRepository`, `IPlaylistRepository`, `ILikeRepository`… interfaces pequenas e específicas, não uma "gorda" |
| **DIP** | `config/container.ts` injeta repositórios e `StorageService` nos serviços via abstração; `LikeService`/`PlaybackService` dependem de `RealtimeNotifier` (abstração de evento) |

## 40. Padrões de projeto utilizados (com justificativa)
| Padrão | Arquivo | Problema resolvido |
|---|---|---|
| **Repository** | `repositories/*Repository.ts` | Isola acesso ao Mongoose; permite testar serviços sem banco |
| **Service Layer** | `services/*Service.ts` | Concentra regras de negócio fora de controller/UI |
| **DTO** | `dtos/mappers.ts` | Não vazar campos internos (`__v`, refs) na API |
| **Strategy** | `services/strategies/SortStrategy.ts` | Trocar critério de ordenação sem modificar o serviço (OCP) |
| **Factory Method** | `services/TrackFactory.ts` | Criar faixa a partir de upload ou URL externa |
| **Observer** | `services/events/RealtimeNotifier.ts` + `sockets/index.ts` | Domínio emite eventos sem conhecer Socket.io; sockets observam e retransmitem |
| **State** | `client/src/store/playerStore.ts` | Máquina de estados do player (`idle→loading→playing⇄paused→ended`) |

## 41. Explicação das principais classes/módulos
- `TrackService` — cadastro/busca de faixas, aplica RN01/RN02/RN04.
- `PlaylistService` — curadoria, aplica RN01/RN03/RN05/RN09 e o "seguir" (HU06).
- `LikeService` — toggle idempotente (RN07) + evento de tempo real.
- `PlaybackService` — contagem honesta de plays (RN06) + histórico.
- `ModerationService` — inativar/reativar com log (HU07/RN04).
- `RealtimeNotifier` / `sockets` — ponte Observer → Socket.io.
- `LocalStorageService` — implementação concreta do `StorageService` (DIP).

## 42. Testes realizados
- **Unitários (Vitest, repositórios mockados):** `TrackService` (RN01/RN02 + criação), `LikeService` (RN07 + Observer), `PlaybackService` (RN06).
- **Integração (Supertest + MongoDB em memória):** `track.routes.test.ts` — HU02 (só ativas, filtro por ritmo), HU01/RN03 (403 ouvinte, 401 sem auth).
- **Smoke end-to-end (`npm run smoke`):** exercita HU01–HU08 e RN02/RN03/RN04/RN06 contra o app real. Saída registrada em [`testes/EVIDENCIAS.md`](testes/EVIDENCIAS.md).

Resultado: **12 testes automatizados passando** + smoke com 18 verificações ✓.

## 43. Dificuldades encontradas
- Integrar autenticação sem travar a demonstração → solução: **modo DEV** de auth (headers) quando o Clerk não está configurado, mantendo a mesma interface de `req.actor`.
- Contadores em tempo real sem transações → contadores desnormalizados + `$inc` atômico + eventos de domínio.
- Tipagem do Mongoose com arrays de refs → uso de `InferSchemaType` e DTOs na fronteira.

## 44. Melhorias futuras
- Armazenamento de áudio em nuvem (S3/Cloudinary) trocando a implementação do `StorageService`.
- "Boteco ao Vivo" (escuta síncrona em sala) reaproveitando a base de Socket.io.
- Recomendação por afinidade de ritmo a partir do `PlayHistory`.
- Migrar Clerk para uso pleno (sign-in real + verificação de token no handshake do socket).

## 45. Link do repositório
https://github.com/malusccp/botecofy-music-player
