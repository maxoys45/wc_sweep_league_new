import { useEffect, useMemo, useState } from "react";
import players from "../../players.json";
import { getFixtures } from "../api.js";
import { buildLeaderboard } from "../league.js";

const teamColours = {
  Algeria: ["#006233", "#ffffff", "#d21034"],
  Argentina: ["#75aadb", "#ffffff"],
  Australia: ["#00843d", "#ffcd00"],
  Austria: ["#ed2939", "#ffffff"],
  Belgium: ["#000000", "#ffd90c", "#ef3340"],
  "Bosnia and Herzegovina": ["#002395", "#fecb00"],
  Brazil: ["#009739", "#fedd00"],
  Canada: ["#ff0000", "#ffffff"],
  Colombia: ["#fcd116", "#003893", "#ce1126"],
  Croatia: ["#ff0000", "#ffffff", "#171796"],
  Czechia: ["#11457e", "#ffffff", "#d7141a"],
  "Côte d'Ivoire": ["#f77f00", "#ffffff", "#009e60"],
  "DR Congo": ["#007fff", "#f7d618", "#ce1021"],
  Ecuador: ["#ffdd00", "#034ea2", "#ed1c24"],
  Egypt: ["#ce1126", "#ffffff", "#000000"],
  England: ["#ffffff", "#ce1126"],
  France: ["#0055a4", "#ffffff", "#ef4135"],
  Germany: ["#000000", "#dd0000", "#ffce00"],
  "IR Iran": ["#239f40", "#ffffff", "#da0000"],
  Iraq: ["#ce1126", "#ffffff", "#000000"],
  Japan: ["#ffffff", "#bc002d"],
  "Korea Republic": ["#ffffff", "#c60c30", "#003478"],
  Mexico: ["#006847", "#ffffff", "#ce1126"],
  Morocco: ["#c1272d", "#006233"],
  Netherlands: ["#ae1c28", "#ffffff", "#21468b"],
  Norway: ["#ba0c2f", "#ffffff", "#00205b"],
  Panama: ["#ffffff", "#005293", "#d21034"],
  Paraguay: ["#d52b1e", "#ffffff", "#0038a8"],
  Portugal: ["#006600", "#ff0000"],
  Qatar: ["#8a1538", "#ffffff"],
  "Saudi Arabia": ["#006c35", "#ffffff"],
  Scotland: ["#005eb8", "#ffffff"],
  Senegal: ["#00853f", "#fdef42", "#e31b23"],
  "South Africa": ["#007a4d", "#ffb612", "#de3831", "#002395"],
  Spain: ["#aa151b", "#f1bf00"],
  Sweden: ["#006aa7", "#fecc00"],
  Switzerland: ["#ff0000", "#ffffff"],
  Tunisia: ["#e70013", "#ffffff"],
  Türkiye: ["#e30a17", "#ffffff"],
  Uruguay: ["#ffffff", "#0038a8"],
  USA: ["#3c3b6e", "#b22234"],
  Uzbekistan: ["#1eb8e7", "#ffffff"],
};

export default function LeaderboardPage() {
  const [fixtures, setFixtures] = useState([]);
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState("");
  const [selectedPlayer, setSelectedPlayer] = useState(null);

  useEffect(() => {
    getFixtures()
      .then((nextFixtures) => {
        setFixtures(nextFixtures);
        setStatus("ready");
      })
      .catch((nextError) => {
        setError(nextError.message);
        setStatus("error");
      });
  }, []);

  const leaderboard = useMemo(() => buildLeaderboard(players, fixtures), [fixtures]);
  const teamRecords = useMemo(() => buildTeamRecords(fixtures), [fixtures]);
  const completedFixtures = fixtures.filter(
    (fixture) => fixture.HomeTeamScore !== null && fixture.AwayTeamScore !== null,
  ).length;

  if (status === "loading") {
    return <p className="panel">Loading leaderboard...</p>;
  }

  if (status === "error") {
    return <p className="panel error">Could not load fixtures: {error}</p>;
  }

  return (
    <section className="stack">
      <div className="hero">
        <div>
          <p className="eyebrow">Leaderboard</p>
          <h2>Current standings</h2>
          <p>
            Points are awarded to each player&apos;s assigned teams: 3 for a win, 1 for a draw and 0 for a
            loss. Ties are decided by total goal difference. For more info, <a target="_blank" href="https://www.youtube.com/watch?v=RBQ7MLElimo">click here</a>.
          </p>
        </div>
        <div className="stat-card">
          <span>{completedFixtures}</span>
          <small>completed fixtures</small>
        </div>
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Rank</th>
              <th>Player</th>
              <th>Pts</th>
              <th>GD</th>
              <th className="optional-col">Played</th>
              <th className="optional-col">W</th>
              <th className="optional-col">D</th>
              <th className="optional-col">L</th>
              <th>Teams</th>
            </tr>
          </thead>
          <tbody>
            {leaderboard.map((row, index) => (
              <tr key={row.player}>
                <td className="rank-cell">{formatRank(index, leaderboard.length)}</td>
                <td className="strong">{row.player}</td>
                <td className="points">{row.points}</td>
                <td>{formatGoalDifference(row.goalDifference)}</td>
                <td className="optional-col">{row.played}</td>
                <td className="optional-col">{row.wins}</td>
                <td className="optional-col">{row.draws}</td>
                <td className="optional-col">{row.losses}</td>
                <td className="teams-cell">
                  <div className="chips">
                    {row.teams.map((team) => (
                      <TeamChip key={team} team={team} record={teamRecords[team]} />
                    ))}
                  </div>
                  <button className="teams-button" type="button" onClick={() => setSelectedPlayer(row)}>
                    Teams
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedPlayer ? (
        <div className="modal-backdrop" role="presentation" onClick={() => setSelectedPlayer(null)}>
          <section
            className="team-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="team-modal-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="modal-header">
              <div>
                <p className="eyebrow">Assigned Teams</p>
                <h3 id="team-modal-title">{selectedPlayer.player}</h3>
              </div>
              <button type="button" onClick={() => setSelectedPlayer(null)} aria-label="Close teams popup">
                Close
              </button>
            </div>
            <div className="chips modal-chips">
              {selectedPlayer.teams.map((team) => (
                <TeamChip key={team} team={team} record={teamRecords[team]} />
              ))}
            </div>
          </section>
        </div>
      ) : null}
    </section>
  );
}

function TeamChip({ team, record }) {
  const teamRecord = record || { wins: 0, draws: 0, losses: 0 };
  const tooltip = `${teamRecord.wins}W ${teamRecord.draws}D ${teamRecord.losses}L`;

  return (
    <span
      className="team-chip"
      style={getTeamColourStyle(team)}
      tabIndex="0"
      aria-label={tooltip}
      data-tooltip={tooltip}
    >
      {team}
    </span>
  );
}

function formatGoalDifference(goalDifference) {
  return goalDifference > 0 ? `+${goalDifference}` : goalDifference;
}

function formatRank(index, totalRows) {
  const medals = ["🥇", "🥈", "🥉"];

  if (index === totalRows - 1) {
    return "💩";
  }

  return medals[index] || index + 1;
}

function getTeamColourStyle(team) {
  const colours = teamColours[team] || ["#eef4ff", "#174ea6"];

  return {
    "--team-stripe": buildTeamStripe(colours),
  };
}

function buildTeamStripe(colours) {
  const segmentSize = 100 / colours.length;
  const stops = colours.flatMap((colour, index) => {
    const start = index * segmentSize;
    const end = (index + 1) * segmentSize;

    return [`${colour} ${start}%`, `${colour} ${end}%`];
  });

  return `linear-gradient(90deg, ${stops.join(", ")})`;
}

function buildTeamRecords(fixtures) {
  const records = {};

  fixtures.forEach((fixture) => {
    if (fixture.HomeTeamScore === null || fixture.AwayTeamScore === null) {
      return;
    }

    addTeamRecord(records, fixture.HomeTeam, fixture.HomeTeamScore, fixture.AwayTeamScore);
    addTeamRecord(records, fixture.AwayTeam, fixture.AwayTeamScore, fixture.HomeTeamScore);
  });

  return records;
}

function addTeamRecord(records, team, teamScore, opponentScore) {
  records[team] ||= { wins: 0, draws: 0, losses: 0 };

  if (teamScore > opponentScore) {
    records[team].wins += 1;
    return;
  }

  if (teamScore === opponentScore) {
    records[team].draws += 1;
    return;
  }

  records[team].losses += 1;
}
