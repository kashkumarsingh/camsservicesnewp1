# Repo and Local Workflow – Lessons Learned

**Purpose:** So you are more careful in future. This documents what happened when branch code was pushed to a new repo and the existing local was left with old code.

---

## 1. What Happened (Summary)

- **New repo (camsservicesnewp1)** was created and **branch code was pushed there** (e.g. from a feature branch or main that had the latest work).
- **Existing local repo (camsservicep1)** was **left with older code** – it did not have those changes (e.g. session timing helper, Live/History fix, Reverb, centralised notifications, etc.).
- The two Git histories were **unrelated** (no common ancestor), so a simple `git merge newrepo/main` into local failed with "refusing to merge unrelated histories". Merging with `--allow-unrelated-histories` was possible but blocked by uncommitted local changes and permission issues.
- **Result:** Two codebases – **new repo = up-to-date**, **local (camsservicep1) = old**. To get the new code locally you either: use the new repo clone (camsservicesnewp1), or merge/cherry-pick into the old repo (with care).

---

## 2. The Two Repos (Reference)

| Repo | Remote / clone | Typical use |
|------|-----------------|-------------|
| **camsservicep1** | `origin` → github.com/.../camsservicep1.git | Original repo; local workspace may be on e.g. `feature/admin-children-management`. **Had old code** if you only pushed to the new repo. |
| **camsservicesnewp1** | `newrepo` (or clone ~/camsservicesnewp1) | New repo; has the **newer code** (session timing, Live/History, Reverb, dashboards, etc.). |

**Important:** Pushing a **branch** to a **new repo** does **not** update your **existing local branch** in the **original repo**. Your local camsservicep1 stays as it was until you pull/merge from somewhere.

---

## 3. What to Be Careful About in Future

### 3.1 Branch vs repo vs local

- **Pushing to a new remote** (e.g. `git push newrepo feature/xyz`) updates **only that remote**. Your **local** and **origin** are unchanged.
- If you want **local** to match the **new repo**, you must either:
  - **Clone the new repo** and work there, or
  - **Merge or cherry-pick** from the new repo into your local repo (and resolve conflicts / unrelated history if needed).
- **Always know which repo and which branch** you are on when you push, and where you expect the “source of truth” to be (e.g. new repo vs origin).

### 3.2 Single source of truth

- Decide **one** place as source of truth (e.g. **camsservicesnewp1** on GitHub). Use that for deploys and for “latest code”.
- Avoid doing **new feature work only on the old local** and then pushing only to the new repo – your **local** will stay old unless you explicitly update it (merge, or re-clone the new repo).

### 3.3 Env files are not in Git

- **`.env`** (backend) and **`.env.local`** (frontend) are **gitignored**. They are **not** in any branch or repo.
- After **cloning** the new repo, you must **create or copy** these files (e.g. from the other project or from `env.reverb.example`). Otherwise backend/frontend may not start or may miss Reverb/API config.

### 3.4 Docker: names and networks

- If **two projects** use the **same container names** (e.g. `camsservice-mailhog`), the **second** `docker compose up` will fail with “container name already in use”.
- Use **different** container/network names per project (e.g. **camsservicep1** → `kidzrunz-*` or `cams-p1-*`, **camsservicesnewp1** → `camsnew-*`).
- If **db** / **redis** are not on the **same Docker network** as the backend, the backend cannot resolve `db` / `redis`. Fix by connecting those containers to the same network with the correct **aliases** (`db`, `redis`, `mailhog`) or by doing a clean `docker compose up` so Compose creates the network and aliases.

### 3.5 Before merging from “new repo” into local

- **Commit or stash** local changes (so merge isn’t blocked).
- **Move or add** any untracked files that would be overwritten (e.g. notifications, uploads).
- **Fix permissions** on `backend/storage` (and `bootstrap/cache` if needed) so Git/Composer can run.
- If the histories are **unrelated**, use `git merge newrepo/main --allow-unrelated-histories` and expect to resolve conflicts.

---

## 4. Quick Checklist (When Pushing to a New Repo or Syncing)

- [ ] I know **which repo** is my source of truth (e.g. camsservicesnewp1).
- [ ] I know **which branch** I pushed to the new repo and that **local** (camsservicep1) will **not** auto-update.
- [ ] If I want local to match the new repo, I will **clone the new repo** or **merge/cherry-pick** into the old repo and resolve conflicts.
- [ ] After cloning the new repo, I will **create/copy** `backend/.env` and `frontend/.env.local` (and Reverb vars if needed).
- [ ] I will use **different Docker** project/container names so the two projects don’t conflict.
- [ ] I will **not** assume that “pushing to new repo” updates my existing local code.

---

## 5. Optional: New Repo (camsservicesnewp1) Setup Reminder

- Clone: `git clone <new-repo-url> ~/camsservicesnewp1`
- Copy env: `backend/.env` and `frontend/.env.local` (e.g. from camsservicep1); ensure Reverb vars in frontend.
- Docker: `cd ~/camsservicesnewp1 && docker compose up -d`
- Backend: `docker compose exec backend composer install`, `php artisan key:generate`, `php artisan migrate`, `php artisan db:seed`
- Frontend: `docker compose --profile frontend up -d` or `cd frontend && npm run dev`
- URLs: Backend **http://localhost:9080**, Frontend **http://localhost:4300** (or 3000 if run locally).

---

*Document created so that in future you can be more careful about which repo has the latest code and how local, origin, and the new repo stay in sync.*
