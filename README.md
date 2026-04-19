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
| [DEV_SETUP.md](#) *(this file — dev section)* | Set up your machine to write and run code |
| [DOCKER.md](#) *(this file — docker section)* | Run the frontend via Docker for testing |
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

Create a folder called `reporthole` and navigate into it:

```bash

### 1. Clone the repo and navigate to the frontend

```bash
git clone https://github.com/UrbanEye-UJ/reporthole-ui.git
cd reporthole/reporthole-fe
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up your environment variables

Create a file called `.env.local` in the `reporthole-fe` folder:

```bash

Open `.env.local` and fill in the values — ask a teammate if you are unsure:

```env
REPORTHOLE_API_BASE_URL=http://localhost:8080/api
```

> `.env.local` is already in `.gitignore`. Never commit it.

### 4. Start the development server

```bash
npm run dev
```

The app will be available at http://localhost:3000

The dev server has hot reload — any changes you save will reflect in the browser immediately without restarting.

---

## Generating the API client

The frontend uses **orval** to generate a typed API client from the backend's OpenAPI spec. Whenever the backend API changes, you need to regenerate the client.

Make sure the backend is running first, then:

```bash
npm run generate:api
```

This reads the OpenAPI spec from the running backend and regenerates the typed client code. Commit the generated files after running this.

> If you get an error, check that the backend is running at `http://localhost:8080/api` and that the Swagger spec is accessible at `http://localhost:8080/api/swagger-ui/index.html`.

---

## Available scripts

| Command | What it does |
|---------|-------------|
| `npm run dev` | Start the development server with hot reload |
| `npm run build` | Build the app for production |
| `npm run start` | Run the production build locally |
| `npm run lint` | Check for linting errors |
| `npm run generate:api` | Regenerate the API client from the backend OpenAPI spec |

---

## Project structure

```
reporthole-fe/
├── app/                    # Next.js app router — pages and layouts
├── components/             # Reusable UI components
├── lib/                    # Utilities, API client, helpers
├── public/                 # Static assets (images, icons)
├── .env.local              # Your local environment variables (never commit)
├── .env.example            # Template — copy this to .env.local
├── middleware.ts           # Next.js middleware (auth guards, redirects)
├── next.config.ts          # Next.js configuration
├── orval.config.ts         # orval API generation config
├── tailwind.config         # Tailwind CSS configuration (via postcss.config.mjs)
├── tsconfig.json           # TypeScript configuration
└── package.json
```

---

## Running via Docker

If you just want to run the frontend to test it without setting up Node.js:

### 1. Make sure the backend is running first

See the backend [DOCKER.md](../reporthole-be/DOCKER.md) and get it running before continuing.

### 2. Navigate to the frontend folder

```bash
cd reporthole/reporthole-fe
```

### 3. Create your `.env.local` file

```bash
cp .env.example .env.local
```

The default value should work as-is if the backend is running locally:

```env
NEXT_PUBLIC_API_URL=http://localhost:8080/api
```

### 4. Build and run the Docker container

```bash
docker build -t reporthole-fe .
docker run -p 3000:3000 --env-file .env.local reporthole-fe
```

The app will be available at http://localhost:3000

### 5. Stopping the container

```bash
# Find the container ID
docker ps

# Stop it
docker stop <container-id>
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

Or just run on a different port:

```bash
npm run dev -- -p 3001
```

**API requests fail / CORS errors**

Make sure the backend is running at `http://localhost:8080/api` and that `NEXT_PUBLIC_API_URL` in your `.env.local` matches that address exactly.

**`npm run generate:api` fails**

The backend must be running when you run this command. Start it first, wait for it to be healthy, then try again.

**Changes not showing in the browser**

The dev server has hot reload but occasionally gets out of sync. Stop it with `Ctrl + C` and run `npm run dev` again.