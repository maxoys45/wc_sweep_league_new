import { readFile } from "node:fs/promises";
import { getStore } from "@netlify/blobs";

const STORE_NAME = "world-cup-sweep-league";
const FIXTURES_KEY = "fixtures";

export async function readFixtures() {
  const store = getStore(STORE_NAME);
  const savedFixtures = await store.get(FIXTURES_KEY, { type: "json" });

  if (savedFixtures) {
    return savedFixtures;
  }

  const seedPath = new URL("../../fixtures.json", import.meta.url);
  const seedFixtures = await readFile(seedPath, "utf8");
  return JSON.parse(seedFixtures);
}

export async function writeFixtures(fixtures) {
  const store = getStore(STORE_NAME);
  await store.set(FIXTURES_KEY, JSON.stringify(fixtures), {
    contentType: "application/json",
  });
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
