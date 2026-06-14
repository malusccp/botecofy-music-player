# Botecofy - cria o quadro de acompanhamento no GitHub (Issues + Projects).
# Requisito do edital (8.5): quadro de acompanhamento.
#
# PRE-REQUISITOS:
#   1. gh auth login   (logar com uma conta que tenha acesso de ESCRITA ao repo)
#   2. o repositorio ja precisa existir no GitHub (origin) e o codigo ter sido enviado (git push)
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
  catch { Write-Host "   (label $($l[0]) ja existe ou ignorada)" -ForegroundColor DarkGray }
}

Write-Host "==> Criando issues (uma por historia)..." -ForegroundColor Cyan
$stories = @(
  @{ id="HU01"; t="Cadastrar faixa no acervo";            labels="Must,Sprint 2,backend,frontend" },
  @{ id="HU02"; t="Buscar e filtrar por ritmo";           labels="Must,Sprint 2,backend,frontend" },
  @{ id="HU03"; t="Reproduzir e controlar o player";      labels="Must,Sprint 2,frontend" },
  @{ id="HU04"; t="Criar/gerenciar playlists tematicas";  labels="Must,Sprint 2,backend,frontend" },
  @{ id="HU05"; t="Curtir com atualizacao em tempo real"; labels="Should,Sprint 3,realtime" },
  @{ id="HU06"; t="Seguir playlist e montar fila";        labels="Should,Sprint 3,backend,frontend" },
  @{ id="HU07"; t="Moderar acervo";                       labels="Should,Sprint 3,admin" },
  @{ id="HU08"; t="Perfil sincronizado e historico";      labels="Could,Sprint 3,backend,frontend" }
)
foreach ($s in $stories) {
  $body = "Criterios de aceitacao em docs/po/PRODUCT_BACKLOG.md (secao 3) e PLANEJAMENTO_TECNICO.md (secao 6)."
  gh issue create --repo $REPO --title "$($s.id) $($s.t)" --label $s.labels --body $body
}

Write-Host "==> Criando o Project (board)..." -ForegroundColor Cyan
# Cria o board. Depois, no site, ative o campo 'Status' com as colunas:
#   Backlog -> A fazer -> Em progresso -> Revisao -> Concluido
# e arraste as issues. (gh nao move cards de Status por CLI de forma estavel.)
gh project create --owner $OWNER --title $PROJECT_TITLE

Write-Host ""
Write-Host "OK. Issues criadas. Abra o Project no GitHub, adicione as issues e organize as colunas." -ForegroundColor Green
Write-Host "Cole o link do board em docs/SCRUM.md (campo 'Quadro de acompanhamento')." -ForegroundColor Green
