import seedFixtures from "../fixtures.json";

export async function getFixtures() {
  try {
    const response = await fetch("/.netlify/functions/get-fixtures");

    if (!response.ok) {
      throw new Error("Fixture API unavailable");
    }

    return await response.json();
  } catch (error) {
    if (import.meta.env.DEV) {
      return seedFixtures;
    }

    throw error;
  }
}

export async function updateResult({ matchNumber, homeTeamScore, awayTeamScore, password }) {
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
    }),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || "Unable to update result");
  }

  return data;
}
