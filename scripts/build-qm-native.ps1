$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
$vcvars = $null
$vswhere = "C:\Program Files (x86)\Microsoft Visual Studio\Installer\vswhere.exe"
if (Test-Path -LiteralPath $vswhere) {
  $vsInstall = & $vswhere -latest -products '*' -requires Microsoft.VisualStudio.Component.VC.Tools.x86.x64 -property installationPath
  if ($vsInstall) {
    $candidate = Join-Path $vsInstall "VC/Auxiliary/Build/vcvars64.bat"
    if (Test-Path -LiteralPath $candidate) { $vcvars = $candidate }
  }
}
$fallback = "C:\Program Files (x86)\Microsoft Visual Studio\2022\BuildTools\VC\Auxiliary\Build\vcvars64.bat"
if (-not $vcvars -and (Test-Path -LiteralPath $fallback)) {
  $vcvars = $fallback
}
if (-not $vcvars) {
  throw "Visual Studio C++ Build Tools were not found."
}

$include = Join-Path $root "vendor/QM_Method/include"
$output = Join-Path $root "build/qm-native-runner.exe"
$sources = @(
  "vendor/QM_Method/src/implicant.cpp",
  "vendor/QM_Method/src/parser.cpp",
  "vendor/QM_Method/src/quine_mccluskey.cpp",
  "vendor/QM_Method/src/petrick.cpp",
  "vendor/QM_Method/src/expression.cpp",
  "vendor/QM_Method/src/truth_table.cpp",
  "vendor/QM_Method/src/vera_wasm_wrapper.cpp",
  "tests/qm-native-runner.cpp"
) | ForEach-Object { '"' + (Join-Path $root $_) + '"' }

New-Item -ItemType Directory -Force -Path (Split-Path $output) | Out-Null
$line = 'call "' + $vcvars + '" >nul && cl.exe /nologo /EHsc /std:c++17 /O2 /I "' + $include + '" /Fe:"' + $output + '" ' + ($sources -join ' ')
Push-Location $root
try {
  & $env:ComSpec /d /s /c $line
  if ($LASTEXITCODE -ne 0) {
    throw "Native C++ build failed with exit code $LASTEXITCODE."
  }
}
finally {
  Pop-Location
}
Write-Output "Built $output"
