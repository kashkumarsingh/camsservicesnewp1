# Cursor Chat Transcripts (.txt vs .jsonl)

## Where chats are stored

For this project, Cursor stores data under:

- **Path:** `~/.cursor/projects/home-buildco-camsservicep1/`
- **Chat transcripts:** `agent-transcripts/`

## Formats

| Format   | Location              | Used by      |
|----------|-----------------------|--------------|
| **Legacy** | `agent-transcripts/<uuid>.txt` | Older Cursor |
| **New**  | `agent-transcripts/<uuid>/<uuid>.jsonl` | Current Cursor |

New versions of Cursor use **.jsonl** (one JSON object per line with `role` and `message.content`). The UI loads these. Legacy **.txt** files (plain `user:` / `assistant:` blocks) are no longer loaded as chat history.

## How to load old .txt chats

1. **Convert to .jsonl** so Cursor can show them:

   ```bash
   node scripts/convert-cursor-txt-to-jsonl.js [agent-transcripts-dir]
   ```

   Default directory: `~/.cursor/projects/home-buildco-camsservicep1/agent-transcripts`

   The script:
   - Reads only **top-level** `.txt` files (`<uuid>.txt`)
   - Parses `user:` / `assistant:` sections
   - Writes `agent-transcripts/<uuid>/<uuid>.jsonl` in the new format
   - Leaves original `.txt` files unchanged

2. **Restart Cursor** (or reopen the project) so it rescans transcripts.

3. **If you copied transcripts to a new project:** run the converter **inside that project’s** `agent-transcripts` folder (or pass that path as the argument). Use the project folder name Cursor created (e.g. `home-buildco-camsservicesnewp1`).

## Check token usage and size (KB)

To see transcript **size (MB/KB)** and **estimated token usage** (total and per project), run:

```bash
bash scripts/cleanup-cursor-chats.sh
```

No files are archived unless they are over 5MB. The script prints a summary with size and token estimates before and after. (See **Cleanup** below for archive/reset behaviour.)

## Cleanup

- **Script:** `scripts/cleanup-cursor-chats.sh`  
  - Archives transcripts larger than 5MB (both `.txt` and `.jsonl`) to `~/.cursor/archived-chats/`.
  - Prints **total** and **per-project** size and estimated token usage (before and after).
- **Reset (archive everything):**  
  `bash scripts/cleanup-cursor-chats.sh --reset`  
  Moves **all** transcripts into a dated folder under `~/.cursor/archived-chats/reset-YYYY-MM-DD-HHMMSS/<project-name>/`, so each project’s `agent-transcripts` is empty. Cursor will show no past chats until you start new ones. Use this to clear history and reduce cost in one go.
- After cleanup, the script reminds you how to convert legacy `.txt` to `.jsonl` if needed.

## Trim (reduce size in place)

To **shorten** transcripts without archiving (keeps recent messages, drops older ones):

```bash
node scripts/trim-cursor-transcripts.js [options] [path]
```

- **Default path:** `~/.cursor/projects/home-buildco-camsservicep1/agent-transcripts`
- **Options:**
  - `--keep N` — keep last N messages (default: 20)
  - `--keep-kb X` — keep last X KB of content (overrides `--keep`)
  - `--dry-run` — show what would be trimmed, do not write
  - `--no-backup` — do not create `.before-trim` backup

**Examples:**

```bash
# Keep last 20 messages in each transcript (default)
node scripts/trim-cursor-transcripts.js

# Keep last 10 messages
node scripts/trim-cursor-transcripts.js --keep 10

# Keep last 50 KB per transcript
node scripts/trim-cursor-transcripts.js --keep-kb 50

# See what would change without writing
node scripts/trim-cursor-transcripts.js --dry-run
```

The script rewrites `.txt` and `.jsonl` files in place. A backup is saved as `<file>.before-trim` unless you pass `--no-backup`. Use this when a chat is long and you want to keep only the tail so Cursor loads less context.
