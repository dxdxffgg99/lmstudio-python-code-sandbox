# Python Code Sandbox

A LMStudio plugin that gives AI the ability to run Python code in a sandboxed environment with pip package management.

## Features

- **Run Python Code**: Execute arbitrary Python snippets with stdout/stderr capture
- **Package Management**: Install/uninstall Python packages via `install_package` tool
- **Virtual Environment**: Pre-configured `.venv` with pip management
- **Cross-platform**: Works on Windows, macOS, and Linux
- **Timeout-free**: No execution time limits for long-running tasks
- **Type-safe**: Full TypeScript with strict typing

## Installation

1. Clone this repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Build the plugin:
   ```bash
   lms dev
   ```

4. Deploy to LMStudio or use `npm run dev` for development

## Quick Start

### Setup Virtual Environment

**Windows**:
```powershell
npm run venv:create
.\.venv\Scripts\Activate.ps1
```

**Unix/macOS**:
```sh
npm run venv:create:unix
source .venv/bin/activate
```

### Manage Packages

```bash
# List installed packages
npm run pip -- list

# Install a package
npm run pip -- install requests numpy pandas

# Uninstall a package
npm run pip -- uninstall requests
```

### Development

Run the plugin in development mode:
```bash
npm run dev
```

## Available Tools

### `run_python`
Execute Python code snippets. The AI will use `.venv` automatically if available.

**Parameters**:
- `python` (string): Python code to execute

**Example**:
```python
import requests
response = requests.get("https://example.com")
print(response.status_code)
```

### `install_package`
Manage Python packages directly from the AI.

**Parameters**:
- `action` (enum): "install", "uninstall", or "list"
- `package` (string, optional): Package name (required for install/uninstall)

## Project Structure

```
├── src/
│   ├── index.ts                 # Plugin entry point
│   ├── toolsProvider.ts         # Tool definitions (run_python, install_package)
│   └── findLMStudioHome.ts      # LMStudio home directory detection
├── .scripts/
│   ├── setup_venv.ps1           # Virtual env setup (Windows)
│   ├── setup_venv.sh            # Virtual env setup (Unix)
│   └── pip.js                   # Cross-platform pip wrapper
├── package.json
├── tsconfig.json
└── README.md
```

## Development

See [CONTRIBUTING.md](CONTRIBUTING.md) for development guidelines.

## License

MIT License - see [LICENSE](LICENSE) for details

## Support

For issues and feature requests, please open an issue on GitHub.

