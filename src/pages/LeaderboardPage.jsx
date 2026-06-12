import { useEffect, useMemo, useState } from "react";
import players from "../../players.json";
import { getFixtures } from "../api.js";
import { buildLeaderboard } from "../league.js";

const teamColours = {
  Algeria: ["#006233", "#ffffff"],
  Argentina: ["#75aadb", "#ffffff"],
  Australia: ["#00843d", "#ffcd00"],
  Austria: ["#ed2939", "#ffffff"],
  Belgium: ["#000000", "#ffd90c"],
  "Bosnia and Herzegovina": ["#002395", "#fecb00"],
  Brazil: ["#009739", "#fedd00"],
  Canada: ["#ff0000", "#ffffff"],
  Colombia: ["#fcd116", "#003893"],
  Croatia: ["#ff0000", "#ffffff"],
  Czechia: ["#11457e", "#ffffff"],
  "Côte d'Ivoire": ["#f77f00", "#ffffff"],
  "DR Congo": ["#007fff", "#f7d618"],
  Ecuador: ["#ffdd00", "#034ea2"],
  Egypt: ["#ce1126", "#ffffff"],
  England: ["#ffffff", "#ce1126"],
  France: ["#0055a4", "#ffffff"],
  Germany: ["#000000", "#ffce00"],
  "IR Iran": ["#239f40", "#ffffff"],
  Iraq: ["#ce1126", "#ffffff"],
  Japan: ["#ffffff", "#bc002d"],
  "Korea Republic": ["#ffffff", "#c60c30"],
  Mexico: ["#006847", "#ffffff"],
  Morocco: ["#c1272d", "#006233"],
  Netherlands: ["#ff4f00", "#ffffff"],
  Norway: ["#ba0c2f", "#ffffff"],
  Panama: ["#ffffff", "#005293"],
  Paraguay: ["#d52b1e", "#ffffff"],
  Portugal: ["#006600", "#ff0000"],
  Qatar: ["#8a1538", "#ffffff"],
  "Saudi Arabia": ["#006c35", "#ffffff"],
  Scotland: ["#005eb8", "#ffffff"],
  Senegal: ["#00853f", "#fdef42"],
  "South Africa": ["#007a4d", "#ffb612"],
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
            loss. Ties are decided by total goal difference.
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
              <th>Played</th>
              <th>W</th>
              <th>D</th>
              <th>L</th>
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
                <td>{row.played}</td>
                <td>{row.wins}</td>
                <td>{row.draws}</td>
                <td>{row.losses}</td>
                <td>
                  <div className="chips">
                    {row.teams.map((team) => (
                      <span key={team} style={getTeamColourStyle(team)}>
                        {team}
                      </span>
                    ))}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
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
  const [primary = "#eef4ff", secondary = "#174ea6"] = teamColours[team] || [];

  return {
    "--team-primary": primary,
    "--team-secondary": secondary,
  };
}
