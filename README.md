# Pomodoro Study

Desktop study-focused pomodoro app. Tauri 2 + Svelte 5 + SQLite. The first shipped visual system is Acid Art: black surfaces, one acid-lime accent, hard shadows, and square controls.

## Quick Start

```bash
corepack pnpm install
corepack pnpm tauri dev
corepack pnpm tauri build
corepack pnpm test
corepack pnpm lint
corepack pnpm check
```

Rust is required for Tauri commands and packaging.

## Data Location

Windows: `%LOCALAPPDATA%\study.pomodoro.app\data.db`

## Documentation

- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)
- [docs/DATA_MODEL.md](docs/DATA_MODEL.md)
- [docs/THEMING.md](docs/THEMING.md)
- [docs/IPC_API.md](docs/IPC_API.md)
- [docs/AGENT_GUIDE.md](docs/AGENT_GUIDE.md)
