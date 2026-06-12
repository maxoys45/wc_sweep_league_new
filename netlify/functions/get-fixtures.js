import { jsonResponse, readFixtures } from "./_fixtures.js";

export default async function getFixtures() {
  try {
    const fixtures = await readFixtures();
    return jsonResponse(fixtures);
  } catch (error) {
    return jsonResponse({ error: error.message || "Unable to load fixtures" }, { status: 500 });
  }
}

export const config = {
  path: "/.netlify/functions/get-fixtures",
};
