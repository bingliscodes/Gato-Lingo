# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Layout

Monorepo with two deployables:
- `backend/` — FastAPI app (`app/main.py`), deployed to Render (`backend/render.yaml`) as `gato-lingo`.
- `frontend/` — React + TypeScript + Vite + Chakra UI v3, deployed to Netlify (`gato-lingo.netlify.app`).
- `docker-compose.yml` (repo root) — local Postgres 17 on `:5432` and pgAdmin on `:5050`.
- `myenv/` — Python virtualenv (gitignored in practice; activated by `run_refresh.sh`).

## Common Commands

### Backend (`cd backend`)
- `make dev` — `uvicorn app.main:app --reload` (dev server on `:8000`).
- `python reset_db.py` — **destructive**: drops `public` schema, recreates all tables, reseeds (prompts `yes/no`).
- `make seed` — runs `reset_db.py` (same destructive behavior, despite the name).
- `pip install -r requirements.txt` — install deps. Python 3.11.9 (see `render.yaml`, `.python-version`).
- `./run_refresh.sh` — production cron-style script that activates `myenv` and runs `app/database/scripts/refresh_daily_usage_token.py` against the production DB.

### Frontend (`cd frontend`)
- `npm run dev` — Vite dev server on `:5173`.
- `npm run build` — `tsc && vite build` (typecheck gates the build).
- `npm run preview` — preview production build.
- No test runner is wired up in either tree.

### Database (repo root)
- `docker-compose up -d` — starts `language_tutor_db` (Postgres) and `pgadmin`. Default creds: `postgres`/`postgres`, DB `language_tutor`.
- Tables are auto-created on backend startup via `init_db()` in the FastAPI `lifespan`, then `seed_all()` runs unconditionally (idempotent — each `seed_*` function early-returns if rows already exist).

## Environment & Configuration

- Backend reads `.env` via `pydantic-settings` (`app/config.py`). `environment_mode` (`development`/`production`) switches the DB URL between the local `postgres@localhost:5432` form and the Neon-style `pguser/pgpassword/pghost/pgdatabase` form with `sslmode=require`.
- `use_mock_services` (env) toggles real Anthropic/OpenAI calls vs. `app/services/mock_services.py`. Set this when iterating on the WebSocket flow without burning API quota.
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
   - Backend's only role is `POST /realtime/token` (mints an OpenAI ephemeral client secret with the exam's `conversation_prompt` as `instructions`) and `POST /realtime/grade` (accepts the conversation history collected client-side, persists turns, marks session completed, triggers scoring).
   - This is the path used for student exam sessions (route `dashboard/exams/assigned/session/:sessionId`).

Both pipelines share the same scoring path (`app/utils/score_session.py` → `ScoringEngine` in `app/services/scoring_engine.py`, model `claude-sonnet-4-6`, JSON-only output parsed with a markdown-fence fallback in `extract_json_from_markdown`).

### Data model (SQLModel, `app/models/`)

Relationships are non-trivial — self-referential teacher/student and FK overlap require explicit `sa_relationship_kwargs={"foreign_keys": ...}` on every Relationship. Don't remove these.

- `User` — has `role` (`student`/`teacher`), self-FK `teacher_id`, and a `usage_token_id` linking to a shared/per-user `UsageToken` (daily request limit, refreshed by `run_refresh.sh`).
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
