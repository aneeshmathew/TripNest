// Diagnostic: shows, for every Trip-inspiration activity card (and optionally
// every destination), which Pixabay queries are tried, the best-scoring
// candidates with their tags, and which photo would be chosen.
//
// Run from the frontend repo root (the key is read from the environment and
// is never written anywhere):
//
//   PIXABAY_API_KEY=your-key npx tsx scripts/pixabay-debug.ts
//   PIXABAY_API_KEY=your-key npx tsx scripts/pixabay-debug.ts destinations
//
// Paste the output back when a card still shows the wrong photo.

import { activityHighlights } from "../src/data/activityHighlights";
import { natGeoDestinations } from "../src/data/natGeoDestinations";
import {
  activityPhotoQuery,
  fetchHits,
  pickBestPhoto,
  scorePhoto,
  searchLadder,
  type PhotoQuery
} from "../src/lib/pixabay";

async function explain(label: string, query: PhotoQuery, apiKey: string) {
  console.log(`\n=== ${label}`);
  for (const [i, step] of [query, ...(query.alternates ?? [])].entries()) {
    for (const q of searchLadder(step)) {
      const hits = await fetchHits(apiKey, q);
      if (hits === null) {
        console.log(`  [step ${i}] "${q}" -> request failed (rate limit or network)`);
        return;
      }
      const scored = hits
        .map((h) => ({ h, s: scorePhoto(h, step) }))
        .filter((x) => x.s >= 0)
        .sort((a, b) => b.s - a.s);
      console.log(`  [step ${i}] "${q}" -> ${hits.length} results, ${scored.length} acceptable`);
      for (const { h, s } of scored.slice(0, 3)) {
        console.log(`      ${s.toFixed(1)}  id=${h.id}  tags: ${h.tags}  ${h.pageURL ?? ""}`);
      }
      if (scored.length === 0) {
        for (const h of hits.slice(0, 3)) console.log(`      (rejected) tags: ${h.tags}`);
      }
      const best = pickBestPhoto(hits, step);
      if (best) {
        console.log(`  => CHOSEN id=${best.id} (${best.pageURL ?? ""})`);
        return;
      }
    }
  }
  console.log("  => no acceptable photo: the curated image is used");
}

async function main() {
  const apiKey = process.env.PIXABAY_API_KEY;
  if (!apiKey) throw new Error("Set PIXABAY_API_KEY in the environment.");

  if (process.argv[2] === "destinations") {
    for (const d of natGeoDestinations) {
      await explain(`${d.name} (${d.location})`, { subject: d.name, region: d.location }, apiKey);
    }
  } else {
    for (const h of activityHighlights) {
      await explain(`${h.activity}: "${h.title}" @ ${h.location}`, activityPhotoQuery(h), apiKey);
    }
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});