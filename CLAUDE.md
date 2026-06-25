# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Layout

Monorepo with two deployables:
- `backend/` — FastAPI app (`app/main.py`), deployed to Render (`backend/render.yaml`) as `gato-lingo`.
- `frontend/` — React + TypeScript + Vite + Chakra UI v3, deployed to Netlify (`gato-lingo.netlify.app`).
- `docker-compose.yml` (repo root) — local Postgres 17 on `:5432`, pgAdmin on `:5050`, and Redis 7 on `:6379`.
- `myenv/` — Python virtualenv (gitignored in practice).

## Common Commands

### Backend (`cd backend`)
- `make dev` — `uvicorn app.main:app --reload` (dev server on `:8000`).
- `python reset_db.py` — **destructive**: drops `public` schema, recreates all tables, reseeds (prompts `yes/no`).
- `make seed` — runs `reset_db.py` (same destructive behavior, despite the name).
- `pip install -r requirements.txt` — install deps. Python 3.11.9 (see `render.yaml`, `.python-version`).

### Frontend (`cd frontend`)
- `npm run dev` — Vite dev server on `:5173`.
- `npm run build` — `tsc && vite build` (typecheck gates the build).
- `npm run preview` — preview production build.
- No test runner is wired up in either tree.

### Database (repo root)
- `docker-compose up -d` — starts `language_tutor_db` (Postgres), `pgadmin`, and `gato_lingo_redis` (Redis). Default creds: `postgres`/`postgres`, DB `language_tutor`.
- Tables are auto-created on backend startup via `init_db()` in the FastAPI `lifespan`, then `seed_all()` runs unconditionally (idempotent — each `seed_*` function early-returns if rows already exist). The `lifespan` also pings Redis at startup and logs reachability (it does not block startup if Redis is down).
- `make db` — opens a `psql` shell into the local Postgres container (`docker exec -it language_tutor_db psql -U postgres -d language_tutor`).
- `docker exec -it gato_lingo_redis redis-cli` — inspect rate-limit counters; e.g. `KEYS usage:*`, `GET usage:user:<id>:<YYYY-MM-DD>`, `TTL <key>`.

## Environment & Configuration

- Backend reads `.env` via `pydantic-settings` (`app/config.py`). `environment_mode` (`development`/`production`) switches the DB URL between the local `postgres@localhost:5432` form and the Neon-style `pguser/pgpassword/pghost/pgdatabase` form with `sslmode=require`.
- `use_mock_services` (env) toggles real Anthropic/OpenAI calls vs. `app/services/mock_services.py`. Set this when iterating on the WebSocket flow without burning API quota.
- `redis_url` (env `REDIS_URL`) — defaults to `redis://localhost:6379/0` (the Docker container) in dev. In production it points at Upstash via a `rediss://` (TLS) URL set in the Render dashboard (`sync: false` in `render.yaml` — never commit the value). `app/redis_client.py` builds a single shared sync client with `redis.from_url`; the route handlers are sync (`def`), so a sync client is correct (FastAPI runs them in a threadpool).
- Frontend reads `VITE_API_BASE_URL` (axios) and `VITE_WEBSOCKET_URL` (the legacy `/ws/conversation` flow). All HTTP calls use `withCredentials: true` — the backend issues a JWT in an HTTP-only cookie (`samesite=none` on https frontends, `lax` otherwise; `secure` only in production).
- CORS origins are hardcoded in `app/main.py`: `localhost:5173`, `localhost:3000`, `gato-lingo.netlify.app`. Add new origins here, not via env.

## Architecture

### Two conversation pipelines (this is the key thing to understand)

The app has **two parallel implementations** of the tutor conversation, and the frontend routes between them:

1. **Legacy WebSocket pipeline** — `ws://…/ws/conversation`, handled by `app/websockets/conversation.py` (`ConversationHandler`).
   - Client sends `config` then base64 `audio` JSON messages.
   - Server orchestrates STT (OpenAI Whisper) → Anthropic Claude (`conversation_engine.py`, model `claude-haiku-4-5`) → TTS (OpenAI), returning base64 audio per turn.
   - TTS is the documented primary bottleneck; STT and LLM generation are secondary.
   - Each turn is persisted to `conversation_turns`; session lifecycle (`assigned` → `in_progress` → `completed`) lives on `conversation_sessions`. On `end_session`, `generate_session_score()` is invoked.

2. **OpenAI Realtime pipeline** — WebRTC peer connection from the browser directly to `api.openai.com/v1/realtime/calls`.
   - Frontend `useRealtimeAPI` hook (`frontend/src/hooks/useRealtimeAPI.ts`) manages the `RTCPeerConnection`, `RTCDataChannel`, mic stream, and audio playback.
   - Backend's only role is `POST /realtime/token` (requires auth and enforces the Redis rate limit before minting an OpenAI ephemeral client secret, with the exam's `conversation_prompt` as `instructions` — see Rate limiting) and `POST /realtime/grade` (accepts the conversation history collected client-side, persists turns, marks session completed, triggers scoring).
   - This is the path used for student exam sessions (route `dashboard/exams/assigned/session/:sessionId`).

Both pipelines share the same scoring path (`app/utils/score_session.py` → `ScoringEngine` in `app/services/scoring_engine.py`, model `claude-sonnet-4-6`, JSON-only output parsed with a markdown-fence fallback in `extract_json_from_markdown`).

### Data model (SQLModel, `app/models/`)

Relationships are non-trivial — self-referential teacher/student and FK overlap require explicit `sa_relationship_kwargs={"foreign_keys": ...}` on every Relationship. Don't remove these.

- `User` — has `role` (`student`/`teacher`), self-FK `teacher_id`, and an optional `usage_token_id`. `UsageToken` now only holds a `usage_limit` (config value); the live daily count lives in Redis, not Postgres (see Rate limiting below). Normal users have `usage_token_id = None` and are limited per-user from `config.max_daily_requests`; the seeded `demo` token (`name == "demo"`) is what flags the shared demo pool.
- `Exam` — created by a teacher; carries `conversation_prompt` (generated at create time by `ConversationEngine.build_system_prompt` from topic + tenses + vocab + cultural context) plus `vocabulary_list_id` and a legacy `vocabulary_list_manual` text field.
- `ConversationSession` — one per (exam, student) assignment. Status enum: `assigned` | `in_progress` | `completed`.
- `ConversationTurn` — append-only per session, ordered by `turn_number`, `speaker` is `"student"` or `"tutor"`.
- `SessionScore` — one-to-one with session; written by `create_session_score`.
- `VocabularyList` / `VocabularyItem` / `VocabularyListItem` (m2m link table).

`app/schemas/responses.py` holds shared response Pydantic models that several model files import (avoids circular imports — keep response models there, not in the model file, when more than one model needs them).

### Authentication (`app/dependencies/auth.py` + `app/controllers/auth.py`)

- JWT (HS256, `pyjwt`) is the source of truth. Tokens are returned in the JSON body **and** set as an HTTP-only `jwt` cookie via `set_token_cookie`.
- `get_token_from_request` checks `Authorization: Bearer` first, then falls back to the cookie — both the legacy localStorage flow and the cookie flow work.
- `get_current_user` additionally rejects tokens issued before `user.password_changed_at` (forces re-login after password reset).
- `require_roles("teacher")` is the factory used to gate teacher-only endpoints (e.g. `POST /exams`, `POST /exams/assign`, `GET /exams/dashboard`).
- Password hashing uses `pwdlib[argon2]` (see `app/utils/password.py`); `authenticate_user` runs a dummy-hash compare on unknown emails to prevent timing oracles.

### Rate limiting (`app/utils/rate_limit.py` + `app/redis_client.py`)

The daily AI-usage limiter is **Redis-backed**. There is no `daily_usage` column or daily-reset cron anymore — both were retired.

- **Counter:** `increment_usage(key, limit)` does an atomic `INCR` and sets a 48h `EXPIRE` on first hit. Keys are date-scoped, so a new day = a new key (the TTL just garbage-collects old keys). Returns `(allowed, count)`.
- **Buckets:** `resolve_key_and_limit(user)` picks the key + limit. Demo users (linked to the `demo`-named `UsageToken`) all share one key `usage:demo:{date}` capped by that token's `usage_limit` — so the whole demo experience shares a daily pool. Everyone else gets a per-user key `usage:user:{user_id}:{date}` capped by `config.max_daily_requests`.
- **Enforcement is server-side at the point of spend.** `POST /realtime/token` requires auth (`get_current_user`) and calls `increment_usage` **before** minting the OpenAI session; over limit → `429`. This is the real gate. `GET /usage/me` (in `usage_tokens.py`) is a **read-only** UI helper (`get_usage`, a plain `GET`) — it must never `INCR` or it double-counts.
- **Failure modes are deliberate and asymmetric:** `/realtime/token` fails **closed** (`503`) if Redis is down (don't risk unmetered OpenAI spend); `/usage/me` fails **open** (it's just a hint). There is **no Postgres fallback** — if you see a reference to one, it's stale.
- `config.max_daily_requests` is the live per-user default (previously dead code). `redis_client` is a module-level shared client; import it, don't re-create.

### Frontend structure (`frontend/src/`)

- React Router 7 with `createBrowserRouter` (`App.tsx`). Routes split into a public root and a nested `dashboard/*` tree.
- Global `UserContext` (`contexts/UserContext.tsx`) calls `verifyJWT` (`GET /auth/me`) on mount to hydrate the logged-in user from the cookie.
- Chakra UI v3 with a custom theme in `src/theme.ts` and `ChakraProvider value={system}` + `next-themes` in `main.tsx`.
- Path alias `@/` → `src/` (configured in `vite.config.ts` and `tsconfig.app.json`).
- `vite-plugin-svgr` is enabled — import `.svg?react` for inline React components.
- API layer is plain axios in `src/utils/apiCalls.ts` and `src/utils/authentication.ts`; every call passes `withCredentials: true`. There is no global query/caching library — components manage their own loading state.

## Conventions Worth Knowing

- The backend uses `from __future__`-style `TYPE_CHECKING` imports inside model files to break the circular import graph among `User` / `ConversationSession` / `Exam` / `VocabularyList`. Mirror this pattern when adding new models with cross-references.
- When adding a new controller, register it in `app/main.py` `app.include_router(...)` — there is no autodiscovery.
- The legacy WebSocket path uses extensive `print(...)` timing logs (`time.perf_counter()` deltas) to identify bottlenecks. Keep them when modifying that file unless you're replacing the instrumentation.
- `reset_db.py` is the only sanctioned way to drop schema — it imports every model first so `SQLModel.metadata` is complete. If you add a new model, import it there too or `create_all` will skip it.
- The seed function names imply idempotence (`seed_users` returns early if any user exists); a new seed function should follow the same "count-then-skip" pattern.
