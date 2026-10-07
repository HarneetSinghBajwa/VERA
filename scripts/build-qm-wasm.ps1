param([string]$EmsdkPath = $env:EMSDK)

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
if (-not $EmsdkPath) {
  $candidate = Join-Path $env:TEMP "vera-emsdk"
  if (Test-Path (Join-Path $candidate "upstream/emscripten/em++.exe")) {
    $EmsdkPath = $candidate
  }
}

$compiler = Get-Command "em++" -ErrorAction SilentlyContinue
if (-not $compiler -and $EmsdkPath) {
  $candidateCompiler = Join-Path $EmsdkPath "upstream/emscripten/em++.exe"
  if (Test-Path $candidateCompiler) {
    $compilerPath = $candidateCompiler
  }
}
elseif ($compiler) {
  $compilerPath = $compiler.Source
}

if (-not $compilerPath) {
  throw "Emscripten was not found. Install the official Emscripten SDK or pass -EmsdkPath."
}

if ($EmsdkPath) {
  $env:EMSDK = $EmsdkPath
  $env:PATH = (Join-Path $EmsdkPath "upstream/emscripten") + ";" + (Join-Path $EmsdkPath "upstream/bin") + ";" + $env:PATH
  $pythonDirectory = Get-ChildItem (Join-Path $EmsdkPath "python") -Directory | Sort-Object Name -Descending | Select-Object -First 1
  $nodeDirectory = Get-ChildItem (Join-Path $EmsdkPath "node") -Directory | Sort-Object Name -Descending | Select-Object -First 1
  if ($pythonDirectory) { $env:EMSDK_PYTHON = Join-Path $pythonDirectory.FullName "python.exe" }
  if ($nodeDirectory) { $env:EMSDK_NODE = Join-Path $nodeDirectory.FullName "node.exe" }
}

$include = Join-Path $root "vendor/QM_Method/include"
$sources = @(
  "vendor/QM_Method/src/implicant.cpp",
  "vendor/QM_Method/src/parser.cpp",
  "vendor/QM_Method/src/quine_mccluskey.cpp",
  "vendor/QM_Method/src/petrick.cpp",
  "vendor/QM_Method/src/expression.cpp",
  "vendor/QM_Method/src/truth_table.cpp",
  "vendor/QM_Method/src/vera_wasm_wrapper.cpp"
) | ForEach-Object { Join-Path $root $_ }
$output = Join-Path $root "lib/qm-engine.mjs"
$temporaryDirectory = Join-Path $root "build/emscripten-tmp"
New-Item -ItemType Directory -Force -Path $temporaryDirectory | Out-Null
$env:TEMP = $temporaryDirectory
$env:TMP = $temporaryDirectory
$env:TMPDIR = $temporaryDirectory
$arguments = @(
  "-std=c++17", "-O2", "-fexceptions", "-I$include"
) + $sources + @(
  "-sMODULARIZE=1",
  "-sEXPORT_ES6=1",
  "-sSINGLE_FILE=1",
  "-sENVIRONMENT=web,worker",
  "-sFILESYSTEM=0",
  "-sALLOW_MEMORY_GROWTH=1",
  "-sEXPORTED_FUNCTIONS=['_vera_qm_minimize']",
  "-sEXPORTED_RUNTIME_METHODS=['cwrap']",
  "-o", $output
)

Push-Location $root
try {
  & $compilerPath @arguments
  if ($LASTEXITCODE -ne 0) {
    throw "Emscripten failed with exit code $LASTEXITCODE."
  }
}
finally {
  Pop-Location
}

Write-Output "Built $output"
