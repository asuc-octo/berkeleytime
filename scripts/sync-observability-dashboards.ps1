param([switch]$Check)

$ErrorActionPreference = 'Stop'
$repoRoot = Split-Path -Parent $PSScriptRoot
$sourceDir = Join-Path $repoRoot 'observability/grafana/dashboards'
$chartDir = Join-Path $repoRoot 'infra/observability/dashboards'

if (-not (Test-Path -LiteralPath $sourceDir -PathType Container)) {
  throw "Dashboard source directory does not exist: $sourceDir"
}
if (-not $Check) {
  New-Item -ItemType Directory -Path $chartDir -Force | Out-Null
}

$sources = Get-ChildItem -LiteralPath $sourceDir -Filter '*.json' -File
if ($sources.Count -eq 0) { throw 'No dashboard JSON source files found.' }
$sourceNames = $sources | Select-Object -ExpandProperty Name
$failed = $false
foreach ($source in $sources) {
  $packaged = Join-Path $chartDir $source.Name
  if ($Check) {
    if (-not (Test-Path -LiteralPath $packaged -PathType Leaf)) {
      Write-Error "Missing packaged dashboard: $packaged"
      $failed = $true
      continue
    }
    $sourceHash = (Get-FileHash -LiteralPath $source.FullName -Algorithm SHA256).Hash
    $packagedHash = (Get-FileHash -LiteralPath $packaged -Algorithm SHA256).Hash
    if ($sourceHash -ne $packagedHash) {
      Write-Error "Dashboard differs from source: $($source.Name)"
      $failed = $true
    } else {
      Write-Output "Match: $($source.Name)"
    }
  } else {
    Copy-Item -LiteralPath $source.FullName -Destination $packaged -Force
    Write-Output "Packaged: $($source.Name)"
  }
}

if (-not $Check) {
  Get-ChildItem -LiteralPath $chartDir -Filter '*.json' -File |
    Where-Object { $_.Name -notin $sourceNames } |
    Remove-Item -Force
}

if ($Check) {
  $packagedNames = Get-ChildItem -LiteralPath $chartDir -Filter '*.json' -File | Select-Object -ExpandProperty Name
  if (Compare-Object $sourceNames $packagedNames) {
    Write-Error 'Packaged dashboard set does not match source dashboard set.'
    $failed = $true
  }
  if ($failed) { exit 1 }
}
