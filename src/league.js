export function getWinner(homeTeam, awayTeam, homeScore, awayScore) {
  if (homeScore === null || awayScore === null) {
    return "";
  }

  if (homeScore > awayScore) {
    return homeTeam;
  }

  if (awayScore > homeScore) {
    return awayTeam;
  }

  return "Draw";
}

export function normaliseScore(value) {
  if (value === "" || value === null || value === undefined) {
    return null;
  }

  const score = Number(value);
  return Number.isInteger(score) && score >= 0 ? score : null;
}

export function buildLeaderboard(players, fixtures) {
  const teamToPlayer = new Map();

  players.forEach((player) => {
    player.Teams.forEach((team) => {
      teamToPlayer.set(team, player.Player);
    });
  });

  const rowsByPlayer = new Map(
    players.map((player) => [
      player.Player,
      {
        player: player.Player,
        teams: player.Teams,
        points: 0,
        wins: 0,
        draws: 0,
        losses: 0,
        played: 0,
        goalDifference: 0,
      },
    ]),
  );

  fixtures.forEach((fixture) => {
    const homeScore = normaliseScore(fixture.HomeTeamScore);
    const awayScore = normaliseScore(fixture.AwayTeamScore);

    if (homeScore === null || awayScore === null) {
      return;
    }

    addFixturePoints(rowsByPlayer, teamToPlayer, fixture.HomeTeam, homeScore, awayScore);
    addFixturePoints(rowsByPlayer, teamToPlayer, fixture.AwayTeam, awayScore, homeScore);
  });

  return Array.from(rowsByPlayer.values()).sort((a, b) => {
    if (b.points !== a.points) {
      return b.points - a.points;
    }

    if (b.goalDifference !== a.goalDifference) {
      return b.goalDifference - a.goalDifference;
    }

    if (b.wins !== a.wins) {
      return b.wins - a.wins;
    }

    return a.player.localeCompare(b.player);
  });
}

function addFixturePoints(rowsByPlayer, teamToPlayer, team, teamScore, opponentScore) {
  const playerName = teamToPlayer.get(team);

  if (!playerName) {
    return;
  }

  const row = rowsByPlayer.get(playerName);
  row.played += 1;
  row.goalDifference += teamScore - opponentScore;

  if (teamScore > opponentScore) {
    row.points += 3;
    row.wins += 1;
    return;
  }

  if (teamScore === opponentScore) {
    row.points += 1;
    row.draws += 1;
    return;
  }

  row.losses += 1;
}
