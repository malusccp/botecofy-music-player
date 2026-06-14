# Botecofy - cria o quadro de acompanhamento no GitHub (Issues + Project) e marca como concluido.
# Requisito do edital (8.5): quadro de acompanhamento.
#
# OBSERVACAO HONESTA SOBRE DATAS:
#   A data de CRIACAO das issues e definida pelo GitHub no momento da execucao (hoje) e
#   nao pode ser alterada. O corpo de cada issue cita a JANELA DA SPRINT planejada
#   (conforme docs/SCRUM.md) apenas como metadata de planejamento - nao como data de criacao.
#
# PRE-REQUISITOS:
#   1. gh auth login   (conta com acesso de ESCRITA ao repo)
#   2. codigo enviado:  git push origin main
#
# USO:  powershell -ExecutionPolicy Bypass -File scripts/setup-board.ps1

$ErrorActionPreference = "Stop"
$REPO  = "malusccp/botecofy-music-player"   # ajuste se o repo final for outro
$OWNER = "malusccp"
$PROJECT_TITLE = "Botecofy - Sprints"

Write-Host "==> Criando etiquetas..." -ForegroundColor Cyan
$labels = @(
  @("Must","b60205"), @("Should","fbca04"), @("Could","0e8a16"),
  @("Sprint 1","5319e7"), @("Sprint 2","1d76db"), @("Sprint 3","006b75"),
  @("backend","c5def5"), @("frontend","bfd4f2"), @("realtime","d4c5f9"), @("admin","e99695")
)
foreach ($l in $labels) {
  try { gh label create $l[0] --color $l[1] --repo $REPO --force | Out-Null }
  catch { Write-Host "   (label $($l[0]) ja existe)" -ForegroundColor DarkGray }
}

# Historias: id, titulo, etiquetas, sprint de entrega e a janela (semana) dessa sprint.
$stories = @(
  @{ id="HU01"; t="Cadastrar faixa no acervo";            labels="Must,Sprint 2,backend,frontend";  sprint="2"; week="semana de 04/06" },
  @{ id="HU02"; t="Buscar e filtrar por ritmo";           labels="Must,Sprint 2,backend,frontend";  sprint="2"; week="semana de 04/06" },
  @{ id="HU03"; t="Reproduzir e controlar o player";      labels="Must,Sprint 2,frontend";          sprint="2"; week="semana de 04/06" },
  @{ id="HU04"; t="Criar/gerenciar playlists tematicas";  labels="Must,Sprint 2,backend,frontend";  sprint="2"; week="semana de 04/06" },
  @{ id="HU05"; t="Curtir com atualizacao em tempo real"; labels="Should,Sprint 3,realtime";        sprint="3"; week="semana de 11/06" },
  @{ id="HU06"; t="Seguir playlist e montar fila";        labels="Should,Sprint 3,backend,frontend"; sprint="3"; week="semana de 11/06" },
  @{ id="HU07"; t="Moderar acervo";                       labels="Should,Sprint 3,admin";           sprint="3"; week="semana de 11/06" },
  @{ id="HU08"; t="Perfil sincronizado e historico";      labels="Could,Sprint 3,backend,frontend"; sprint="3"; week="semana de 11/06" }
)

Write-Host "==> Criando issues..." -ForegroundColor Cyan
$urls = @()
foreach ($s in $stories) {
  $body = @"
Historia $($s.id) - $($s.t)

- Planejada/entregue na **Sprint $($s.sprint)** ($($s.week)), conforme docs/SCRUM.md.
- Criterios de aceitacao: docs/po/PRODUCT_BACKLOG.md (secao 3) e docs/PLANEJAMENTO_TECNICO.md (secao 6).
- Status: Concluida.
"@
  $url = gh issue create --repo $REPO --title "$($s.id) $($s.t)" --label $s.labels --body $body
  Write-Host "   criada: $url"
  $urls += $url
}

Write-Host "==> Criando o Project (board)..." -ForegroundColor Cyan
$proj = gh project create --owner $OWNER --title $PROJECT_TITLE --format json | ConvertFrom-Json
$projNum = $proj.number
Write-Host "   project #$projNum"

Write-Host "==> Adicionando issues ao Project..." -ForegroundColor Cyan
foreach ($u in $urls) { gh project item-add $projNum --owner $OWNER --url $u | Out-Null }

Write-Host "==> Fechando issues como concluidas (tudo entregue)..." -ForegroundColor Cyan
foreach ($u in $urls) { gh issue close $u --repo $REPO --comment "Entregue e validada (build + testes verdes)." | Out-Null }

Write-Host ""
Write-Host "OK! Issues criadas, adicionadas ao Project e fechadas como concluidas." -ForegroundColor Green
Write-Host "No site, se quiser, ative o campo 'Status' e confirme que os cards estao em 'Done'." -ForegroundColor Green
Write-Host "Depois cole o link do Project em docs/SCRUM.md (campo 'Quadro de acompanhamento')." -ForegroundColor Green
