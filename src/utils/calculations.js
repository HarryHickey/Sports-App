// Pure helpers that transform the persisted data into league tables and player stats.
import { STAT_FIELDS } from "../data/sampleData";

export const generateId = (prefix = "id") =>
  `${prefix}-${Math.random().toString(36).slice(2, 10)}`;

export const getTeamsForLeague = (state, leagueId) =>
  Object.values(state.teams).filter((team) => team.leagueId === leagueId);

export const getFixturesForLeague = (state, leagueId) =>
  Object.values(state.fixtures).filter((fixture) => fixture.leagueId === leagueId);

export const getPlayersForTeam = (state, teamId) => {
  const team = state.teams[teamId];
  if (!team) return [];
  return team.players.map((playerId) => state.players[playerId]).filter(Boolean);
};

export const getStandings = (state, leagueId) => {
  const teams = getTeamsForLeague(state, leagueId);
  const table = teams.reduce((acc, team) => {
    acc[team.id] = {
      teamId: team.id,
      teamName: team.name,
      played: 0,
      won: 0,
      drawn: 0,
      lost: 0,
      points: 0,
      goalsFor: 0,
      goalsAgainst: 0,
      diff: 0,
    };
    return acc;
  }, {});

  const fixtures = getFixturesForLeague(state, leagueId).filter(
    (fixture) => fixture.status === "completed" && fixture.result
  );

  fixtures.forEach((fixture) => {
    const { homeTeamId, awayTeamId, result } = fixture;
    const home = table[homeTeamId];
    const away = table[awayTeamId];
    if (!home || !away) return;

    home.played += 1;
    away.played += 1;

    home.goalsFor += result.home;
    home.goalsAgainst += result.away;
    away.goalsFor += result.away;
    away.goalsAgainst += result.home;

    if (result.home > result.away) {
      home.won += 1;
      away.lost += 1;
      home.points += 3;
    } else if (result.home < result.away) {
      away.won += 1;
      home.lost += 1;
      away.points += 3;
    } else {
      home.drawn += 1;
      away.drawn += 1;
      home.points += 1;
      away.points += 1;
    }

    home.diff = home.goalsFor - home.goalsAgainst;
    away.diff = away.goalsFor - away.goalsAgainst;
  });

  return Object.values(table).sort((a, b) => {
    if (b.points === a.points) {
      if (b.diff === a.diff) {
        return b.goalsFor - a.goalsFor;
      }
      return b.diff - a.diff;
    }
    return b.points - a.points;
  });
};

export const getSeasonPlayerStats = (state, leagueId) => {
  const fixtures = getFixturesForLeague(state, leagueId).filter(
    (fixture) => fixture.status === "completed" && fixture.playerStats
  );

  const totals = {};

  fixtures.forEach((fixture) => {
    Object.entries(fixture.playerStats || {}).forEach(([teamId, playerGroup]) => {
      Object.entries(playerGroup).forEach(([playerId, stats]) => {
        if (!totals[playerId]) {
          const player = state.players[playerId];
          if (!player) return;
          totals[playerId] = {
            playerId,
            name: player.name,
            teamId,
            sport: player.sport,
            position: player.position,
            totals: {},
          };
        }

        Object.entries(stats).forEach(([key, value]) => {
          totals[playerId].totals[key] = (totals[playerId].totals[key] || 0) + Number(value || 0);
        });
      });
    });
  });

  return Object.values(totals).map((entry) => {
    const template = STAT_FIELDS[entry.sport] || [];
    const formatted = template.map((field) => ({
      key: field.key,
      label: field.label,
      value: entry.totals[field.key] || 0,
    }));

    return { ...entry, formatted };
  });
};

export const getPlayerStatsForFixture = (fixture, teamId, players, sport) => {
  const template = STAT_FIELDS[sport] || [];
  const stats = fixture?.playerStats?.[teamId] || {};
  return players.map((player) => ({
    player,
    stats: template.map((field) => ({
      ...field,
      value: stats[player.id]?.[field.key]?.toString() || "0",
    })),
  }));
};
