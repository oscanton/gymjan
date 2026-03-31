# Core Architecture

## Overview
This folder is organized to keep domain logic reusable across browser, server, and future clients.

- `engine/` contains pure domain logic (no `window`, `DB`, `UI`, or DOM access).
- `legacy/` contains compatibility wrappers that preserve the current browser API and globals.
- `adapters/` provides environment-specific wiring (browser, node, etc.).

## Flow
1. `engine/` implements the logic.
2. `legacy/` wraps the engine for the existing UI code.
3. `adapters/` centralizes loading and environment wiring.

## Migration Rules
- New logic goes into `engine/` first.
- `legacy/` should only wrap engine functions (no new logic).
- When all callers migrate to engine/adapters, `legacy/` can be removed.
