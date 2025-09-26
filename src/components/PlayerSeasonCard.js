import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { palette } from "../theme/colors";

const PlayerSeasonCard = ({ player, teamName }) => (
  <View style={styles.card}>
    <View style={styles.header}>
      <Text style={styles.name}>{player.name}</Text>
      <Text style={styles.meta}>{player.position}</Text>
      <Text style={styles.meta}>{teamName}</Text>
    </View>
    <View style={styles.statsRow}>
      {player.formatted.map((stat) => (
        <View key={stat.key} style={styles.statBubble}>
          <Text style={styles.statValue}>{stat.value}</Text>
          <Text style={styles.statLabel}>{stat.label}</Text>
        </View>
      ))}
    </View>
  </View>
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 16,
    marginBottom: 14,
    borderWidth: 2,
    borderColor: "rgba(20,33,61,0.1)",
  },
  header: {
    marginBottom: 12,
  },
  name: {
    fontSize: 16,
    fontWeight: "700",
    color: palette.navy,
  },
  meta: {
    fontSize: 13,
    color: "rgba(20,33,61,0.6)",
  },
  statsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  statBubble: {
    minWidth: "30%",
    backgroundColor: "rgba(157, 78, 221, 0.12)",
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 8,
  },
  statValue: {
    fontSize: 16,
    fontWeight: "700",
    color: palette.violet,
  },
  statLabel: {
    marginTop: 4,
    fontSize: 12,
    color: "rgba(20,33,61,0.7)",
  },
});

export default PlayerSeasonCard;
