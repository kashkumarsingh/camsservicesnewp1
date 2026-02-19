#!/usr/bin/env node
/**
 * Convert legacy Cursor chat transcripts (.txt) to the new .jsonl format.
 *
 * Old format: agent-transcripts/<uuid>.txt with "user:" / "assistant:" lines.
 * New format: agent-transcripts/<uuid>/<uuid>.jsonl with one JSON object per line.
 *
 * Usage:
 *   node scripts/convert-cursor-txt-to-jsonl.js [agent-transcripts-dir]
 *
 * Default: $HOME/.cursor/projects/home-buildco-camsservicep1/agent-transcripts
 *
 * Converts only top-level .txt files (legacy). Writes into <uuid>/<uuid>.jsonl
 * so Cursor can load them. Original .txt files are left unchanged.
 */

const fs = require('fs');
const path = require('path');

const TRANSCRIPT_DIR =
  process.argv[2] ||
  path.join(
    process.env.HOME || process.env.USERPROFILE,
    '.cursor',
    'projects',
    'home-buildco-camsservicep1',
    'agent-transcripts'
  );

function parseTxtTranscript(content) {
  const turns = [];
  // Normalise line endings and split by line boundaries where "user:" or "assistant:" starts a line
  const normalised = content.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  const segments = normalised.split(/\n(?=(?:user|assistant):\s*$)/m);
  for (const segment of segments) {
    const trimmed = segment.trim();
    if (!trimmed) continue;
    const firstLineEnd = trimmed.indexOf('\n');
    const firstLine = firstLineEnd === -1 ? trimmed : trimmed.slice(0, firstLineEnd);
    const body = firstLineEnd === -1 ? '' : trimmed.slice(firstLineEnd + 1).trim();
    if (firstLine.startsWith('user:')) {
      turns.push({ role: 'user', text: body });
    } else if (firstLine.startsWith('assistant:')) {
      turns.push({ role: 'assistant', text: body });
    }
  }
  return turns;
}

function toJsonlLine(role, text) {
  const msg = {
    role,
    message: {
      content: [{ type: 'text', text }],
    },
  };
  return JSON.stringify(msg);
}

function main() {
  if (!fs.existsSync(TRANSCRIPT_DIR)) {
    console.error('Directory not found:', TRANSCRIPT_DIR);
    process.exit(1);
  }

  const entries = fs.readdirSync(TRANSCRIPT_DIR, { withFileTypes: true });
  const txtFiles = entries.filter(
    (e) => e.isFile() && e.name.endsWith('.txt') && /^[0-9a-f-]{36}\.txt$/i.test(e.name)
  );

  if (txtFiles.length === 0) {
    console.log('No legacy .txt transcripts found at top level.');
    return;
  }

  console.log(`Found ${txtFiles.length} legacy .txt transcript(s). Converting to .jsonl...\n`);

  let converted = 0;
  let skipped = 0;

  for (const dirent of txtFiles) {
    const uuid = dirent.name.replace(/\.txt$/, '');
    const txtPath = path.join(TRANSCRIPT_DIR, dirent.name);
    const subdir = path.join(TRANSCRIPT_DIR, uuid);
    const jsonlPath = path.join(subdir, `${uuid}.jsonl`);

    if (fs.existsSync(jsonlPath)) {
      console.log(`  Skip ${uuid} (already has .jsonl)`);
      skipped++;
      continue;
    }

    const content = fs.readFileSync(txtPath, 'utf8');
    const turns = parseTxtTranscript(content);
    if (turns.length === 0) {
      console.log(`  Skip ${uuid} (no user/assistant turns parsed)`);
      skipped++;
      continue;
    }

    fs.mkdirSync(subdir, { recursive: true });
    const lines = turns.map((t) => toJsonlLine(t.role, t.text));
    fs.writeFileSync(jsonlPath, lines.join('\n') + '\n', 'utf8');
    console.log(`  OK ${uuid} (${turns.length} turns)`);
    converted++;
  }

  console.log(`\nDone. Converted: ${converted}, Skipped: ${skipped}`);
  if (converted > 0) {
    console.log('Cursor should now load these chats (new format). Legacy .txt files were left in place.');
  }
}

main();
