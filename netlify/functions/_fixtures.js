import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { getStore } from "@netlify/blobs";

const PRODUCTION_STORE_NAME = "world-cup-sweep-league";
const FIXTURES_KEY = "fixtures";

export async function readFixtures() {
  const store = getStore(getFixturesStoreName());
  const savedFixtures = await store.get(FIXTURES_KEY, { type: "json" });

  if (savedFixtures) {
    return savedFixtures;
  }

  const seedPath = join(process.cwd(), "fixtures.json");
  const seedFixtures = await readFile(seedPath, "utf8");
  return JSON.parse(seedFixtures);
}

export async function writeFixtures(fixtures) {
  const store = getStore(getFixturesStoreName());
  await store.set(FIXTURES_KEY, JSON.stringify(fixtures), {
    contentType: "application/json",
  });
}

function getFixturesStoreName() {
  if (process.env.FIXTURES_STORE_NAME) {
    return process.env.FIXTURES_STORE_NAME;
  }

  if (process.env.CONTEXT === "production") {
    return PRODUCTION_STORE_NAME;
  }

  return `${PRODUCTION_STORE_NAME}-${process.env.CONTEXT || "local"}`;
}

export function jsonResponse(body, init = {}) {
  return new Response(JSON.stringify(body), {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...init.headers,
    },
  });
}
