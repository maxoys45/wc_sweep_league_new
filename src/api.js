import seedFixtures from "../fixtures.json";
import { getWinner, normaliseScore } from "./league.js";

const LOCAL_FIXTURES_KEY = "world-cup-sweep-league-fixtures";

export async function getFixtures() {
  if (import.meta.env.DEV) {
    return getLocalFixtures();
  }

  try {
    const response = await fetch("/.netlify/functions/get-fixtures");

    if (!response.ok) {
      throw new Error("Fixture API unavailable");
    }

    return await response.json();
  } catch (error) {
    throw error;
  }
}

export async function updateResult({ matchNumber, homeTeamScore, awayTeamScore, password, fixtures }) {
  if (import.meta.env.DEV) {
    return updateLocalResult({ matchNumber, homeTeamScore, awayTeamScore, fixtures });
  }

  const response = await fetch("/.netlify/functions/update-result", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      matchNumber,
      homeTeamScore,
      awayTeamScore,
      password,
      fixtures,
    }),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || "Unable to update result");
  }

  return data;
}

function getLocalFixtures() {
  const savedFixtures = localStorage.getItem(LOCAL_FIXTURES_KEY);

  if (!savedFixtures) {
    return seedFixtures;
  }

  try {
    return JSON.parse(savedFixtures);
  } catch {
    localStorage.removeItem(LOCAL_FIXTURES_KEY);
    return seedFixtures;
  }
}

function updateLocalResult({ matchNumber, homeTeamScore, awayTeamScore, fixtures }) {
  const nextFixtures = fixtures.length ? fixtures : getLocalFixtures();
  const fixtureIndex = nextFixtures.findIndex((fixture) => fixture.MatchNumber === matchNumber);

  if (fixtureIndex === -1) {
    throw new Error("Fixture not found");
  }

  const hasHomeScore = homeTeamScore !== "" && homeTeamScore !== null && homeTeamScore !== undefined;
  const hasAwayScore = awayTeamScore !== "" && awayTeamScore !== null && awayTeamScore !== undefined;
  const nextHomeScore = normaliseScore(homeTeamScore);
  const nextAwayScore = normaliseScore(awayTeamScore);

  if (hasHomeScore !== hasAwayScore) {
    throw new Error("Enter both scores, or clear both scores to reset the fixture");
  }

  if ((hasHomeScore && nextHomeScore === null) || (hasAwayScore && nextAwayScore === null)) {
    throw new Error("Scores must be whole numbers greater than or equal to 0");
  }

  const fixture = nextFixtures[fixtureIndex];
  const nextFixture = {
    ...fixture,
    HomeTeamScore: hasHomeScore ? nextHomeScore : null,
    AwayTeamScore: hasAwayScore ? nextAwayScore : null,
    Winner: hasHomeScore ? getWinner(fixture.HomeTeam, fixture.AwayTeam, nextHomeScore, nextAwayScore) : "",
  };
  const updatedFixtures = nextFixtures.map((currentFixture) =>
    currentFixture.MatchNumber === matchNumber ? nextFixture : currentFixture,
  );

  localStorage.setItem(LOCAL_FIXTURES_KEY, JSON.stringify(updatedFixtures));

  return {
    fixture: nextFixture,
    fixtures: updatedFixtures,
  };
}
