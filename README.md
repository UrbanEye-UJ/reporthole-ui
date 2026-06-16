# Reporthole Frontend

The Reporthole frontend is a web application built with Next.js that allows civilians to report road incidents in real time. It connects to the `reporthole-be` Spring Boot backend via a generated API client.

---

## Tech stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 |
| Language | TypeScript 5 |
| UI Library | React 19 |
| Styling | Tailwind CSS 4 |
| API Client | orval (generated from OpenAPI spec) |
| Linting | ESLint 9 |
| Package manager | npm |

---

## Documentation

| Guide | Description |
|-------|-------------|
| [GIT_GUIDE.md](GIT_GUIDE.md) | Git workflow, branches, and commit conventions |

> The backend must be running before the frontend will work. See the backend [README](../reporthole-be/README.md) to get it started first.

---

## Prerequisites

### For coding (local dev)

| Tool | Version | Download |
|------|---------|----------|
| Node.js | 20 LTS | https://nodejs.org/en/download — select **LTS** |
| npm | Comes with Node | Included with Node.js |
| Git | Any | https://git-scm.com |
| VS Code or IntelliJ | Latest | https://code.visualstudio.com or https://www.jetbrains.com/idea |

### For testing only (Docker)

| Tool | Version | Download |
|------|---------|----------|
| Docker Desktop | Latest | https://www.docker.com/products/docker-desktop |
| Git | Any | https://git-scm.com |

---

## Running locally for development

Use this when you want to write and test frontend code.

### 1. Navigate to the frontend folder

```bash
cd reporthole-fe
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up your environment variables

Create a file called `.env.local` in the `reporthole-fe` folder:

```bash
cp .env.example .env.local
```

Open `.env.local` and fill in the values:

```env
# URL of the running backend. Change to your machine's LAN IP if testing on mobile.
NEXT_PUBLIC_API_URL=http://localhost:8080/api
```

> `.env.local` is already in `.gitignore`. Never commit it.

### 4. Start the backend

The backend must be running before the frontend will work. Start it first — either standalone (IntelliJ) or via Docker. See the backend [README](../reporthole-be/README.md).

### 5. Start the development server

```bash
npm run dev
```

The app will be available at `http://localhost:3000`.

The dev server has hot reload — any changes you save reflect in the browser immediately.

---

## Generating the API client

The frontend uses **orval** to generate a typed API client from the backend's OpenAPI spec. Whenever the backend API changes, regenerate the client.

Make sure the backend is running first, then:

```bash
npm run generate:api
```

This reads the OpenAPI spec from `http://localhost:8080/api/v3/api-docs` and writes the generated client to `app/api/generated/`. Commit the generated files after running this.

> **Do not edit files inside `app/api/generated/` manually** — they are overwritten every time you run this command.

Files that are safe to edit manually:
- `lib/axios.ts` — the axios instance and mutator used by orval
- `app/types/` — frontend-only type definitions

---

## Available scripts

| Command | What it does |
|---------|-------------|
| `npm run dev` | Start the development server with hot reload |
| `npm run build` | Build the app for production |
| `npm run start` | Run the production build locally |
| `npm run lint` | Check for linting errors |
| `npm run generate:api` | Regenerate the API client from the backend OpenAPI spec |
| `npm test` | Run the Jest unit test suite |

---

## Project structure

```
reporthole-fe/
├── app/                    # Next.js app router — pages and layouts
│   ├── api/                # Next.js Route Handlers (server-side API routes)
│   │   ├── incidents/
│   │   │   └── events/     # SSE proxy — forwards real-time updates from the backend
│   │   └── image-proxy/    # Image proxy — fetches backend images server-side
│   └── api/generated/      # orval-generated API client (do not edit manually)
├── components/             # Reusable UI components
├── lib/                    # Utilities, axios instance, helpers
├── public/                 # Static assets (images, icons)
├── __tests__/              # Jest unit tests
├── .env.local              # Your local environment variables (never commit)
├── .env.example            # Template — copy this to .env.local
├── middleware.ts           # Next.js middleware (auth guards, redirects)
├── next.config.ts          # Next.js configuration
├── orval.config.ts         # orval API generation config
├── tsconfig.json           # TypeScript configuration
└── package.json
```

### Route Handlers (Next.js server-side API routes)

Two Route Handlers proxy requests to the backend. These run on the Next.js server — the browser never talks to the backend directly for these:

| Route | Purpose |
|-------|---------|
| `/api/incidents/events` | Proxies the SSE stream from the backend. Adds the `Authorization` header server-side so EventSource (which cannot set custom headers) works from any device. |
| `/api/image-proxy` | Fetches incident images from the backend and streams them to the browser. Needed because images are stored on the backend server's local disk. |

---

## Running via Docker (full stack)

Use this when you want to run the complete system (frontend + backend + database) together without installing Node.js or Java.

The full stack is orchestrated from the **backend folder** using a single `docker-compose.yml`.

### 1. Set up the backend `.env` file

```bash
cd reporthole-be
cp .env.example .env
```

Fill in the required values (ask a teammate for `JASYPT_ENCRYPTOR_PASSWORD`).

### 2. Set up the frontend `.env.local` file

```bash
cd reporthole-fe
cp .env.example .env.local
```

For Docker, the frontend calls the backend via Docker's internal network, not `localhost`. Set:

```env
# Internal Docker network address — used by Route Handlers on the Next.js server
NEXT_PUBLIC_API_URL=http://reporthole-be:8080/api
```

> **Note:** `NEXT_PUBLIC_API_URL` with the Docker service name (`reporthole-be`) works for server-side calls (Route Handlers, orval). Browser-side calls use relative paths (`/api/...`) which route through Route Handlers — the browser never needs to resolve `reporthole-be` directly.

### 3. Build and start the full stack

From the `reporthole-be` folder:

```bash
docker compose up --build
```

The frontend will be available at `http://localhost:3000`.
The backend API will be available at `http://localhost:8080/api`.

### 4. Stopping

```bash
docker compose down
```

To also wipe the database volume:

```bash
docker compose down -v
```

---

## Common issues

**`npm install` fails with permission errors (Mac/Linux)**

Do not use `sudo npm install`. Instead fix npm permissions:

```bash
npm config set prefix ~/.npm-global
export PATH=~/.npm-global/bin:$PATH
```

**`npm run dev` — port 3000 already in use**

Kill whatever is on port 3000:

```bash
# Mac/Linux
lsof -ti:3000 | xargs kill

# Windows (PowerShell)
netstat -ano | findstr :3000
# then: taskkill /PID <pid> /F
```

Or run on a different port:

```bash
npm run dev -- -p 3001
```

**API requests fail / CORS errors**

Make sure the backend is running at `http://localhost:8080/api` and that `NEXT_PUBLIC_API_URL` in your `.env.local` matches that address exactly.

**`npm run generate:api` fails**

The backend must be running when you run this command. Start it first, wait for it to be healthy, then try again.

**Real-time updates (SSE) not working**

The SSE stream runs through the Next.js Route Handler at `/api/incidents/events`. If updates are not appearing:
- Check the browser Network tab for a long-lived request to `/api/incidents/events`
- Check the backend logs for `[SSE] User ... connected`
- Make sure your JWT cookie (`reporthole_token`) is present

**Changes not showing in the browser**

The dev server has hot reload but occasionally gets out of sync. Stop it with `Ctrl + C` and run `npm run dev` again.
