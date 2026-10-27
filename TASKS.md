# TASKS — lab-04 · the Lab on Design System v9 "Day sky"

- Brief: `C:\localhost\projects\agent-honeypot\dispatches\BRIEF-v1-lab-04-day-sky-2026-10-27.md` (v1 + Addendum A).
- Executor: Claude Code on ACO-PC, Opus 5.5 Extra High, agent=claude-code. RUNLOG run `aco-pc-20261027T194427Z`.
- Branch `feat/lab-day-sky-2026-10-27` from `origin/feat/lab-mvp-2026-10-15` @ `e0177ff` (PR #1 is an open draft, so this PR stacks on it).
- Box 12 h from 19:44Z 27 Oct: checkpoint 04:44Z, hard stop 07:44Z 28 Oct.
- Design source: `TJ-Hosting/tj` `feat/iso-day-2026-10-26` @ `bfccfbb` (worktree `C:\localhost\tj-iso`), DS v9 tokens, glass, base, chrome, components.
- Times are wall-clock UTC.

| Step | Status | Start | End | Notes |
|---|---|---|---|---|
| P0 Setup and baseline | done | 19:44 | 20:14 | Store pull ff to e3e01d73; precondition met (tj-build-06 RUN END 09:54Z, P10 RUN END 19:22Z); brief committed to the store (f9240419); worktree made; `gen.ps1 -Check` exit 0 (lab 0/40); Pillow 13 venv `C:\localhost\tools\lab-venv`; Playwright's installer hung unzipping Chromium 1194 under Node 26, so its downloaded zips were unpacked with Windows `tar` (headless OK). Baseline `npm test` 23/23, contrast lowest 4.66:1 (`evidence/lab-04/baseline-test-output.txt`) |
| P1 DS v9 in the Lab | in progress | 20:14 | | |
| P2 Art | pending | | | |
| P3 Home, shell and 404 | pending | | | |
| P4 The three samples | pending | | | |
| P5 The honeypot | pending | | | |
| P6 Visual review | pending | | | |
| P7 Full verification | pending | | | |
| P8 Docs, PR, records | pending | | | |
