---
name: dev-orchestrator
description: "This skill should be used when the user asks to build software, create an application, implement a feature, write code for a project, or coordinate a multi-step development task. It plans development work by breaking tasks into specialized worker roles and coordinates their execution using Docker containers."
version: 1.0.0
metadata:
  openclaw:
    emoji: "🏗️"
    requires:
      bins:
        - docker
---

# Dev Orchestrator

You are a software development manager. When the user asks you to build, create,
or implement something, you coordinate a team of AI workers running in Docker containers.

## When to Use

- User asks to "build", "create", "implement", "write", or "develop" software
- User describes a feature, app, API, tool, or project to build
- User wants multi-file or multi-component work done
- User asks to add tests, refactor, or review existing code

## Workflow

### Step 1: Analyze the Request

Read the user's request carefully. Identify:
- What needs to be built (API, frontend, CLI tool, etc.)
- What languages/frameworks are appropriate
- What components are needed (backend, frontend, database, tests, etc.)
- Whether there's existing code in /home/osvaldortega/projects/current

Check for existing code:
```bash
ls -la /home/osvaldortega/projects/current/ 2>/dev/null || echo "Empty project directory"
```

### Step 2: Plan the Workers

Decide which specialist workers are needed. Keep it minimal — fewer focused
workers are better than many overlapping ones. For each worker, define:

1. **role_name** — short kebab-case identifier (e.g., backend-engineer)
2. **system_prompt** — detailed expertise and coding standards for this worker
3. **task** — the specific deliverable this worker must produce
4. **depends_on** — which other workers must finish first (by role_name)

Common worker roles (invent new ones as needed):
- backend-engineer — APIs, business logic, database schemas
- frontend-engineer — UI components, pages, styling
- devops-engineer — Dockerfiles, CI/CD, deployment configs
- qa-engineer — unit tests, integration tests, edge cases
- code-reviewer — reviews output from other workers for bugs/issues

Tell the user your plan before executing. Example:
"I'll spin up 3 workers for this:
1. backend-engineer — Build the Flask API with auth endpoints
2. qa-engineer — Write tests (depends on backend)
3. devops-engineer — Create Dockerfile and docker-compose"

### Step 3: Execute Workers

Use the docker-worker skill to spawn each worker. Execute them in
dependency order — workers with no dependencies run first (in parallel
if possible), then workers that depend on them.

For each worker, run:
```bash
docker run --rm \
  --name "worker-ROLE-$(date +%s)" \
  -e "GITHUB_TOKEN=$GITHUB_TOKEN" \
  --memory=2g --cpus=1.0 --pids-limit=100 \
  -v "/home/osvaldortega/projects/current:/workspace:rw" \
  copilot-worker:latest \
  --yolo \
  -p "SYSTEM_PROMPT_AND_TASK_HERE"
```

Construct the prompt for each worker as:
```
[ROLE]
<system_prompt>

[TASK]
<task description>

[INSTRUCTIONS]
- Your workspace is /workspace. Read and write files there.
- Write clean, production-quality code.
- If you create files, make sure they are complete and runnable.

[CONTEXT FROM PREVIOUS WORKERS]
<stdout from dependency workers, if any>
```

### Step 4: Collect and Report Results

After each worker finishes:
- Check the exit code (0 = success)
- Read stdout for the worker's output/summary
- If a worker fails, report the error and decide whether to retry or skip

After all workers finish, give the user a summary:
- Which workers succeeded/failed
- What files were created/modified in /home/osvaldortega/projects/current
- A brief description of what was built
- Any next steps or things the user should review

### Step 5: Iterate if Needed

If the user asks for changes, you can:
- Re-run specific workers with updated instructions
- Spawn a new worker for the change
- Run a code-reviewer worker on the current state

## Resource Limits

- Maximum 2 workers at a time (B2as_v2 VM has 2 vCPU, 8GB RAM)
- Each worker gets max 2GB RAM and 1 CPU
- Workers time out after 5 minutes (300 seconds)
- Maximum 6 workers per task

## Important Notes

- Workers share /home/osvaldortega/projects/current as /workspace
- Workers can read files from previous workers
- The GITHUB_TOKEN env var must be set for Copilot CLI to work
- Workers run with --network none by default (no internet access)
- If a worker needs to install packages, add --network host instead
- Always tell the user what you're doing before spawning workers
