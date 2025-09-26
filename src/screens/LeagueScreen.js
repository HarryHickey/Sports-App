// League management hub: teams, fixtures and season stats live here.
import React, { useMemo, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useRoute } from "@react-navigation/native";
import { useData } from "../context/DataContext";
import TeamCard from "../components/TeamCard";
import SectionHeader from "../components/SectionHeader";
import EmptyState from "../components/EmptyState";
import FormModal from "../components/FormModal";
import SegmentedControl from "../components/SegmentedControl";
import FixtureCard from "../components/FixtureCard";
import StandingsTable from "../components/StandingsTable";
import PlayerSeasonCard from "../components/PlayerSeasonCard";
import { palette } from "../theme/colors";
import { STAT_FIELDS } from "../data/sampleData";
import { getPlayerStatsForFixture } from "../utils/calculations";

const LeagueScreen = () => {
  const route = useRoute();
  const { leagueId } = route.params;
  const {
    leagues,
    getTeamsForLeague,
    getFixturesForLeague,
    getStandings,
    getPlayersForTeam,
    addTeam,
    updateTeam,
    deleteTeam,
    addPlayer,
    deletePlayer,
    addFixture,
    updateFixture,
    deleteFixture,
    recordResult,
    STAT_FIELDS: statConfig,
  } = useData();

  const league = leagues.find((item) => item.id === leagueId);
  const [activeTab, setActiveTab] = useState("teams");

  const [teamModalVisible, setTeamModalVisible] = useState(false);
  const [teamEditingId, setTeamEditingId] = useState(null);
  const [teamForm, setTeamForm] = useState(defaultTeamForm());

  const [playerModalVisible, setPlayerModalVisible] = useState(false);
  const [activeTeamId, setActiveTeamId] = useState(null);
  const [playerForm, setPlayerForm] = useState({ name: "", position: "" });

  const [fixtureModalVisible, setFixtureModalVisible] = useState(false);
  const [fixtureEditingId, setFixtureEditingId] = useState(null);
  const [fixtureForm, setFixtureForm] = useState(defaultFixtureForm(leagueId));

  const [resultModalVisible, setResultModalVisible] = useState(false);
  const [resultFixtureId, setResultFixtureId] = useState(null);
  const [resultState, setResultState] = useState(defaultResultState());

  const teams = useMemo(() => getTeamsForLeague(leagueId), [getTeamsForLeague, leagueId]);

  const fixtures = useMemo(
    () =>
      getFixturesForLeague(leagueId).sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
      ),
    [getFixturesForLeague, leagueId]
  );

  const standings = useMemo(() => getStandings(leagueId), [getStandings, leagueId]);

  const openCreateTeam = () => {
    setTeamEditingId(null);
    setTeamForm(defaultTeamForm());
    setTeamModalVisible(true);
  };

  const openEditTeam = (team) => {
    setTeamEditingId(team.id);
    setTeamForm({
      name: team.name,
      badgeColor: team.badgeColor || "",
      playersText: getPlayersForTeam(team.id).map((player) => player.name).join(", "),
    });
    setTeamModalVisible(true);
  };

  const submitTeam = () => {
    if (!teamForm.name.trim()) return;

    const playerNames = teamForm.playersText
      ? teamForm.playersText.split(",").map((item) => item.trim()).filter(Boolean)
      : [];

    if (teamEditingId) {
      updateTeam(teamEditingId, {
        name: teamForm.name,
        badgeColor: teamForm.badgeColor,
      });
    } else {
      addTeam(leagueId, {
        name: teamForm.name,
        badgeColor: teamForm.badgeColor,
        players: playerNames,
        positions: playerNames.map(() => ""),
        sport: league.sport,
      });
    }

    setTeamModalVisible(false);
  };

  const openAddPlayer = (teamId) => {
    setActiveTeamId(teamId);
    setPlayerForm({ name: "", position: "" });
    setPlayerModalVisible(true);
  };

  const submitPlayer = () => {
    if (!playerForm.name.trim() || !activeTeamId) return;
    addPlayer(activeTeamId, {
      name: playerForm.name,
      position: playerForm.position,
      sport: league.sport,
    });
    setPlayerModalVisible(false);
  };

  const openAddFixture = () => {
    setFixtureEditingId(null);
    setFixtureForm(defaultFixtureForm(leagueId));
    setFixtureModalVisible(true);
  };

  const openEditFixture = (fixture) => {
    setFixtureEditingId(fixture.id);
    setFixtureForm({
      leagueId: fixture.leagueId,
      homeTeamId: fixture.homeTeamId,
      awayTeamId: fixture.awayTeamId,
      date: fixture.date,
      venue: fixture.venue,
    });
    setFixtureModalVisible(true);
  };

  const submitFixture = () => {
    if (!fixtureForm.homeTeamId || !fixtureForm.awayTeamId) return;
    if (fixtureForm.homeTeamId === fixtureForm.awayTeamId) return;
    if (fixtureEditingId) {
      updateFixture(fixtureEditingId, fixtureForm);
    } else {
      addFixture(fixtureForm);
    }
    setFixtureModalVisible(false);
  };

  const openResultModal = (fixture) => {
    setResultFixtureId(fixture.id);
    setResultState(
      buildResultState({
        fixture,
        sport: league.sport,
        getPlayersForTeam,
      })
    );
    setResultModalVisible(true);
  };

  const submitResult = () => {
    if (!resultFixtureId) return;
    const playerStats = {};
    Object.entries(resultState.playerStats).forEach(([teamId, stats]) => {
      playerStats[teamId] = {};
      stats.forEach((entry) => {
        const values = {};
        entry.stats.forEach((stat) => {
          values[stat.key] = Number(stat.value) || 0;
        });
        playerStats[teamId][entry.player.id] = values;
      });
    });

    recordResult(resultFixtureId, {
      score: {
        home: Number(resultState.score.home) || 0,
        away: Number(resultState.score.away) || 0,
      },
      playerStats,
    });
    setResultModalVisible(false);
  };

  const seasonStats = useMemo(() => {
    const completed = fixtures.filter((fixture) => fixture.status === "completed");
    if (!completed.length) return [];
    return completed
      .reduce((acc, fixture) => {
        Object.entries(fixture.playerStats || {}).forEach(([teamId, players]) => {
          Object.entries(players).forEach(([playerId, stats]) => {
            if (!acc[playerId]) {
              const player = getPlayersForTeam(teamId).find((item) => item.id === playerId);
              if (!player) return;
              acc[playerId] = {
                playerId,
                name: player.name,
                position: player.position,
                teamId,
                sport: league.sport,
                totals: {},
              };
            }
            Object.entries(stats).forEach(([key, value]) => {
              acc[playerId].totals[key] = (acc[playerId].totals[key] || 0) + Number(value || 0);
            });
          });
        });
        return acc;
      }, {})
      .map((item) => {
        const template = statConfig[league.sport] || [];
        return {
          playerId: item.playerId,
          name: item.name,
          position: item.position,
          teamId: item.teamId,
          formatted: template.map((field) => ({
            key: field.key,
            label: field.label,
            value: item.totals[field.key] || 0,
          })),
        };
      });
  }, [fixtures, getPlayersForTeam, league.sport, statConfig, teams]);

  if (!league) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <EmptyState emoji="❓" title="League not found" description="Try returning to the dashboard." />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView contentContainerStyle={styles.container}>
          <Text style={styles.leagueTitle}>{league.name}</Text>
          <Text style={styles.leagueSubtitle}>
            Manage teams, fixtures, and player stats for this {league.sport} league.
          </Text>

          <StandingsTable standings={standings} />

          <SegmentedControl
            segments={segmentOptions}
            value={activeTab}
            onChange={setActiveTab}
          />

          {activeTab === "teams" ? (
            <View>
              <SectionHeader
                title="Teams"
                subtitle="Add or edit squads competing in this league."
                rightContent={
                  <TouchableOpacity style={styles.primaryButton} onPress={openCreateTeam}>
                    <Text style={styles.primaryButtonText}>Add team</Text>
                  </TouchableOpacity>
                }
              />
              {teams.length ? (
                teams.map((team) => {
                  const players = getPlayersForTeam(team.id);
                  return (
                    <TeamCard
                      key={team.id}
                      team={team}
                      players={players}
                      onAddPlayer={() => openAddPlayer(team.id)}
                      onEditTeam={() => openEditTeam(team)}
                      onDeleteTeam={() => deleteTeam(team.id)}
                      onRemovePlayer={(player) => deletePlayer(team.id, player.id)}
                    />
                  );
                })
              ) : (
                <EmptyState
                  emoji="🤝"
                  title="No teams yet"
                  description="Create your first team to start planning fixtures."
                />
              )}
            </View>
          ) : null}

          {activeTab === "fixtures" ? (
            <View>
              <SectionHeader
                title="Fixtures & Results"
                subtitle="Plan future matches and log final scores."
                rightContent={
                  <TouchableOpacity style={styles.primaryButton} onPress={openAddFixture}>
                    <Text style={styles.primaryButtonText}>Add fixture</Text>
                  </TouchableOpacity>
                }
              />
              {fixtures.length ? (
                fixtures.map((fixture) => (
                  <FixtureCard
                    key={fixture.id}
                    fixture={fixture}
                    homeTeam={teams.find((team) => team.id === fixture.homeTeamId)}
                    awayTeam={teams.find((team) => team.id === fixture.awayTeamId)}
                    onEdit={() => openEditFixture(fixture)}
                    onDelete={() => deleteFixture(fixture.id)}
                    onRecord={() => openResultModal(fixture)}
                  />
                ))
              ) : (
                <EmptyState
                  emoji="📅"
                  title="No fixtures scheduled"
                  description="Add fixtures to build excitement and track results."
                />
              )}
            </View>
          ) : null}

          {activeTab === "season" ? (
            <View>
              <SectionHeader
                title="Season player stats"
                subtitle="Totals are calculated from recorded match results."
              />
              {seasonStats.length ? (
                seasonStats.map((player) => (
                  <PlayerSeasonCard
                    key={player.playerId}
                    player={player}
                    teamName={getTeamName(teams, player.teamId)}
                  />
                ))
              ) : (
                <EmptyState
                  emoji="📊"
                  title="No stats yet"
                  description="Record match results to track player performances."
                />
              )}
            </View>
          ) : null}
        </ScrollView>
      </KeyboardAvoidingView>

      <FormModal
        visible={teamModalVisible}
        onClose={() => setTeamModalVisible(false)}
        title={teamEditingId ? "Edit team" : "Create team"}
        footer={
          <TouchableOpacity style={styles.submitButton} onPress={submitTeam}>
            <Text style={styles.submitButtonText}>Save team</Text>
          </TouchableOpacity>
        }
      >
        <Text style={styles.inputLabel}>Team name</Text>
        <TextInput
          style={styles.input}
          placeholder="Neon Ninjas"
          value={teamForm.name}
          onChangeText={(value) => setTeamForm((prev) => ({ ...prev, name: value }))}
        />
        <Text style={styles.inputLabel}>Badge color</Text>
        <TextInput
          style={styles.input}
          placeholder="#FF9DE2"
          value={teamForm.badgeColor}
          onChangeText={(value) => setTeamForm((prev) => ({ ...prev, badgeColor: value }))}
        />
        {!teamEditingId ? (
          <>
            <Text style={styles.inputLabel}>Players (comma separated)</Text>
            <TextInput
              style={[styles.input, styles.multiline]}
              placeholder="Luna Arrow, Vega Aim, Nova Flights"
              value={teamForm.playersText}
              multiline
              onChangeText={(value) => setTeamForm((prev) => ({ ...prev, playersText: value }))}
            />
          </>
        ) : null}
      </FormModal>

      <FormModal
        visible={playerModalVisible}
        onClose={() => setPlayerModalVisible(false)}
        title="Add player"
        footer={
          <TouchableOpacity style={styles.submitButton} onPress={submitPlayer}>
            <Text style={styles.submitButtonText}>Save player</Text>
          </TouchableOpacity>
        }
      >
        <Text style={styles.inputLabel}>Player name</Text>
        <TextInput
          style={styles.input}
          placeholder="Luna Arrows"
          value={playerForm.name}
          onChangeText={(value) => setPlayerForm((prev) => ({ ...prev, name: value }))}
        />
        <Text style={styles.inputLabel}>Position / Role</Text>
        <TextInput
          style={styles.input}
          placeholder="Forward or Captain"
          value={playerForm.position}
          onChangeText={(value) => setPlayerForm((prev) => ({ ...prev, position: value }))}
        />
      </FormModal>

      <FormModal
        visible={fixtureModalVisible}
        onClose={() => setFixtureModalVisible(false)}
        title={fixtureEditingId ? "Edit fixture" : "Create fixture"}
        footer={
          <TouchableOpacity
            style={[styles.submitButton, teams.length < 2 && styles.submitButtonDisabled]}
            disabled={teams.length < 2}
            onPress={submitFixture}
          >
            <Text style={styles.submitButtonText}>
              {teams.length < 2 ? "Add more teams first" : "Save fixture"}
            </Text>
          </TouchableOpacity>
        }
      >
        {teams.length < 2 ? (
          <Text style={styles.helperText}>
            You need at least two teams in this league to schedule a fixture.
          </Text>
        ) : null}
        <Text style={styles.inputLabel}>Home team</Text>
        <TeamSelector
          teams={teams}
          selectedId={fixtureForm.homeTeamId}
          onSelect={(value) => setFixtureForm((prev) => ({ ...prev, homeTeamId: value }))}
        />
        <Text style={styles.inputLabel}>Away team</Text>
        <TeamSelector
          teams={teams}
          selectedId={fixtureForm.awayTeamId}
          onSelect={(value) => setFixtureForm((prev) => ({ ...prev, awayTeamId: value }))}
        />
        <Text style={styles.inputLabel}>Kick-off / Start time (ISO)</Text>
        <TextInput
          style={styles.input}
          placeholder="2024-06-01T18:30:00.000Z"
          value={fixtureForm.date}
          onChangeText={(value) => setFixtureForm((prev) => ({ ...prev, date: value }))}
        />
        <Text style={styles.inputLabel}>Venue</Text>
        <TextInput
          style={styles.input}
          placeholder="Stadium or pub"
          value={fixtureForm.venue}
          onChangeText={(value) => setFixtureForm((prev) => ({ ...prev, venue: value }))}
        />
      </FormModal>

      <FormModal
        visible={resultModalVisible}
        onClose={() => setResultModalVisible(false)}
        title="Record match result"
        footer={
          <TouchableOpacity style={styles.submitButton} onPress={submitResult}>
            <Text style={styles.submitButtonText}>Save result</Text>
          </TouchableOpacity>
        }
      >
        <View style={styles.scoreRow}>
          <View style={styles.scoreColumn}>
            <Text style={styles.inputLabel}>Home score</Text>
            <TextInput
              style={styles.input}
              keyboardType="number-pad"
              value={resultState.score.home}
              onChangeText={(value) =>
                setResultState((prev) => ({
                  ...prev,
                  score: { ...prev.score, home: value },
                }))
              }
            />
          </View>
          <View style={styles.scoreColumn}>
            <Text style={styles.inputLabel}>Away score</Text>
            <TextInput
              style={styles.input}
              keyboardType="number-pad"
              value={resultState.score.away}
              onChangeText={(value) =>
                setResultState((prev) => ({
                  ...prev,
                  score: { ...prev.score, away: value },
                }))
              }
            />
          </View>
        </View>

        {resultState.teamOrder.map((teamId) => (
          <View key={teamId} style={styles.playerStatsBlock}>
            <Text style={styles.playerStatsTitle}>{getTeamName(teams, teamId)}</Text>
            {resultState.playerStats[teamId].map((entry, index) => (
              <View key={entry.player.id} style={styles.playerStatCard}>
                <Text style={styles.playerName}>{entry.player.name}</Text>
                {entry.stats.map((field, statIndex) => (
                  <View key={field.key} style={styles.statRow}>
                    <Text style={styles.statLabel}>{field.label}</Text>
                    <TextInput
                      style={styles.statInput}
                      keyboardType="numeric"
                      value={field.value}
                      onChangeText={(value) =>
                        setResultState((prev) => {
                          const updated = [...prev.playerStats[teamId]];
                          const stats = [...updated[index].stats];
                          stats[statIndex] = { ...stats[statIndex], value };
                          updated[index] = { ...updated[index], stats };
                          return {
                            ...prev,
                            playerStats: { ...prev.playerStats, [teamId]: updated },
                          };
                        })
                      }
                    />
                  </View>
                ))}
              </View>
            ))}
          </View>
        ))}
      </FormModal>
    </SafeAreaView>
  );
};

const segmentOptions = [
  { label: "Teams", value: "teams" },
  { label: "Fixtures", value: "fixtures" },
  { label: "Season stats", value: "season" },
];

const defaultTeamForm = () => ({
  name: "",
  badgeColor: "",
  playersText: "",
});

const defaultFixtureForm = (leagueId) => ({
  leagueId,
  homeTeamId: "",
  awayTeamId: "",
  date: new Date().toISOString(),
  venue: "",
});

const defaultResultState = () => ({
  score: { home: "0", away: "0" },
  teamOrder: [],
  playerStats: {},
});

const buildResultState = ({ fixture, sport, getPlayersForTeam }) => {
  const template = STAT_FIELDS[sport] || [];
  const homePlayers = getPlayersForTeam(fixture.homeTeamId);
  const awayPlayers = getPlayersForTeam(fixture.awayTeamId);

  const initialState = {
    score: {
      home: fixture.result?.home?.toString() || "0",
      away: fixture.result?.away?.toString() || "0",
    },
    teamOrder: [fixture.homeTeamId, fixture.awayTeamId],
    playerStats: {},
  };

  [
    { teamId: fixture.homeTeamId, players: homePlayers },
    { teamId: fixture.awayTeamId, players: awayPlayers },
  ].forEach(({ teamId, players }) => {
    initialState.playerStats[teamId] = getPlayerStatsForFixture(
      fixture,
      teamId,
      players,
      sport
    );

    if (!initialState.playerStats[teamId].length) {
      initialState.playerStats[teamId] = players.map((player) => ({
        player,
        stats: template.map((field) => ({ ...field, value: "0" })),
      }));
    }
  });

  return initialState;
};

const TeamSelector = ({ teams, selectedId, onSelect }) => (
  <View style={styles.selectorRow}>
    {teams.map((team) => {
      const active = selectedId === team.id;
      return (
        <TouchableOpacity
          key={team.id}
          style={[styles.selectorChip, active && styles.selectorChipActive]}
          onPress={() => onSelect(team.id)}
        >
          <Text style={[styles.selectorText, active && styles.selectorTextActive]}>
            {team.name}
          </Text>
        </TouchableOpacity>
      );
    })}
  </View>
);

const getTeamName = (teams, teamId) => teams.find((team) => team.id === teamId)?.name || "";

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f2f4ff",
  },
  container: {
    padding: 24,
    paddingBottom: 120,
  },
  leagueTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: palette.navy,
  },
  leagueSubtitle: {
    marginTop: 8,
    fontSize: 14,
    color: "rgba(20,33,61,0.7)",
    marginBottom: 16,
  },
  primaryButton: {
    backgroundColor: palette.sunshine,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 16,
  },
  primaryButtonText: {
    fontWeight: "700",
    color: palette.navy,
  },
  submitButton: {
    backgroundColor: palette.midnight,
    paddingVertical: 12,
    borderRadius: 16,
    alignItems: "center",
  },
  submitButtonDisabled: {
    backgroundColor: "rgba(20,33,61,0.4)",
  },
  submitButtonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
  input: {
    backgroundColor: "#f5f7ff",
    borderRadius: 16,
    padding: 14,
    fontSize: 14,
    color: palette.navy,
    marginBottom: 14,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: palette.navy,
    marginBottom: 6,
  },
  multiline: {
    height: 80,
    textAlignVertical: "top",
  },
  selectorRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 16,
  },
  selectorChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: "rgba(20,33,61,0.08)",
    marginRight: 8,
    marginBottom: 8,
  },
  selectorChipActive: {
    backgroundColor: palette.sunshine,
  },
  selectorText: {
    fontWeight: "600",
    color: "rgba(20,33,61,0.6)",
  },
  selectorTextActive: {
    color: palette.navy,
  },
  scoreRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  scoreColumn: {
    flex: 1,
    marginRight: 8,
  },
  playerStatsBlock: {
    marginTop: 12,
  },
  playerStatsTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: palette.navy,
    marginBottom: 6,
  },
  playerStatCard: {
    backgroundColor: "rgba(94,211,243,0.15)",
    borderRadius: 16,
    padding: 12,
    marginBottom: 10,
  },
  playerName: {
    fontWeight: "700",
    color: palette.navy,
    marginBottom: 6,
  },
  statRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  statLabel: {
    color: "rgba(20,33,61,0.7)",
    fontWeight: "600",
  },
  statInput: {
    width: 70,
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingVertical: 6,
    paddingHorizontal: 10,
    textAlign: "center",
    color: palette.navy,
  },
  helperText: {
    backgroundColor: "rgba(255, 154, 139, 0.2)",
    color: palette.navy,
    padding: 12,
    borderRadius: 14,
    marginBottom: 12,
  },
});

export default LeagueScreen;
