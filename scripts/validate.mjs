#!/usr/bin/env node
/**
 * Self-contained validator for content/ and audit/.
 *
 * Checks:
 *   1. Every content/*.md parses with valid frontmatter (guideline or chapter schema).
 *   2. Each guideline body has the required sections in the required order.
 *   3. `forterApplies` agrees with the presence/absence of the "How Forter helps" section.
 *   4. Every audit/m{M}-{N}.md parses with valid rubric frontmatter.
 *   5. Each audit rubric matches its content guideline on id, complexity, impact, visualChange.
 *   6. Cross-references of the form (./mX-Y-*.md) resolve to existing files.
 *
 * Exits 1 on any failure; 0 on success.
 */

import { readdirSync, readFileSync, existsSync } from "node:fs";
import { join, dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import matter from "gray-matter";
import { z } from "zod";

const REPO = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const CONTENT = join(REPO, "content");
const AUDIT = join(REPO, "audit");

const MODULE_SLUGS = ["discoverable", "comprehensible", "trustworthy", "actionable", "experiential"];

const oneToFive = z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4), z.literal(5)]);

const guidelineFm = z.object({
  id: z.string().regex(/^m[1-5]-\d+-[a-z0-9-]+$/, "id must be slug like 'm4-1-openapi-spec'"),
  module: z.enum(MODULE_SLUGS),
  moduleNumber: oneToFive,
  guidelineNumber: z.number().int().positive(),
  title: z.string().min(1),
  complexity: oneToFive,
  impact: oneToFive,
  visualChange: z.enum(["none", "low", "medium", "high"]).optional(),
  forterApplies: z.enum(["no", "partial", "yes", "flagship"]),
});

const chapterFm = z.object({
  id: z.string(),
  title: z.string(),
  kind: z.enum(["front-matter", "chapter", "module-overview", "appendix"]),
  moduleNumber: z.number().optional(),
});

const auditFm = z.object({
  id: z.string().regex(/^m[1-5]-\d+$/, "id must be like 'm4-1'"),
  title: z.string().min(1),
  complexity: oneToFive,
  impact: oneToFive,
  visualChange: z.enum(["none", "low", "medium", "high"]).optional(),
  weight_total: z.number().int().positive(),
});

const REQUIRED_GUIDELINE_SECTIONS = ["What & why", "Scoring", "Steps", "References"];

let errors = 0;
let warnings = 0;
const fail = (msg) => { errors++; console.error("✗ " + msg); };
const warn = (msg) => { warnings++; console.warn("! " + msg); };
const ok = (msg) => console.log("✓ " + msg);

function listMd(dir) {
  return readdirSync(dir).filter((f) => f.endsWith(".md")).sort().map((f) => join(dir, f));
}

function hasSection(body, label) {
  const re = new RegExp(`^##\\s+${label.replace(/[.*+?^${}()|[\\]\\\\]/g, "\\\\$&")}\\b`, "m");
  return re.test(body);
}

function checkSectionsInOrder(body, labels) {
  const positions = labels.map((l) => {
    const m = body.match(new RegExp(`^##\\s+${l.replace(/[.*+?^${}()|[\\]\\\\]/g, "\\\\$&")}\\b`, "m"));
    return m ? m.index : -1;
  });
  for (let i = 1; i < positions.length; i++) {
    if (positions[i] === -1) continue;
    if (positions[i - 1] === -1) continue;
    if (positions[i] < positions[i - 1]) return false;
  }
  return true;
}

function loadFm(path, schema) {
  const raw = readFileSync(path, "utf8");
  const parsed = matter(raw);
  const result = schema.safeParse(parsed.data);
  return { raw, body: parsed.content, fm: parsed.data, result };
}

// 1+2+3: content/
const contentFiles = listMd(CONTENT);
const guidelines = new Map(); // "M-N" -> { fm, path }
const ids = new Set();

for (const path of contentFiles) {
  const rel = path.replace(REPO + "/", "");
  const { body, fm, result } = (() => {
    try {
      const raw = readFileSync(path, "utf8");
      const parsed = matter(raw);
      const isGuideline = parsed.data && typeof parsed.data === "object" && "guidelineNumber" in parsed.data;
      const schema = isGuideline ? guidelineFm : chapterFm;
      const r = schema.safeParse(parsed.data);
      return { body: parsed.content, fm: parsed.data, result: r };
    } catch (e) {
      fail(`${rel}: failed to parse frontmatter: ${e.message}`);
      return { body: "", fm: null, result: { success: false } };
    }
  })();

  if (!result.success) {
    fail(`${rel}: frontmatter validation failed:\n  ${result.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("\n  ")}`);
    continue;
  }

  if (fm.id) {
    if (ids.has(fm.id)) fail(`${rel}: duplicate id '${fm.id}'`);
    ids.add(fm.id);
  }

  if ("guidelineNumber" in fm) {
    // Guideline: validate body
    const h1 = body.match(/^# (.+)$/m);
    if (!h1) {
      fail(`${rel}: missing H1`);
    }
    for (const section of REQUIRED_GUIDELINE_SECTIONS) {
      if (!hasSection(body, section)) fail(`${rel}: missing required section '## ${section}'`);
    }
    if (!checkSectionsInOrder(body, REQUIRED_GUIDELINE_SECTIONS)) {
      fail(`${rel}: required sections appear out of order`);
    }
    const hasForterSection = hasSection(body, "How Forter helps");
    if (fm.forterApplies !== "no" && !hasForterSection) {
      fail(`${rel}: forterApplies=${fm.forterApplies} but body lacks '## How Forter helps'`);
    }
    if (fm.forterApplies === "no" && hasForterSection) {
      fail(`${rel}: forterApplies=no but body contains '## How Forter helps'`);
    }
    const key = `${fm.moduleNumber}-${fm.guidelineNumber}`;
    guidelines.set(key, { fm, path: rel });
  }
}

ok(`Parsed ${contentFiles.length} content files (${guidelines.size} guidelines)`);

// 4+5: audit/
const auditFiles = listMd(AUDIT).filter((p) => /\/m\d+-\d+\.md$/.test(p));
const auditByKey = new Map();

for (const path of auditFiles) {
  const rel = path.replace(REPO + "/", "");
  let parsed;
  try {
    parsed = matter(readFileSync(path, "utf8"));
  } catch (e) {
    fail(`${rel}: parse error: ${e.message}`);
    continue;
  }
  const r = auditFm.safeParse(parsed.data);
  if (!r.success) {
    fail(`${rel}: audit frontmatter invalid:\n  ${r.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("\n  ")}`);
    continue;
  }
  const key = parsed.data.id.replace(/^m/, "").replace("-", "-"); // already "M-N" minus 'm'
  auditByKey.set(key, { fm: parsed.data, path: rel });

  const body = parsed.content;
  if (!/## Probe/m.test(body)) fail(`${rel}: missing '## Probe' section`);
  if (!/## Rubric/m.test(body)) fail(`${rel}: missing '## Rubric' section`);

  // weight_total must equal the sum of the rubric table row weights (the final integer
  // cell of each data row). Catches drift when sub-checks are added/removed. The Rubric
  // section may contain more than one table (e.g. m4-9 splits ACP and UCP).
  const rubricSection = (() => {
    const start = body.search(/^## Rubric\b/m);
    if (start === -1) return "";
    const rest = body.slice(start + 1);
    const next = rest.search(/^## /m);
    return next === -1 ? body.slice(start) : body.slice(start, start + 1 + next);
  })();
  let rowWeightSum = 0, rowCount = 0;
  for (const line of rubricSection.split("\n")) {
    if (!/^\s*\|/.test(line)) continue;                 // table rows only
    if (/^\s*\|\s*-{2,}/.test(line)) continue;          // separator row
    const cells = line.split("|").map((c) => c.trim()).filter((c) => c !== "");
    if (cells.length < 2) continue;
    const last = cells[cells.length - 1];
    if (!/^\d+$/.test(last)) continue;                  // skips header (…| Weight |) rows
    rowWeightSum += Number(last);
    rowCount++;
  }
  if (rowCount > 0 && rowWeightSum !== parsed.data.weight_total) {
    fail(`${rel}: weight_total=${parsed.data.weight_total} but rubric rows sum to ${rowWeightSum} (${rowCount} scored rows)`);
  }
}

ok(`Parsed ${auditFiles.length} audit rubrics`);

// 5: audit ↔ content alignment
for (const [key, audit] of auditByKey) {
  const guideline = guidelines.get(key);
  if (!guideline) {
    fail(`${audit.path}: no matching content guideline for id=${audit.fm.id}`);
    continue;
  }
  if (audit.fm.complexity !== guideline.fm.complexity) {
    fail(`${audit.path}: complexity=${audit.fm.complexity} but ${guideline.path} has complexity=${guideline.fm.complexity}`);
  }
  if (audit.fm.impact !== guideline.fm.impact) {
    fail(`${audit.path}: impact=${audit.fm.impact} but ${guideline.path} has impact=${guideline.fm.impact}`);
  }
  if (audit.fm.visualChange && guideline.fm.visualChange && audit.fm.visualChange !== guideline.fm.visualChange) {
    fail(`${audit.path}: visualChange=${audit.fm.visualChange} but ${guideline.path} has visualChange=${guideline.fm.visualChange}`);
  }
}
for (const [key, guideline] of guidelines) {
  if (!auditByKey.has(key)) warn(`${guideline.path}: no matching audit rubric at audit/m${key}.md`);
}

// 6: cross-references
const allMdNames = new Set([...contentFiles, ...auditFiles].map((p) => p.split("/").pop()));
const allAuditNames = new Set(auditFiles.map((p) => p.split("/").pop()));
const allContentNames = new Set(contentFiles.map((p) => p.split("/").pop()));

const xrefRe = /\]\((\.\/|\.\.\/(?:content|audit)\/)([\w./-]+\.md)(#[^)]+)?\)/g;
for (const path of [...contentFiles, ...auditFiles]) {
  const rel = path.replace(REPO + "/", "");
  const body = readFileSync(path, "utf8");
  let m;
  while ((m = xrefRe.exec(body)) !== null) {
    const prefix = m[1];
    const target = m[2];
    const sameDir = prefix === "./";
    let exists;
    if (sameDir) {
      exists = path.startsWith(CONTENT) ? allContentNames.has(target) : allAuditNames.has(target);
    } else {
      // ../content/foo.md or ../audit/foo.md
      const targetSet = prefix.includes("content") ? allContentNames : allAuditNames;
      exists = targetSet.has(target);
    }
    if (!exists) fail(`${rel}: dangling cross-reference '${prefix}${target}'`);
  }
}

ok("Cross-references resolved");

console.log("");
if (errors > 0) {
  console.error(`FAILED with ${errors} error(s), ${warnings} warning(s).`);
  process.exit(1);
}
console.log(`All valid. ${warnings} warning(s).`);
