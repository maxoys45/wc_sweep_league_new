import { useEffect, useMemo, useState } from "react";
import { getFixtures, updateResult } from "../api.js";

export default function ResultsPage() {
  const [fixtures, setFixtures] = useState([]);
  const [scores, setScores] = useState({});
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState("loading");
  const [message, setMessage] = useState("");
  const [savingMatch, setSavingMatch] = useState(null);

  useEffect(() => {
    getFixtures()
      .then((nextFixtures) => {
        setFixtures(nextFixtures);
        setScores(buildScoreState(nextFixtures));
        setStatus("ready");
      })
      .catch((error) => {
        setMessage(error.message);
        setStatus("error");
      });
  }, []);

  const sortedFixtures = useMemo(
    () =>
      [...fixtures].sort((a, b) => {
        const dateSort = new Date(a.DateUtc).getTime() - new Date(b.DateUtc).getTime();
        return dateSort || a.MatchNumber - b.MatchNumber;
      }),
    [fixtures],
  );

  function updateLocalScore(matchNumber, field, value) {
    setScores((currentScores) => ({
      ...currentScores,
      [matchNumber]: {
        ...currentScores[matchNumber],
        [field]: value,
      },
    }));
  }

  async function saveResult(event, fixture) {
    event.preventDefault();
    setMessage("");

    const score = scores[fixture.MatchNumber];

    try {
      setSavingMatch(fixture.MatchNumber);
      const result = await updateResult({
        matchNumber: fixture.MatchNumber,
        homeTeamScore: score.home,
        awayTeamScore: score.away,
        password,
        fixtures,
      });

      setFixtures((currentFixtures) => replaceFixture(currentFixtures, result.fixture));
      setScores((currentScores) => ({
        ...currentScores,
        [fixture.MatchNumber]: {
          home: result.fixture.HomeTeamScore ?? "",
          away: result.fixture.AwayTeamScore ?? "",
        },
      }));
      setMessage(`Saved ${fixture.HomeTeam} vs ${fixture.AwayTeam}.`);
    } catch (error) {
      setMessage(error.message);
    } finally {
      setSavingMatch(null);
    }
  }

  if (status === "loading") {
    return <p className="panel">Loading fixtures...</p>;
  }

  if (status === "error") {
    return <p className="panel error">Could not load fixtures: {message}</p>;
  }

  return (
    <section className="stack">
      <div className="hero">
        <div>
          <p className="eyebrow">Results</p>
          <h2>Enter match scores</h2>
          <p>Enter both scores to save a result. Clear both scores and save to reset a fixture.</p>
        </div>
        <label className="password-card">
          Results password
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Enter password"
            autoComplete="current-password"
          />
        </label>
      </div>

      {message ? <p className={message.startsWith("Saved") ? "panel success" : "panel error"}>{message}</p> : null}

      <div className="fixture-list">
        {sortedFixtures.map((fixture) => {
          const score = scores[fixture.MatchNumber] || { home: "", away: "" };
          const isSaving = savingMatch === fixture.MatchNumber;

          return (
            <form className="fixture-card" key={fixture.MatchNumber} onSubmit={(event) => saveResult(event, fixture)}>
              <div className="fixture-meta">
                <span>Match {fixture.MatchNumber}</span>
                <span>{fixture.Group}</span>
                <span>{formatFixtureDate(fixture.DateUtc)}</span>
              </div>
              <div className="score-row">
                <label>
                  <span>{fixture.HomeTeam}</span>
                  <input
                    type="number"
                    min="0"
                    inputMode="numeric"
                    value={score.home}
                    onChange={(event) => updateLocalScore(fixture.MatchNumber, "home", event.target.value)}
                    aria-label={`${fixture.HomeTeam} score`}
                  />
                </label>
                <span className="versus">vs</span>
                <label>
                  <span>{fixture.AwayTeam}</span>
                  <input
                    type="number"
                    min="0"
                    inputMode="numeric"
                    value={score.away}
                    onChange={(event) => updateLocalScore(fixture.MatchNumber, "away", event.target.value)}
                    aria-label={`${fixture.AwayTeam} score`}
                  />
                </label>
              </div>
              <div className="fixture-actions">
                <span>{fixture.Winner ? `Winner: ${fixture.Winner}` : "No result yet"}</span>
                <button type="submit" disabled={isSaving || !password}>
                  {isSaving ? "Saving..." : "Save score"}
                </button>
              </div>
            </form>
          );
        })}
      </div>
    </section>
  );
}

function buildScoreState(fixtures) {
  return Object.fromEntries(
    fixtures.map((fixture) => [
      fixture.MatchNumber,
      {
        home: fixture.HomeTeamScore ?? "",
        away: fixture.AwayTeamScore ?? "",
      },
    ]),
  );
}

function replaceFixture(fixtures, nextFixture) {
  return fixtures.map((fixture) => (fixture.MatchNumber === nextFixture.MatchNumber ? nextFixture : fixture));
}

function formatFixtureDate(dateUtc) {
  return new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(dateUtc));
}
