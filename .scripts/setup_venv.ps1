Param()

Write-Host "Creating Python virtual environment in .venv (Windows)..."

try {
    python -m venv .venv 2>$null
    if ($LASTEXITCODE -ne 0) {
        Write-Host "'python' failed, trying 'py -3'..."
        py -3 -m venv .venv
    }
} catch {
    Write-Error "Failed to create virtual environment. Ensure Python is installed and on PATH."
    exit 1
}

$venvPython = Join-Path -Path ".venv" -ChildPath "Scripts\python.exe"
if (-Not (Test-Path $venvPython)) {
    Write-Error "Virtual environment created but python executable not found at $venvPython"
    exit 1
}

& $venvPython -m pip install --upgrade pip setuptools wheel

Write-Host "Virtual environment created and pip upgraded."
Write-Host "Activate with: .\.venv\Scripts\Activate.ps1 (PowerShell) or .\.venv\Scripts\activate (cmd)"
