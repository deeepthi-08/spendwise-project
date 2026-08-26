# SpendWise

SpendWise is a full-stack expense management application built with a Next.js frontend, Node.js/Express backend, and PostgreSQL database.

## Tech Stack

* Frontend: Next.js, TypeScript, Tailwind CSS
* Backend: Node.js, Express.js, TypeScript
* Database: PostgreSQL 16
* Authentication: JWT
* Containerization: Docker and Docker Compose
* Registry: Docker Hub

## Project Structure

```text
project-app/
├── backend/
├── frontend/
├── database/
├── docker-compose.yml
├── smoke-test.js
└── README.md
```

## Running the Application with Docker

Make sure Docker Desktop is running.

From the project root:

```bash
docker compose up -d
```

This starts:

| Service     | Port |
| ----------- | ---: |
| Frontend    | 3000 |
| Backend API | 4000 |
| PostgreSQL  | 5432 |

Open the frontend at:

```text
http://localhost:3000
```

The backend health endpoint is:

```text
http://localhost:4000/health
```

## Rebuilding the Images

Use `--build` when the application code, dependencies, Dockerfile, or other build-related configuration has changed:

```bash
docker compose up --build -d
```

If nothing requiring a rebuild has changed, use:

```bash
docker compose up -d
```

## Check Container Status

Run:

```bash
docker compose ps
```

The frontend, backend, and PostgreSQL containers should show as running and healthy.

## Smoke Tests

With the Docker containers running, execute:

```bash
node smoke-test.js
```

The smoke tests verify:

* Frontend responds successfully
* Backend health endpoint responds successfully

A successful run should show:

```text
Running SpendWise smoke tests...

✅ Frontend - 200
✅ Backend health - 200

🎉 All smoke tests passed!
```

## Stopping the Application

To stop the containers:

```bash
docker compose down
```

To stop the containers and remove the database volume as well:

```bash
docker compose down -v
```

> Warning: `docker compose down -v` removes the PostgreSQL Docker volume and therefore deletes the data stored in that volume.

## Docker Hub Images

The application images are published on Docker Hub.

### Backend

```text
deepthireddy08r/spendwise-backend:1.0
```

### Frontend

```text
deepthireddy08r/spendwise-frontend:1.0
```

PostgreSQL uses the official Docker image:

```text
postgres:16
```

## Quick Start

For a normal start:

```bash
docker compose up -d
```

Check the containers:

```bash
docker compose ps
```

Run the smoke tests:

```bash
node smoke-test.js
```

When finished:

```bash
docker compose down
```

## Week 5 Containerization

The project is containerized as a complete stack consisting of:

```text
Frontend
   ↓
Backend API
   ↓
PostgreSQL
```

Docker Compose allows the entire stack to be started with a single command.

The backend and frontend images are versioned and published to Docker Hub as version `1.0`.

## CI

SpendWise uses GitHub Actions to automatically run backend, frontend, and mobile tests and lint checks on pushes and pull requests.