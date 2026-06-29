import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { getStore } from "@netlify/blobs";

const PRODUCTION_STORE_NAME = "world-cup-sweep-league";
const FIXTURES_KEY = "fixtures";

export async function readFixtures() {
  const seedFixtures = await readSeedFixtures();
  const storeName = getFixturesStoreName();
  const store = getStore(storeName);
  const savedFixtures = await store.get(FIXTURES_KEY, { type: "json" });

  if (savedFixtures) {
    return mergeFixtures(seedFixtures, savedFixtures);
  }

  if (storeName !== PRODUCTION_STORE_NAME) {
    const productionFixtures = await getStore(PRODUCTION_STORE_NAME).get(FIXTURES_KEY, { type: "json" });

    if (productionFixtures) {
      return mergeFixtures(seedFixtures, productionFixtures);
    }
  }

  return seedFixtures;
}

async function readSeedFixtures() {
  const seedPath = join(process.cwd(), "fixtures.json");
  const seedFixtures = await readFile(seedPath, "utf8");
  return JSON.parse(seedFixtures);
}

function mergeFixtures(seedFixtures, savedFixtures) {
  const savedByMatchNumber = new Map(savedFixtures.map((fixture) => [fixture.MatchNumber, fixture]));
  const seedMatchNumbers = new Set(seedFixtures.map((fixture) => fixture.MatchNumber));
  const mergedFixtures = seedFixtures.map((fixture) => {
    const savedFixture = savedByMatchNumber.get(fixture.MatchNumber);

    if (!savedFixture || !hasResult(savedFixture)) {
      return fixture;
    }

    return {
      ...fixture,
      HomeTeamScore: savedFixture.HomeTeamScore,
      AwayTeamScore: savedFixture.AwayTeamScore,
      Winner: savedFixture.Winner,
    };
  });
  const savedOnlyResults = savedFixtures.filter(
    (fixture) => !seedMatchNumbers.has(fixture.MatchNumber) && hasResult(fixture),
  );

  return [...mergedFixtures, ...savedOnlyResults];
}

function hasResult(fixture) {
  return fixture.HomeTeamScore !== null && fixture.AwayTeamScore !== null;
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

  if (isProductionRuntime()) {
    return PRODUCTION_STORE_NAME;
  }

  return `${PRODUCTION_STORE_NAME}-${process.env.CONTEXT || "local"}`;
}

function isProductionRuntime() {
  if (process.env.CONTEXT !== "production") {
    return false;
  }

  if (!process.env.URL || !process.env.DEPLOY_PRIME_URL) {
    return true;
  }

  return process.env.DEPLOY_PRIME_URL === process.env.URL;
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
