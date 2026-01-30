#!/usr/bin/env sh
set -e

echo "Creating Python virtual environment in .venv (Unix)..."

if command -v python3 >/dev/null 2>&1; then
  python3 -m venv .venv
elif command -v python >/dev/null 2>&1; then
  python -m venv .venv
else
  echo "Python not found on PATH. Install Python 3 first." >&2
  exit 1
fi

. .venv/bin/activate
pip install --upgrade pip setuptools wheel

echo "Virtual environment created. Activate with: source .venv/bin/activate"
