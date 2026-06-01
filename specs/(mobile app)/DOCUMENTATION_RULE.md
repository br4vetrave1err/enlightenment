# Documentation Update Rule — Mobile App

## MANDATORY: Update Documentation After Each Phase

After completing ALL tasks in a phase, the corresponding documentation file in `docs/0N-*.md` MUST be updated before the phase can be marked complete in `PROGRESS.md`.

### Enforcement

A phase is NOT considered complete until its documentation file contains:

1. **Implementation Details** — What was actually built, file paths created, key decisions made
2. **API Integration** — Endpoints used, request/response shapes, any deviations from spec
3. **Test Results** — Pass/fail counts for all test cases listed in the doc
4. **Deviations** — Any changes from the original plan, with reasoning
5. **Changelog Entry** — Date, phase number, summary of changes

### Documentation Files

| Phase | Documentation File |
|-------|-------------------|
| 1 | `docs/01-infrastructure.md` |
| 2 | `docs/02-auth.md` |
| 3 | `docs/03-courses.md` |
| 4 | `docs/04-chat.md` |
| 5 | `docs/05-progress.md` |
| 6 | `docs/06-map.md` |
| 7 | `docs/07-testing.md` |

### Template

All documentation files follow the structure defined in `docs/_template.md`. Use it as the base for any new feature documentation.

### Update Process

1. Complete all tasks in the phase
2. Run tests and record results
3. Open the corresponding `docs/0N-*.md` file
4. Update all sections: implementation, API, tests, changelog
5. Mark the phase complete in `PROGRESS.md`
6. Commit changes with message: `docs: update phase N documentation`

### Violation

Skipping documentation updates will cause inconsistency between actual implementation and recorded state. This makes future development and debugging significantly harder.
