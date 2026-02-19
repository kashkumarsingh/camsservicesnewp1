#!/usr/bin/env node
/**
 * Trim Cursor chat transcripts to reduce size and token usage.
 * Keeps only the last N messages (or last X KB) and rewrites the file.
 *
 * Usage:
 *   node scripts/trim-cursor-transcripts.js [options] [path]
 *
 * Options:
 *   --keep N      Keep last N messages (default: 20)
 *   --keep-kb X   Keep last X KB of content (overrides --keep if set)
 *   --dry-run     Show what would be trimmed, do not write
 *   --no-backup   Do not create .before-trim backup
 *
 * Path: file (.txt or .jsonl) or directory (agent-transcripts).
 *       Default: $HOME/.cursor/projects/home-buildco-camsservicep1/agent-transcripts
 *
 * Backups are saved as <file>.before-trim; remove them after verifying.
 */

const fs = require('fs');
const path = require('path');

const DEFAULT_KEEP = 20;
const defaultDir = path.join(
  process.env.HOME || process.env.USERPROFILE,
  '.cursor',
  'projects',
  'home-buildco-camsservicep1',
  'agent-transcripts'
);

let keepMessages = DEFAULT_KEEP;
let keepKb = null;
let dryRun = false;
let noBackup = false;
let targetPath = defaultDir;

// Parse argv
const args = process.argv.slice(2);
for (let i = 0; i < args.length; i++) {
  if (args[i] === '--keep' && args[i + 1] != null) {
    keepMessages = Math.max(1, parseInt(args[++i], 10) || DEFAULT_KEEP);
  } else if (args[i] === '--keep-kb' && args[i + 1] != null) {
    keepKb = Math.max(1, parseFloat(args[++i]) || 0);
  } else if (args[i] === '--dry-run') {
    dryRun = true;
  } else if (args[i] === '--no-backup') {
    noBackup = true;
  } else if (!args[i].startsWith('--')) {
    targetPath = path.resolve(args[i]);
    break;
  }
}

function trimJsonl(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split(/\r?\n/).filter((line) => line.trim().length > 0);
  const total = lines.length;
  if (total <= keepMessages && keepKb == null) return { filePath, total, kept: total, trimmed: false };

  let toKeep;
  if (keepKb != null) {
    const targetBytes = Math.floor(keepKb * 1024);
    let bytes = 0;
    toKeep = [];
    for (let i = lines.length - 1; i >= 0 && bytes < targetBytes; i--) {
      toKeep.unshift(lines[i]);
      bytes += Buffer.byteLength(lines[i], 'utf8') + 1;
    }
  } else {
    toKeep = lines.slice(-keepMessages);
  }
  const kept = toKeep.length;
  const out = toKeep.join('\n') + (toKeep.length ? '\n' : '');
  return { filePath, total, kept, trimmed: true, out };
}

function parseTxtTurns(content) {
  const normalised = content.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  const segments = normalised.split(/\n(?=(?:user|assistant):\s*$)/m);
  const turns = [];
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

function formatTxtTurns(turns) {
  return turns
    .map((t) => `${t.role}:\n${t.text}`)
    .join('\n\n');
}

function trimTxt(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const turns = parseTxtTurns(content);
  const total = turns.length;
  if (total <= keepMessages && keepKb == null) return { filePath, total, kept: total, trimmed: false };

  let toKeep;
  if (keepKb != null) {
    const targetBytes = Math.floor(keepKb * 1024);
    let bytes = 0;
    toKeep = [];
    for (let i = turns.length - 1; i >= 0 && bytes < targetBytes; i--) {
      toKeep.unshift(turns[i]);
      const block = `${turns[i].role}:\n${turns[i].text}`;
      bytes += Buffer.byteLength(block, 'utf8') + 2;
    }
  } else {
    toKeep = turns.slice(-keepMessages);
  }
  const kept = toKeep.length;
  const out = formatTxtTurns(toKeep);
  return { filePath, total, kept, trimmed: true, out };
}

function collectFiles(dir) {
  const files = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isFile() && (e.name.endsWith('.jsonl') || (e.name.endsWith('.txt') && /^[0-9a-f-]{36}\.txt$/i.test(e.name)))) {
      files.push(full);
    } else if (e.isDirectory() && /^[0-9a-f-]{36}$/i.test(e.name)) {
      const jsonl = path.join(full, `${e.name}.jsonl`);
      if (fs.existsSync(jsonl)) files.push(jsonl);
    }
  }
  return files;
}

function trimOne(filePath) {
  const ext = path.extname(filePath);
  if (ext === '.jsonl') return trimJsonl(filePath);
  if (ext === '.txt') return trimTxt(filePath);
  return null;
}

function main() {
  const isDir = fs.existsSync(targetPath) && fs.statSync(targetPath).isDirectory();
  const files = isDir ? collectFiles(targetPath) : [targetPath];

  if (files.length === 0) {
    console.log('No transcript files found.');
    return;
  }

  const mode = keepKb != null ? `last ${keepKb} KB` : `last ${keepMessages} messages`;
  console.log(`Trim mode: keep ${mode}${dryRun ? ' (dry run)' : ''}`);
  console.log('');

  let trimmedCount = 0;
  let totalBefore = 0;
  let totalAfter = 0;

  for (const filePath of files) {
    if (!fs.existsSync(filePath)) continue;
    const result = trimOne(filePath);
    if (!result) continue;

    totalBefore += result.total;
    totalAfter += result.kept;

    if (result.trimmed) {
      trimmedCount++;
      const rel = path.relative(process.cwd(), filePath);
      console.log(`  ${rel}: ${result.total} → ${result.kept} messages`);
      if (!dryRun) {
        if (!noBackup) {
          fs.copyFileSync(filePath, filePath + '.before-trim');
        }
        fs.writeFileSync(filePath, result.out, 'utf8');
      }
    }
  }

  console.log('');
  if (trimmedCount === 0) {
    console.log('No files needed trimming.');
    return;
  }
  console.log(`Trimmed ${trimmedCount} file(s). Total messages: ${totalBefore} → ${totalAfter}`);
  if (!dryRun && !noBackup) {
    console.log('Backups saved as <file>.before-trim. Remove them after verifying.');
  }
  if (dryRun) {
    console.log('Run without --dry-run to apply changes.');
  }
}

main();
