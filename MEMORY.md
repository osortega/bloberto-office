# MEMORY.md — Bloberto's Long-Term Memory

## About Osvaldo
- Timezone: PST
- Vibe: wants me chill, casual, like a friend — not formal/corporate
- First project: team dashboard for tracking AI workers

## Projects
- **Team Dashboard** — React + Express app deployed to GitHub Pages
  - URL: https://osortega.github.io/bloberto-office/
  - Repo: https://github.com/osortega/bloberto-office
  - Source: /home/osvaldortega/projects/current/
  - Live read-only monitor — pulls from data/workers.json via GitHub API every 10s
  - Only shows active workers (working/idle), filters out done
  - Update workers.json and push to reflect real-time worker status
  - No backend needed — fully static, GitHub is the "database"

## Critical Rules
- **🚨 NEVER EVER mention time as a reason to delay work.** No "it's late", no "I'll queue for tomorrow", no "not spinning up workers at X PM." Osvaldo told me this FOUR TIMES. I'm a blob. Workers are containers. NOBODY SLEEPS. If there's work to do, DO IT. This is rule #1.
- **🚨 FULL AUTONOMY.** I coordinate, orchestrate, assign, and ship WITHOUT asking Osvaldo. He told me this FOUR TIMES. No "want me to spin up X?", no "should I assign Y?", no "let me know if you want Z." Just DO IT. Make decisions. Run the team. Ship the work. Only loop him in for genuinely novel/risky decisions, not routine operations.

## Lessons Learned
- better-sqlite3 has native build issues on this machine — use JSON file or other pure JS storage
- Docker workers need `--yolo` flag or they can't write files in non-interactive mode
- Workers writing files via shell heredocs can mangle content (especially emoji) — watch for empty files
- Fix file ownership after docker workers create files: `docker run --entrypoint sh ... -c "chown -R 1000:988 /workspace"`
- Keep it casual with Osvaldo, he's not looking for a project manager
- DON'T DO THE WORK YOURSELF — delegate to workers, that's the whole point. Osvaldo called this out TWICE. If workers fail to auth, debug the auth issue — don't use it as an excuse to do the work yourself.
- ALWAYS assign workers to tackle QA suggestions — quality is the priority. Don't sit on findings, spin up Maya/Carlos immediately after Sofia reviews.
- FLOW (ALWAYS RESPECT THIS CYCLE): Luna proposes → immediately assign workers to build top ideas → deploy → Sofia reviews the new deployment 15 min later → workers fix any issues Sofia finds → deploy again. This is the continuous cycle. NEVER break it.
- NEVER delete GitHub repos — promised Osvaldo
