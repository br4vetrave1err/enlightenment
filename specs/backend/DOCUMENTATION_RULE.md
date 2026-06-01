# Documentation Update Rule — Backend

## MANDATORY: Update Documentation After Each Phase

After completing ALL tasks in a phase, the corresponding documentation file in `docs/0N-*.md` MUST be updated before the phase can be marked complete in `PROGRESS.md`.

### Enforcement

A phase is NOT considered complete until its documentation file contains:

1. **Implementation Details** — What was actually built, file paths created, key decisions made
2. **API Endpoints** — Endpoints implemented, request/response shapes, any deviations from spec
3. **Services & Repositories** — Services created, repositories implemented, methods added
4. **Test Results** — Pass/fail counts for all test cases listed in the doc
5. **Deviations** — Any changes from the original plan, with reasoning
6. **Mobile API Contract Alignment** — Status of each mobile-facing endpoint
7. **Changelog Entry** — Date, phase number, summary of changes

### Documentation Files

| Phase | Documentation File |
|-------|-------------------|
| 1 | `docs/01-setup.md` |
| 2 | `docs/02-foundational.md` |
| 3 | `docs/03-auth.md` |
| 4 | `docs/04-pipeline.md` |
| 5 | `docs/05-courses.md` |
| 6 | `docs/06-progress.md` |
| 7 | `docs/07-chat.md` |
| 8 | `docs/08-search.md` |
| 9 | `docs/09-polish.md` |

### Template

All documentation files follow the structure defined in `docs/_template.md`. Use it as the base for any new feature documentation.

### Update Process

1. Complete all tasks in the phase
2. Run tests and record results (pass/fail counts)
3. Open the corresponding `docs/0N-*.md` file
4. Update all sections:
   - **Services & Repositories** — mark implemented endpoints with ✅
   - **API Endpoints** — update status column
   - **Tests** — update status column with pass/fail
   - **Implementation Details** — add key decisions, dependencies, error handling
   - **Mobile API Contract Alignment** — update status for each mobile endpoint
   - **Changelog** — add entry with date and summary
5. Mark the phase complete in `PROGRESS.md`
6. Commit changes with message: `docs: update backend phase N documentation`

### Violation

Skipping documentation updates will cause inconsistency between actual implementation and recorded state. This makes future development, debugging, and mobile-backend contract validation significantly harder.

### Cross-Reference with Mobile

After updating backend documentation, verify that:
- All mobile-facing endpoints match the contract in `specs/(mobile app)/docs/01-infrastructure.md`
- Response shapes match TypeScript interfaces in `shared/api-contract.ts`
- Any deviations are documented with reasoning
