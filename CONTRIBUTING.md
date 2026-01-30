# Contributing

Thanks for your interest in contributing! Here are the guidelines:

## Development Setup

1. Clone the repository
2. Install dependencies:
   ```sh
   npm install
   ```

3. Create a virtual environment:
   - **Windows**: `npm run venv:create`
   - **Unix/macOS**: `npm run venv:create:unix`

4. Activate the virtual environment and install development packages:
   ```sh
   npm run pip -- install pytest black flake8
   ```

## Development

- Run in development mode: `npm run dev`
- Build: `npm run build`
- Type check: `npm run typecheck`

## Making Changes

1. Create a new branch for your feature/fix
2. Make your changes in `src/`
3. Run `npm run typecheck` and `npm run build` to verify
4. Commit with clear messages
5. Push and create a pull request

## Code Style

- TypeScript: Strict mode enabled
- Follow existing code patterns
- Add type annotations

## Testing

Before submitting, ensure:
- Code compiles without errors: `npm run build`
- Type checking passes: `npm run typecheck`
