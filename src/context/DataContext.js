import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { sampleData, STAT_FIELDS } from "../data/sampleData";
import {
  generateId,
  getFixturesForLeague,
  getPlayersForTeam,
  getStandings,
  getTeamsForLeague,
} from "../utils/calculations";

const STORAGE_KEY = "trackmymatch:data";

// Global state container powering the TrackMyMatch experience.
// The context stores leagues, teams, fixtures and player data and exposes
// helper methods for CRUD operations + stat calculations.
const DataContext = createContext();

export const DataProvider = ({ children }) => {
  const [state, setState] = useState(sampleData);
  const [loaded, setLoaded] = useState(false);

  // Load persisted data from AsyncStorage on mount.
  useEffect(() => {
    const loadData = async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (stored) {
          setState(JSON.parse(stored));
        }
      } catch (error) {
        console.warn("Failed to load TrackMyMatch data", error);
      } finally {
        setLoaded(true);
      }
    };

    loadData();
  }, []);

  // Persist changes whenever the in-memory state updates.
  useEffect(() => {
    if (!loaded) return;
    const persist = async () => {
      try {
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      } catch (error) {
        console.warn("Failed to persist TrackMyMatch data", error);
      }
    };

    persist();
  }, [state, loaded]);

  // Utility to keep state updates consistent and always clone the root object.
  const withStateUpdate = (updater) => {
    setState((prev) => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      return { ...next };
    });
  };

  // League CRUD helpers ----------------------------------------------------
  const addLeague = (payload) => {
    withStateUpdate((prev) => {
      const id = generateId("lg");
      const league = {
        id,
        name: payload.name,
        sport: payload.sport,
        color: payload.color,
        description: payload.description,
      };
      return { ...prev, leagues: [...prev.leagues, league] };
    });
  };

  const updateLeague = (leagueId, updates) => {
    withStateUpdate((prev) => ({
      ...prev,
      leagues: prev.leagues.map((league) =>
        league.id === leagueId ? { ...league, ...updates } : league
      ),
    }));
  };

  const deleteLeague = (leagueId) => {
    withStateUpdate((prev) => {
      const teams = getTeamsForLeague(prev, leagueId).map((team) => team.id);
      const fixtures = getFixturesForLeague(prev, leagueId).map((fixture) => fixture.id);

      const nextTeams = { ...prev.teams };
      teams.forEach((teamId) => delete nextTeams[teamId]);

      const nextPlayers = { ...prev.players };
      teams.forEach((teamId) => {
        Object.values(prev.players).forEach((player) => {
          if (player.teamId === teamId) {
            delete nextPlayers[player.id];
          }
        });
      });

      const nextFixtures = { ...prev.fixtures };
      fixtures.forEach((fixtureId) => delete nextFixtures[fixtureId]);

      return {
        ...prev,
        leagues: prev.leagues.filter((league) => league.id !== leagueId),
        teams: nextTeams,
        players: nextPlayers,
        fixtures: nextFixtures,
      };
    });
  };

  // Team CRUD helpers ------------------------------------------------------
  const addTeam = (leagueId, payload) => {
    withStateUpdate((prev) => {
      const teamId = generateId("team");
      const playerIds = (payload.players || []).map(() => generateId("player"));

      const newPlayers = playerIds.reduce((acc, id, index) => {
        acc[id] = {
          id,
          name: payload.players[index],
          position: payload.positions?.[index] || "", // optional positions
          sport: payload.sport,
          teamId,
        };
        return acc;
      }, {});

      return {
        ...prev,
        teams: {
          ...prev.teams,
          [teamId]: {
            id: teamId,
            leagueId,
            name: payload.name,
            badgeColor: payload.badgeColor,
            players: playerIds,
          },
        },
        players: { ...prev.players, ...newPlayers },
      };
    });
  };

  const updateTeam = (teamId, updates) => {
    withStateUpdate((prev) => ({
      ...prev,
      teams: {
        ...prev.teams,
        [teamId]: { ...prev.teams[teamId], ...updates },
      },
    }));
  };

  const deleteTeam = (teamId) => {
    withStateUpdate((prev) => {
      const nextTeams = { ...prev.teams };
      const nextPlayers = { ...prev.players };
      const nextFixtures = { ...prev.fixtures };

      const team = prev.teams[teamId];
      if (!team) return prev;

      team.players.forEach((playerId) => {
        delete nextPlayers[playerId];
      });

      Object.values(nextFixtures).forEach((fixture) => {
        if (fixture.homeTeamId === teamId || fixture.awayTeamId === teamId) {
          delete nextFixtures[fixture.id];
        }
      });

      delete nextTeams[teamId];

      return {
        ...prev,
        teams: nextTeams,
        players: nextPlayers,
        fixtures: nextFixtures,
      };
    });
  };

  // Player CRUD helpers ----------------------------------------------------
  const addPlayer = (teamId, payload) => {
    withStateUpdate((prev) => {
      const team = prev.teams[teamId];
      if (!team) return prev;
      const playerId = generateId("player");
      const player = {
        id: playerId,
        name: payload.name,
        position: payload.position,
        sport: payload.sport,
        teamId,
      };

      return {
        ...prev,
        players: { ...prev.players, [playerId]: player },
        teams: {
          ...prev.teams,
          [teamId]: {
            ...team,
            players: [...team.players, playerId],
          },
        },
      };
    });
  };

  const updatePlayer = (playerId, updates) => {
    withStateUpdate((prev) => ({
      ...prev,
      players: {
        ...prev.players,
        [playerId]: { ...prev.players[playerId], ...updates },
      },
    }));
  };

  const deletePlayer = (teamId, playerId) => {
    withStateUpdate((prev) => {
      const team = prev.teams[teamId];
      if (!team) return prev;
      const nextPlayers = { ...prev.players };
      delete nextPlayers[playerId];

      return {
        ...prev,
        players: nextPlayers,
        teams: {
          ...prev.teams,
          [teamId]: {
            ...team,
            players: team.players.filter((id) => id !== playerId),
          },
        },
      };
    });
  };

  // Fixture + results helpers ---------------------------------------------
  const addFixture = (payload) => {
    withStateUpdate((prev) => {
      const fixtureId = generateId("fixture");
      const fixture = {
        id: fixtureId,
        leagueId: payload.leagueId,
        homeTeamId: payload.homeTeamId,
        awayTeamId: payload.awayTeamId,
        date: payload.date,
        venue: payload.venue,
        status: "upcoming",
        result: null,
        playerStats: {},
      };

      return {
        ...prev,
        fixtures: { ...prev.fixtures, [fixtureId]: fixture },
      };
    });
  };

  const updateFixture = (fixtureId, updates) => {
    withStateUpdate((prev) => ({
      ...prev,
      fixtures: {
        ...prev.fixtures,
        [fixtureId]: { ...prev.fixtures[fixtureId], ...updates },
      },
    }));
  };

  const deleteFixture = (fixtureId) => {
    withStateUpdate((prev) => {
      const nextFixtures = { ...prev.fixtures };
      delete nextFixtures[fixtureId];
      return { ...prev, fixtures: nextFixtures };
    });
  };

  const recordResult = (fixtureId, payload) => {
    withStateUpdate((prev) => {
      const fixture = prev.fixtures[fixtureId];
      if (!fixture) return prev;
      const nextFixture = {
        ...fixture,
        status: "completed",
        result: payload.score,
        playerStats: payload.playerStats,
      };

      return {
        ...prev,
        fixtures: {
          ...prev.fixtures,
          [fixtureId]: nextFixture,
        },
      };
    });
  };

  const value = useMemo(
    () => ({
      loaded,
      state,
      leagues: state.leagues,
      teams: state.teams,
      players: state.players,
      fixtures: state.fixtures,
      addLeague,
      updateLeague,
      deleteLeague,
      addTeam,
      updateTeam,
      deleteTeam,
      addPlayer,
      updatePlayer,
      deletePlayer,
      addFixture,
      updateFixture,
      deleteFixture,
      recordResult,
      STAT_FIELDS,
      getTeamsForLeague: (leagueId) => getTeamsForLeague(state, leagueId),
      getFixturesForLeague: (leagueId) => getFixturesForLeague(state, leagueId),
      getStandings: (leagueId) => getStandings(state, leagueId),
      getPlayersForTeam: (teamId) => getPlayersForTeam(state, teamId),
    }),
    [state, loaded]
  );

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};

export const useData = () => useContext(DataContext);
