# Agent Maintenance Guide

## Hard Rules

1. Do not write hex colors, rounded corners, or blurred shadows into component CSS.
2. Do not bypass `src/lib/ipc.ts` for persistent app data.
3. Treat completed `pomodoros` rows as historical facts.
4. Migrations are append-only.
5. Settings values are JSON-encoded strings.

## Common Tasks

### Add A Setting

1. Add the default in `src-tauri/src/seed.rs`.
2. Add the field to `SettingsState`.
3. Add a key in `KEY_MAP` in `settings.svelte.ts`.
4. Add a control in `src/routes/settings/+page.svelte`.

### Add A Statistic

1. Extend `StatsSummary` in `src-tauri/src/commands/stats.rs`.
2. Mirror the type in `src/lib/types.ts`.
3. Render it in `src/routes/stats/+page.svelte`.
4. Update `docs/IPC_API.md`.

### Add An IPC Command

1. Implement it under `src-tauri/src/commands/`.
2. Register it in `tauri::generate_handler!` in `src-tauri/src/lib.rs`.
3. Add a wrapper in `src/lib/ipc.ts`.
4. Document it in `docs/IPC_API.md`.

## Manual Acceptance Checklist

1. Start a focus session with no task; let it finish; confirm a break starts.
2. Start, pause, resume; confirm the countdown resumes correctly.
3. Start, interrupt, enter a reason; confirm the session returns to idle and the interrupt appears in stats.
4. Add a goal, add a task, select it, complete a focus; confirm task progress increments.
5. Complete four focus sessions; confirm the next break is long.
6. Switch theme; confirm Acid remains active and Synthwave is disabled as coming soon.
7. Change settings; restart; confirm settings persist.
8. Export JSON, reset data, import JSON; confirm data returns.
