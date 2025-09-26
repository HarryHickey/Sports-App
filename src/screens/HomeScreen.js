// Home screen shows a colourful overview of all leagues and entry point into
// deeper management flows.
import React, { useMemo, useState } from "react";
import {
  ImageBackground,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useData } from "../context/DataContext";
import { palette } from "../theme/colors";
import SportBadge from "../components/SportBadge";
import FormModal from "../components/FormModal";
import SectionHeader from "../components/SectionHeader";
import EmptyState from "../components/EmptyState";

// Card grid of leagues with quick stats + action shortcuts.
const LeagueList = () => {
  const navigation = useNavigation();
  const {
    leagues,
    getTeamsForLeague,
    getFixturesForLeague,
    addLeague,
    updateLeague,
    deleteLeague,
  } = useData();

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formValues, setFormValues] = useState(defaultLeagueForm("football"));

  const openCreate = () => {
    setEditingId(null);
    setFormValues(defaultLeagueForm("football"));
    setShowForm(true);
  };

  const openEdit = (league) => {
    setEditingId(league.id);
    setFormValues({
      name: league.name,
      sport: league.sport,
      color: league.color,
      description: league.description || "",
    });
    setShowForm(true);
  };

  const submitLeague = () => {
    if (!formValues.name.trim()) {
      return;
    }
    if (editingId) {
      updateLeague(editingId, formValues);
    } else {
      addLeague(formValues);
    }
    setShowForm(false);
  };

  const sortedLeagues = useMemo(
    () =>
      [...leagues].sort((a, b) => a.name.localeCompare(b.name)),
    [leagues]
  );

  return (
    <View>
      <SectionHeader
        title="Leagues"
        subtitle="Tap a league to dive into fixtures, stats, and more."
        rightContent={
          <TouchableOpacity style={styles.primaryButton} onPress={openCreate}>
            <Text style={styles.primaryButtonText}>Create League</Text>
          </TouchableOpacity>
        }
      />
      {sortedLeagues.length ? (
        sortedLeagues.map((league) => {
          const teams = getTeamsForLeague(league.id);
          const fixtures = getFixturesForLeague(league.id);
          const upcoming = fixtures.filter((fixture) => fixture.status === "upcoming");
          const completed = fixtures.filter((fixture) => fixture.status === "completed");
          return (
            <TouchableOpacity
              key={league.id}
              style={[styles.leagueCard, { backgroundColor: league.color || palette.sky }]}
              activeOpacity={0.95}
              onPress={() =>
                navigation.navigate("League", {
                  leagueId: league.id,
                  leagueName: league.name,
                })
              }
            >
              <View style={styles.leagueHeader}>
                <SportBadge sport={league.sport} />
                <TouchableOpacity
                  style={styles.editButton}
                  onPress={() => openEdit(league)}
                >
                  <Text style={styles.editText}>Edit</Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.leagueName}>{league.name}</Text>
              {league.description ? (
                <Text style={styles.leagueDescription}>{league.description}</Text>
              ) : null}
              <View style={styles.leagueMetaRow}>
                <MetaPill label={`${teams.length} teams`} />
                <MetaPill label={`${upcoming.length} fixtures`} />
                <MetaPill label={`${completed.length} results`} />
              </View>
              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={() => deleteLeague(league.id)}
              >
                <Text style={styles.secondaryButtonText}>Delete League</Text>
              </TouchableOpacity>
            </TouchableOpacity>
          );
        })
      ) : (
        <EmptyState
          emoji="🚀"
          title="Create your first league"
          description="Build a football or darts league and start tracking matches instantly."
        />
      )}

      <FormModal
        visible={showForm}
        onClose={() => setShowForm(false)}
        title={editingId ? "Update League" : "Create League"}
        footer={
          <TouchableOpacity style={styles.submitButton} onPress={submitLeague}>
            <Text style={styles.submitButtonText}>
              {editingId ? "Save changes" : "Create league"}
            </Text>
          </TouchableOpacity>
        }
      >
        <Text style={styles.inputLabel}>League name</Text>
        <TextInput
          style={styles.input}
          placeholder="Metro City League"
          value={formValues.name}
          onChangeText={(value) => setFormValues((prev) => ({ ...prev, name: value }))}
        />
        <Text style={styles.inputLabel}>Sport</Text>
        <View style={styles.sportRow}>
          {(["football", "darts"]).map((sport) => {
            const active = formValues.sport === sport;
            return (
              <TouchableOpacity
                key={sport}
                style={[styles.sportChip, active && styles.sportChipActive]}
                onPress={() => setFormValues((prev) => ({ ...prev, sport }))}
              >
                <Text style={[styles.sportChipText, active && styles.sportChipTextActive]}>
                  {sport === "football" ? "⚽ Football" : "🎯 Darts"}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
        <Text style={styles.inputLabel}>Accent color</Text>
        <TextInput
          style={styles.input}
          placeholder="#FF6B6B"
          value={formValues.color}
          onChangeText={(value) => setFormValues((prev) => ({ ...prev, color: value }))}
        />
        <Text style={styles.inputLabel}>Description</Text>
        <TextInput
          style={[styles.input, styles.multiline]}
          placeholder="Tell managers what this league is about"
          value={formValues.description}
          multiline
          onChangeText={(value) => setFormValues((prev) => ({ ...prev, description: value }))}
        />
      </FormModal>
    </View>
  );
};

const defaultLeagueForm = (sport) => ({
  name: "",
  sport,
  color: sport === "football" ? palette.coral : palette.violet,
  description: "",
});

const MetaPill = ({ label }) => (
  <View style={styles.metaPill}>
    <Text style={styles.metaText}>{label}</Text>
  </View>
);

// Wrapped in a background image to give the dashboard a celebratory feel.
const HomeScreenContent = () => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ImageBackground
        source={{
          uri: "https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=1400&q=80",
        }}
        resizeMode="cover"
        style={styles.background}
      >
        <View style={styles.overlay}>
          <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.heroTitle}>TrackMyMatch</Text>
            <Text style={styles.heroSubtitle}>
              Build leagues, track fixtures, and celebrate every goal and bullseye.
            </Text>
            <LeagueList />
          </ScrollView>
        </View>
      </ImageBackground>
    </SafeAreaView>
  );
};

const HomeScreen = () => <HomeScreenContent />;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: palette.midnight,
  },
  background: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(20, 33, 61, 0.85)",
  },
  container: {
    padding: 24,
    paddingBottom: 120,
  },
  heroTitle: {
    fontSize: 36,
    fontWeight: "800",
    color: "#fff",
  },
  heroSubtitle: {
    marginTop: 8,
    fontSize: 16,
    color: "rgba(255,255,255,0.85)",
    marginBottom: 24,
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
  leagueCard: {
    borderRadius: 28,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  leagueHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  editButton: {
    backgroundColor: "rgba(20,33,61,0.25)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
  },
  editText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 12,
  },
  leagueName: {
    fontSize: 22,
    fontWeight: "800",
    color: "#fff",
    marginTop: 16,
  },
  leagueDescription: {
    fontSize: 14,
    color: "rgba(255,255,255,0.85)",
    marginTop: 6,
  },
  leagueMetaRow: {
    flexDirection: "row",
    marginTop: 16,
    marginBottom: 12,
  },
  metaPill: {
    backgroundColor: "rgba(255,255,255,0.25)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 10,
  },
  metaText: {
    fontWeight: "700",
    color: "#fff",
  },
  secondaryButton: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(20,33,61,0.25)",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
  },
  secondaryButtonText: {
    color: "#fff",
    fontWeight: "600",
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
    height: 100,
    textAlignVertical: "top",
  },
  sportRow: {
    flexDirection: "row",
    marginBottom: 14,
  },
  sportChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: "rgba(20,33,61,0.08)",
    marginRight: 10,
  },
  sportChipActive: {
    backgroundColor: palette.sunshine,
  },
  sportChipText: {
    fontWeight: "600",
    color: "rgba(20,33,61,0.65)",
  },
  sportChipTextActive: {
    color: palette.navy,
  },
  submitButton: {
    backgroundColor: palette.midnight,
    paddingVertical: 12,
    borderRadius: 16,
    alignItems: "center",
  },
  submitButtonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
});

export default HomeScreen;
