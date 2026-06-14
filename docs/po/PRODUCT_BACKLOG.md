# Botecofy — Product Backlog (artefato do Product Owner)

> **Responsável:** Maria Luiza Nascimento Morais (Product Owner)
> Documento que concentra a responsabilidade do PO: visão, backlog priorizado, histórias, critérios de aceitação, definições de pronto e o quadro de acompanhamento. Complementa o [`PLANEJAMENTO_TECNICO.md`](../PLANEJAMENTO_TECNICO.md).

---

## 1. Visão do produto

> **Para** ouvintes e curadores de música de boteco
> **que** não encontram curadoria especializada em brega, pagode, sertanejo e arrocha,
> **o Botecofy** é uma plataforma de streaming musical
> **que** organiza o acervo por ritmo e oferece playlists temáticas curadas por pessoas, com player próprio e interação em tempo real.
> **Diferente de** plataformas genéricas de streaming,
> **o nosso produto** coloca a curadoria por ritmo de bar no centro da experiência.

**Métrica de valor (proxy):** nº de plays e curtidas por ritmo e nº de seguidores por playlist.

---

## 2. Product Backlog priorizado

Priorização **MoSCoW** + valor de negócio + estimativa em Story Points (confirmada no Planning Poker).

| Ordem | ID | História (resumo) | Prioridade | Valor | SP | Sprint |
|---|---|---|---|---|---|---|
| 1 | HU01 | Cadastrar faixa no acervo | Must | Alto | 5 | 1→2 |
| 2 | HU02 | Buscar e filtrar por ritmo | Must | Alto | 3 | 1→2 |
| 3 | HU03 | Reproduzir e controlar player | Must | Alto | 8 | 2 |
| 4 | HU04 | Criar/gerenciar playlists temáticas | Must | Alto | 5 | 2 |
| 5 | HU05 | Curtir com atualização em tempo real | Should | Médio | 5 | 3 |
| 6 | HU06 | Seguir playlist e montar fila | Should | Médio | 3 | 3 |
| 7 | HU07 | Moderar acervo | Should | Médio | 3 | 3 |
| 8 | HU08 | Perfil sincronizado e histórico | Could | Baixo | 3 | 3 |

**Racional de priorização (decisão do PO):** primeiro o que cria e expõe o acervo (HU01/HU02), porque sem conteúdo nada mais tem valor; depois o consumo (HU03/HU04), que é o coração da experiência; por fim engajamento e governança (HU05–HU08).

---

## 3. Histórias com critérios de aceitação

> Versão de referência abaixo (resumida). Critérios completos em `PLANEJAMENTO_TECNICO.md` §6.

- **HU01** Como curador, quero cadastrar faixa (metadados + áudio + ritmo) → exige título/artista/ritmo/áudio; ritmo válido; sem duplicado por artista; inicia ativa; só curador/admin.
- **HU02** Como ouvinte, quero buscar/filtrar por ritmo → só faixas ativas; filtro por ritmo; busca textual; ordenação; paginação.
- **HU03** Como ouvinte, quero player com fila → play/pause, próxima/anterior, volume, seek, fila; play conta após ≥20s.
- **HU04** Como curador, quero playlists temáticas → nome + ≥1 ritmo; nome único por curador; add/remove/reordenar (só ativas); pública/privada; só dono/admin edita.
- **HU05** Como ouvinte, quero curtir em tempo real → 1 curtida por faixa (toggle); contadores ao vivo; exige login.
- **HU06** Como ouvinte, quero seguir playlists → seguir/deixar; listar seguidas; carregar na fila; privada não aparece.
- **HU07** Como admin, quero moderar → inativar/reativar com justificativa; inativa some das buscas; histórico; só admin.
- **HU08** Como ouvinte, quero perfil sincronizado → provisionado no 1º login; histórico; curtidas/seguidas; sem login não acessa.

---

## 4. Definition of Ready (DoR) — quando uma história pode entrar na sprint

- [ ] História no formato "Como… quero… para…".
- [ ] Critérios de aceitação escritos e testáveis.
- [ ] Regras de negócio relacionadas identificadas (RNxx).
- [ ] Estimada em Story Points (Planning Poker).
- [ ] Sem dependência bloqueante pendente.

## 5. Definition of Done (DoD) — quando uma história está concluída

- [ ] Código na `main` via branch/PR da história.
- [ ] Critérios de aceitação validados (teste automatizado ou evidência).
- [ ] Regras de negócio implementadas na camada de serviço.
- [ ] Sem quebra dos testes existentes (`npm test` verde).
- [ ] Backlog atualizado com o status.

---

## 6. Quadro de acompanhamento (Kanban) — conteúdo para Trello / GitHub Projects

**Colunas:** `Backlog` · `A fazer (Sprint)` · `Em progresso` · `Revisão` · `Concluído`

Cards (um por história) com etiquetas de prioridade e sprint:

| Card | Etiquetas | Coluna final |
|---|---|---|
| HU01 Cadastrar faixa | `Must` `Sprint 2` `backend` `frontend` | Concluído |
| HU02 Buscar/filtrar por ritmo | `Must` `Sprint 2` `backend` `frontend` | Concluído |
| HU03 Player + fila | `Must` `Sprint 2` `frontend` | Concluído |
| HU04 Playlists temáticas | `Must` `Sprint 2` `backend` `frontend` | Concluído |
| HU05 Curtir em tempo real | `Should` `Sprint 3` `realtime` | Concluído |
| HU06 Seguir playlist | `Should` `Sprint 3` `backend` `frontend` | Concluído |
| HU07 Moderar acervo | `Should` `Sprint 3` `admin` | Concluído |
| HU08 Perfil + histórico | `Could` `Sprint 3` `backend` `frontend` | Concluído |

> Para criar o quadro no **GitHub Projects** automaticamente (Issues + board), peça ao time de dev rodar o roteiro em [`../DIVISAO_EQUIPE.md`](../DIVISAO_EQUIPE.md).

---

## 7. Refinamento do backlog por sprint (responsabilidade contínua do PO)

| Sprint | Ação do PO |
|---|---|
| 1 (28/05) | Escreveu visão, histórias e critérios; priorizou backlog; alocou histórias nas sprints |
| 2 (04/06) | Reapresentou HU01–HU04 no Planning Poker; ajustou critérios após dúvidas do time |
| 3 (11/06) | Repriorizou HU05–HU08; validou entregas contra critérios de aceitação |
