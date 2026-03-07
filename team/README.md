# Team Roster

The team folder contains prompt files for each worker. Each file defines a worker's identity, personality, skills, coding standards, and lessons learned.

## How It Works

1. **Hiring** — Create a new markdown file in `team/` with the worker's profile
2. **Assigning work** — Read the worker's prompt file and include it as the system prompt when spinning up a container
3. **Training** — Update the worker's "Lessons Learned" section based on their performance
4. **Firing** — Delete their prompt file
5. **Dashboard** — workers.json reflects who from this roster is currently working

## Current Roster

| Name | File | Role | Emoji |
|------|------|------|-------|
| Carlos | carlos-backend.md | Backend Engineer | ⚙️ |
| Maya | maya-frontend.md | Frontend Engineer | 🎨 |
| Dave | dave-devops.md | DevOps Engineer | 🚀 |
| Sofia | sofia-qa.md | QA Engineer | 🔍 |

## Worker Dispatch Template

When assigning work, use this pattern:

```
[IDENTITY]
{contents of team/worker-name.md}

[TASK]
{specific task description}

[INSTRUCTIONS]
- Your workspace is /workspace
- Write clean, production-quality code
- {any task-specific instructions}
```

## Updating Workers

After a worker completes a task, review their output:
- Did they make mistakes? → Add to "Lessons Learned"
- Did they excel at something? → Reinforce it in their prompt
- Did they ignore a standard? → Make it more explicit

Workers get better over time because their prompts evolve.
