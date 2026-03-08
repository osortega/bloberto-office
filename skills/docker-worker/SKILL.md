---
name: docker-worker
description: "This skill should be used when the agent needs to spawn a Docker container running Copilot CLI, manage running containers, check container output, or clean up stopped worker containers. It handles the Docker lifecycle for dev-orchestrator workers."
version: 1.0.0
metadata:
  openclaw:
    emoji: "🐳"
    requires:
      bins:
        - docker
      env:
        - GITHUB_TOKEN
    primaryEnv: GITHUB_TOKEN
---

# Docker Worker Management

Manage Docker containers that run GitHub Copilot CLI as development workers.

## When to Use

- Spawning a new Copilot CLI worker container
- Checking status of running worker containers
- Reading output from completed workers
- Cleaning up old worker containers
- Debugging failed workers

## Spawning a Worker

To spawn a worker, use this command pattern:
```bash
docker run --rm \
  --name "worker-ROLENAME-$(date +%s)" \
  -e "COPILOT_GITHUB_TOKEN=$GITHUB_TOKEN" \
  --memory=2g \
  --cpus=1.0 \
  --pids-limit=100 \
  --network host \
  -v "/home/osvaldortega/projects/current:/workspace:rw" \
  copilot-worker:latest \
  --yolo \
  -p "YOUR_PROMPT_HERE"
```

Key flags:
- --rm removes the container automatically when done
- --network none prevents internet access (safe default)
- --yolo enables all permissions (file write, bash, etc.) — required for non-interactive mode
- -v mounts the shared project directory as /workspace
- -p passes the prompt to Copilot CLI in non-interactive mode
- --memory=2g and --cpus=1.0 enforce resource limits

If the worker needs internet (e.g., to install packages):
```bash
docker run --rm \
  --name "worker-ROLENAME-$(date +%s)" \
  -e "GITHUB_TOKEN=$GITHUB_TOKEN" \
  --memory=2g \
  --cpus=1.0 \
  --pids-limit=100 \
  --network host \
  -v "/home/osvaldortega/projects/current:/workspace:rw" \
  copilot-worker:latest \
  --yolo \
  -p "YOUR_PROMPT_HERE"
```

## Checking Running Workers
```bash
docker ps --filter "name=worker-" --format "table {{.Names}}\t{{.Status}}\t{{.RunningFor}}"
```

## Viewing Logs from a Running Worker
```bash
docker logs -f worker-CONTAINERNAME
```

## Killing a Stuck Worker
```bash
docker kill worker-CONTAINERNAME
```

## Listing Stopped Workers (if --rm was not used)
```bash
docker ps -a --filter "name=worker-" --filter "status=exited" --format "table {{.Names}}\t{{.Status}}\t{{.CreatedAt}}"
```

## Cleanup

Remove all stopped worker containers:
```bash
docker ps -a --filter "name=worker-" --filter "status=exited" -q | xargs -r docker rm
```

Remove dangling images:
```bash
docker image prune -f
```

## Verifying the Worker Image

Check if the worker image exists:
```bash
docker images copilot-worker:latest --format "{{.Repository}}:{{.Tag}} ({{.Size}})"
```

If missing, build it:
```bash
cd /home/osvaldortega/copilot-orchestrator/worker-image
docker build -t copilot-worker:latest .
```

## Troubleshooting

- **"GITHUB_TOKEN not set"**: Ensure the token is exported in the shell environment
- **Container exits immediately**: Check docker logs worker-NAME for errors
- **Permission denied on /workspace**: The volume mount path must exist and be writable
- **Out of memory**: Reduce concurrent workers or increase --memory limit
- **Network issues**: Switch from --network none to --network host if the worker needs internet
