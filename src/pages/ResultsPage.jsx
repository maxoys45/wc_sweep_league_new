import { useEffect, useMemo, useState } from "react";
import { getFixtures, updateResult } from "../api.js";

const REMEMBERED_PASSWORD_KEY = "world-cup-sweep-league-results-password";

export default function ResultsPage() {
  const [fixtures, setFixtures] = useState([]);
  const [scores, setScores] = useState({});
  const [password, setPassword] = useState(() => localStorage.getItem(REMEMBERED_PASSWORD_KEY) || "");
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

  const upcomingFixtures = useMemo(() => fixtures.filter((fixture) => !hasResult(fixture)), [fixtures]);
  const pastFixtures = useMemo(() => fixtures.filter((fixture) => hasResult(fixture)).reverse(), [fixtures]);
  const roundEightMatchNumbers = useMemo(() => getRoundEightMatchNumbers(fixtures), [fixtures]);

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
        penaltyWinner: score.penaltyWinner,
        password,
        fixtures,
      });

      setFixtures((currentFixtures) => replaceFixture(currentFixtures, result.fixture));
      setScores((currentScores) => ({
        ...currentScores,
        [fixture.MatchNumber]: {
          home: result.fixture.HomeTeamScore ?? "",
          away: result.fixture.AwayTeamScore ?? "",
          penaltyWinner: result.fixture.PenaltyWinner ?? "",
        },
      }));
      localStorage.setItem(REMEMBERED_PASSWORD_KEY, password);
      setMessage(`Saved ${fixture.HomeTeam} vs ${fixture.AwayTeam}.`);
    } catch (error) {
      if (error.message === "Incorrect password") {
        localStorage.removeItem(REMEMBERED_PASSWORD_KEY);
      }

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
          <a className="jump-link" href="#past-results">
            Jump to past results
          </a>
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

      <FixtureSection
        title="Upcoming Matches"
        description={`${upcomingFixtures.length} fixtures still need a result.`}
        fixtures={upcomingFixtures}
        scores={scores}
        savingMatch={savingMatch}
        password={password}
        onSave={saveResult}
        onScoreChange={updateLocalScore}
        emptyMessage="All fixtures currently have saved results."
        variant="upcoming"
        roundEightMatchNumbers={roundEightMatchNumbers}
      />

      <FixtureSection
        id="past-results"
        title="Past Results"
        description={`${pastFixtures.length} fixtures have saved scores.`}
        fixtures={pastFixtures}
        scores={scores}
        savingMatch={savingMatch}
        password={password}
        onSave={saveResult}
        onScoreChange={updateLocalScore}
        emptyMessage="No results have been saved yet."
        variant="past"
        roundEightMatchNumbers={roundEightMatchNumbers}
      />
    </section>
  );
}

function FixtureSection({
  id,
  title,
  description,
  fixtures,
  scores,
  savingMatch,
  password,
  onSave,
  onScoreChange,
  emptyMessage,
  variant,
  roundEightMatchNumbers,
}) {
  const isPastSection = variant === "past";

  return (
    <section className="fixture-section" id={id}>
      <div className="section-heading">
        <div>
          <p className="eyebrow">Fixtures</p>
          <h3>{title}</h3>
        </div>
        <span>{description}</span>
      </div>

      {fixtures.length ? (
        <div className="fixture-list">
          {fixtures.map((fixture) => {
            const score = scores[fixture.MatchNumber] || { home: "", away: "", penaltyWinner: "" };
            const isSaving = savingMatch === fixture.MatchNumber;
            const canUsePenalties = fixture.RoundNumber > 3 && isDrawScore(score);

            return (
              <form
                className={isPastSection ? "fixture-card fixture-card-completed" : "fixture-card"}
                key={fixture.MatchNumber}
                onSubmit={(event) => onSave(event, fixture)}
              >
                <div className="fixture-meta">
                  <div className="fixture-meta-primary">
                    <span className="meta-pill meta-pill-match">Match {fixture.MatchNumber}</span>
                    <span className="meta-pill meta-pill-round">{getRoundLabel(fixture, roundEightMatchNumbers)}</span>
                  </div>
                  <div className="fixture-meta-secondary">
                    {fixture.Group ? <span>{fixture.Group}</span> : null}
                    <span>{formatFixtureDate(fixture.DateUtc)}</span>
                  </div>
                </div>
                <div className="score-row">
                  <label>
                    <span>{fixture.HomeTeam}</span>
                    <input
                      type="number"
                      min="0"
                      inputMode="numeric"
                      value={score.home}
                      onChange={(event) => onScoreChange(fixture.MatchNumber, "home", event.target.value)}
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
                      onChange={(event) => onScoreChange(fixture.MatchNumber, "away", event.target.value)}
                      aria-label={`${fixture.AwayTeam} score`}
                    />
                  </label>
                </div>
                <div className="fixture-actions">
                  <div className="fixture-result-controls">
                    {fixture.RoundNumber > 3 ? (
                      <label className="penalty-select">
                        Penalties
                        <select
                          value={score.penaltyWinner ?? ""}
                          onChange={(event) => onScoreChange(fixture.MatchNumber, "penaltyWinner", event.target.value)}
                          disabled={!canUsePenalties}
                          aria-label={`${fixture.HomeTeam} vs ${fixture.AwayTeam} penalty winner`}
                        >
                          <option value="">No penalties</option>
                          <option value="Home">{fixture.HomeTeam}</option>
                          <option value="Away">{fixture.AwayTeam}</option>
                        </select>
                      </label>
                    ) : null}
                    <span>{formatWinnerLabel(fixture)}</span>
                  </div>
                  <button type="submit" disabled={isSaving || !password}>
                    {isSaving ? "Saving..." : isPastSection ? "Update score" : "Save score"}
                  </button>
                </div>
              </form>
            );
          })}
        </div>
      ) : (
        <p className="panel">{emptyMessage}</p>
      )}
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
        penaltyWinner: fixture.PenaltyWinner ?? "",
      },
    ]),
  );
}

function replaceFixture(fixtures, nextFixture) {
  return fixtures.map((fixture) => (fixture.MatchNumber === nextFixture.MatchNumber ? nextFixture : fixture));
}

function hasResult(fixture) {
  return fixture.HomeTeamScore !== null && fixture.AwayTeamScore !== null;
}

function isDrawScore(score) {
  return score.home !== "" && score.away !== "" && Number(score.home) === Number(score.away);
}

function formatWinnerLabel(fixture) {
  if (!fixture.Winner) {
    return "No result yet";
  }

  if (fixture.PenaltyWinner) {
    return `Winner: ${fixture.Winner} (pens)`;
  }

  return `Winner: ${fixture.Winner}`;
}

function getRoundEightMatchNumbers(fixtures) {
  return fixtures
    .filter((fixture) => fixture.RoundNumber === 8)
    .sort((a, b) => {
      const dateSort = new Date(a.DateUtc).getTime() - new Date(b.DateUtc).getTime();
      return dateSort || a.MatchNumber - b.MatchNumber;
    })
    .map((fixture) => fixture.MatchNumber);
}

function getRoundLabel(fixture, roundEightMatchNumbers) {
  if (fixture.RoundNumber >= 1 && fixture.RoundNumber <= 3) {
    return "Group Stage";
  }

  if (fixture.RoundNumber === 4) {
    return "Round of 32";
  }

  if (fixture.RoundNumber === 5) {
    return "Round of 16";
  }

  if (fixture.RoundNumber === 6) {
    return "Quarter Finals";
  }

  if (fixture.RoundNumber === 7) {
    return "Semi Finals";
  }

  if (fixture.RoundNumber === 8) {
    return roundEightMatchNumbers[0] === fixture.MatchNumber ? "Third Place Play-off" : "Final";
  }

  return `Round ${fixture.RoundNumber}`;
}

function formatFixtureDate(dateUtc) {
  return new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(dateUtc));
}
