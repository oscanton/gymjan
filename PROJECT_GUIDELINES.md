# Project Guidelines

## Summary
- Simple PWA built with Vanilla Code.
- Visual style: Glassmorphism.
- Runs in the browser with persistent storage.
- Mobile First, but usable and comfortable on wide screens.

## Code Priorities (in order)
1. Efficient
2. Organized
3. Clean
4. Scalable
5. Readable
6. Solid
7. Coherent
8. Compact

## Structure Rules
- Data lives in `.js` files.
- Styles live in `.css` files.
- Structure lives in `.html` files.
- Logic lives in `.js` files.
- Use modern structure criteria; keep responsibilities separated.

## Comments
- Add comments when needed.
- Avoid over-commenting.

## Naming & Language
- Use English for variables, functions, data, file names, and code identifiers.
- All UI text must be in Spanish.
- Be especially careful to avoid mojibake.
- Naming must be consistent, self-explanatory, and uniform across the app.

## Accessibility & UX
- Prefer semantic HTML and clear hierarchy.
- Ensure tap targets are comfortable on mobile.
- Keep contrast readable over glass backgrounds.

## Data & Persistence
- Use persistent storage consistently (e.g., localStorage via shared helpers).
- Validate and sanitize persisted data before use.

## Performance
- Keep payloads small and avoid unnecessary dependencies.
- Prefer DOM updates that minimize reflows.

## Responsiveness
- Mobile First as the baseline.
- Enhance layouts for wide screens without breaking small screens.

## Consistency
- Reuse existing UI patterns and components before creating new ones.
- Centralize shared values (e.g., CSS variables, constants) when appropriate.
