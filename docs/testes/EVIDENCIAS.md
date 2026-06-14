# Evidências de Testes — Botecofy

Validação dos critérios de aceitação e regras de negócio. Reproduza com:

```bash
npm test               # testes automatizados (servidor)
npm --workspace server run smoke   # smoke end-to-end contra o app real
```

## 1. Testes automatizados (`npm test`) — 12 passando

```
✓ src/services/PlaybackService.test.ts (2 tests)   # RN06
✓ src/services/LikeService.test.ts (2 tests)       # RN07 + Observer
✓ src/services/TrackService.test.ts (4 tests)      # RN01, RN02, criação
✓ src/tests/track.routes.test.ts (4 tests)         # HU02, HU01/RN03 (integração)

 Test Files  4 passed (4)
      Tests  12 passed (12)
```

## 2. Smoke end-to-end (`npm run smoke`) — 18 verificações ✓

Exercita o app real (Express + Mongoose em memória, modo DEV de auth) cobrindo todas as histórias:

```
✓ GET /health  → ok
✓ GET /meta  → brega,pagode,sertanejo,arrocha
✓ HU01 cadastrar faixa (201)
✓ RN02 título duplicado bloqueado (409)
✓ HU02 buscar/filtrar
✓ HU05 curtir (liked, likes=1)
✓ RN06 play<20s não conta
✓ RN06 play>=20s conta
✓ HU04 criar playlist (201)
✓ HU04 adicionar faixa à playlist
✓ RN03 ouvinte não cria playlist (403)
✓ HU06 seguir playlist
✓ HU06 listar seguidas
✓ HU07 inativar faixa
✓ RN04 faixa inativa some da busca
✓ HU08 perfil
✓ HU08 histórico registrado

Smoke test concluído.
```

## 3. Mapa critério de aceitação → evidência

| História / Regra | Evidência |
|---|---|
| HU01 cadastrar faixa | smoke "HU01 (201)"; bloqueio de ouvinte em `track.routes.test.ts` |
| HU02 buscar/filtrar (só ativas) | `track.routes.test.ts` "lista apenas ativas" + "filtra por ritmo" |
| HU03 player/play (RN06) | `PlaybackService.test.ts` + smoke "play<20s/play>=20s" |
| HU04 playlists (RN05/RN03) | smoke "criar playlist" + "ouvinte não cria (403)" |
| HU05 curtir tempo real (RN07) | `LikeService.test.ts` (toggle + evento Observer) + smoke |
| HU06 seguir playlist | smoke "seguir" + "listar seguidas" |
| HU07 moderar (RN04) | smoke "inativar" + "faixa inativa some da busca" |
| HU08 perfil/histórico (RN10) | smoke "perfil" + "histórico" |
| RN01 ritmo válido | `TrackService.test.ts` "rejeita ritmo inválido" |
| RN02 título duplicado | `TrackService.test.ts` + smoke (409) |
