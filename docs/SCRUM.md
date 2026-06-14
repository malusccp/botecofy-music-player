# Botecofy — Artefatos Scrum

Artefatos mínimos exigidos pelo edital (8.5): Product Backlog, Sprint Backlog, registro de reuniões, Sprint Review, Sprint Retrospective e quadro de acompanhamento (Trello/GitHub Projects).

> Quadro de acompanhamento: **GitHub Issues** — https://github.com/malusccp/botecofy-music-player/issues (uma issue por história HU01–HU08, com etiquetas de prioridade/sprint; todas concluídas). Opcional: board visual em GitHub Projects (`gh auth refresh -s project,read:project` e rodar `scripts/setup-board.ps1`).

---

## Product Backlog (status final)

| História | Prioridade | SP | Sprint | Status |
|---|---|---|---|---|
| HU01 Cadastrar faixa | Must | 5 | 1→2 | ✅ Concluída |
| HU02 Buscar/filtrar por ritmo | Must | 3 | 1→2 | ✅ Concluída |
| HU03 Player + fila | Must | 8 | 2 | ✅ Concluída |
| HU04 Playlists temáticas | Must | 5 | 2 | ✅ Concluída |
| HU05 Curtir em tempo real | Should | 5 | 3 | ✅ Concluída |
| HU06 Seguir playlist | Should | 3 | 3 | ✅ Concluída |
| HU07 Moderar acervo | Should | 3 | 3 | ✅ Concluída |
| HU08 Perfil + histórico | Could | 3 | 3 | ✅ Concluída |

---

## Planning Poker

Estimativa por consenso (escala Fibonacci: 1, 2, 3, 5, 8, 13). Cada integrante vota; em divergência, discute-se e revota.

### Sprint 2

| História | Votos (ex.) | Consenso | Justificativa |
|---|---|---|---|
| HU01 Cadastrar faixa (upload) | 3, 5, 5, 8 | **5** | Upload multipart + validação de arquivo (RN08) + RN02 elevam a complexidade |
| HU02 Buscar/filtrar | 2, 3, 3, 3 | **3** | Query + índices + estratégias de ordenação |
| HU03 Player + fila | 8, 8, 13, 8 | **8** | Máquina de estados do player, seek, fila, contagem de play (RN06) |
| HU04 Playlists | 5, 5, 3, 5 | **5** | CRUD + regras de unicidade (RN05) e visibilidade (RN09) |

### Sprint 3

| História | Votos (ex.) | Consenso | Justificativa |
|---|---|---|---|
| HU05 Curtir em tempo real | 5, 5, 8, 5 | **5** | Toggle idempotente (RN07) + Observer + Socket.io |
| HU06 Seguir playlist | 2, 3, 3, 3 | **3** | Relação follow + listagem |
| HU07 Moderar acervo | 3, 3, 5, 3 | **3** | Inativar/reativar + log + efeito em buscas (RN04) |
| HU08 Perfil + histórico | 3, 2, 3, 3 | **3** | Provisionamento (RN10) + histórico |

---

## Sprint 1 — semana de 28/05

- **Sprint Backlog:** análise, arquitetura, modelo de dados, base do projeto.
- **Review:** entregue o planejamento técnico, estrutura do monorepo, configuração de Express/Vite/Clerk/Mongoose/Socket.io e versão mínima (provisionamento + faixa).
- **Retrospective:** _o que foi bem:_ escopo enxuto e claro; _melhorar:_ alinhar cedo o modo de autenticação para demonstração.

## Sprint 2 — semana de 04/06

- **Sprint Backlog:** HU01, HU02, HU03, HU04 + SOLID + padrões.
- **Review:** acervo com upload, busca/filtro/ordenação, player funcional com fila e contagem de play, playlists temáticas. Repository/Service Layer/DTO/Strategy/Factory aplicados.
- **Retrospective:** _bem:_ camadas facilitaram testes; _melhorar:_ cobrir mais casos de erro de upload.

## Sprint 3 — semana de 11/06

- **Sprint Backlog:** HU05, HU06, HU07, HU08 + qualidade + testes + relatório.
- **Review:** curtidas/plays em tempo real (Observer + Socket.io), seguir playlists, moderação com log, perfil/histórico. Revisão de nomes, coesão e acoplamento; testes finalizados.
- **Retrospective:** _bem:_ tempo real integrou sem acoplar o domínio; _melhorar:_ futura migração do Clerk para uso pleno.

---

## Registro resumido de reuniões

| Sprint | Tipo | Pauta |
|---|---|---|
| 1 | Planning | Definição de escopo, histórias, arquitetura |
| 1 | Review/Retro | Base do projeto entregue; ajustes de auth |
| 2 | Planning + Poker | Estimativa e detalhamento de RN |
| 2 | Review/Retro | Funcionalidades centrais |
| 3 | Planning + Poker | Histórias restantes |
| 3 | Review/Retro | Qualidade, testes e fechamento |
