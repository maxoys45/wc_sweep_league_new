import { getWinner, normaliseScore } from "../../src/league.js";
import { jsonResponse, readFixtures, writeFixtures } from "./_fixtures.js";

export default async function updateResult(request) {
  if (request.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, { status: 405 });
  }

  const adminPassword = process.env.RESULTS_PASSWORD;

  if (!adminPassword) {
    return jsonResponse({ error: "Results password is not configured" }, { status: 500 });
  }

  try {
    const body = await request.json();

    if (body.password !== adminPassword) {
      return jsonResponse({ error: "Incorrect password" }, { status: 401 });
    }

    const matchNumber = Number(body.matchNumber);
    const homeTeamScore = normaliseScore(body.homeTeamScore);
    const awayTeamScore = normaliseScore(body.awayTeamScore);
    const hasHomeScore = body.homeTeamScore !== "" && body.homeTeamScore !== null && body.homeTeamScore !== undefined;
    const hasAwayScore = body.awayTeamScore !== "" && body.awayTeamScore !== null && body.awayTeamScore !== undefined;

    if (!Number.isInteger(matchNumber)) {
      return jsonResponse({ error: "Match number is required" }, { status: 400 });
    }

    if (hasHomeScore !== hasAwayScore) {
      return jsonResponse({ error: "Enter both scores, or clear both scores to reset the fixture" }, { status: 400 });
    }

    if ((hasHomeScore && homeTeamScore === null) || (hasAwayScore && awayTeamScore === null)) {
      return jsonResponse({ error: "Scores must be whole numbers greater than or equal to 0" }, { status: 400 });
    }

    const fixtures = await readFixtures();
    const fixtureIndex = fixtures.findIndex((fixture) => fixture.MatchNumber === matchNumber);

    if (fixtureIndex === -1) {
      return jsonResponse({ error: "Fixture not found" }, { status: 404 });
    }

    const fixture = fixtures[fixtureIndex];
    const nextFixture = {
      ...fixture,
      HomeTeamScore: hasHomeScore ? homeTeamScore : null,
      AwayTeamScore: hasAwayScore ? awayTeamScore : null,
      Winner: hasHomeScore ? getWinner(fixture.HomeTeam, fixture.AwayTeam, homeTeamScore, awayTeamScore) : "",
    };
    const nextFixtures = fixtures.map((currentFixture, index) =>
      index === fixtureIndex ? nextFixture : currentFixture,
    );

    await writeFixtures(nextFixtures);

    return jsonResponse({
      fixture: nextFixture,
      fixtures: nextFixtures,
    });
  } catch (error) {
    return jsonResponse({ error: error.message || "Unable to update result" }, { status: 500 });
  }
}

export const config = {
  path: "/.netlify/functions/update-result",
};
