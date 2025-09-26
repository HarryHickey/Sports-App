import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { palette } from "../theme/colors";

const StandingsTable = ({ standings }) => {
  if (!standings.length) {
    return null;
  }

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.container}>
      <View>
        <View style={styles.headerRow}>
          {columns.map((column) => (
            <Text key={column.key} style={[styles.cell, styles.headerCell, { width: column.width }]}>
              {column.label}
            </Text>
          ))}
        </View>
        {standings.map((team, index) => (
          <View key={team.teamId} style={styles.dataRow}>
            {columns.map((column) => (
              <Text
                key={column.key}
                style={[styles.cell, { width: column.width }, column.key === "team" && styles.teamCell]}
              >
                {column.render ? column.render(team, index) : team[column.key]}
              </Text>
            ))}
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

const columns = [
  {
    key: "position",
    label: "#",
    width: 40,
    render: (_team, index) => index + 1,
  },
  {
    key: "team",
    label: "Team",
    width: 140,
    render: (team) => team.teamName,
  },
  { key: "played", label: "P", width: 60 },
  { key: "won", label: "W", width: 60 },
  { key: "drawn", label: "D", width: 60 },
  { key: "lost", label: "L", width: 60 },
  { key: "goalsFor", label: "GF", width: 60 },
  { key: "goalsAgainst", label: "GA", width: 60 },
  { key: "diff", label: "+/-", width: 60 },
  { key: "points", label: "Pts", width: 60 },
];

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
    borderRadius: 18,
    backgroundColor: "rgba(111,255,233,0.15)",
    paddingVertical: 12,
  },
  headerRow: {
    flexDirection: "row",
    paddingHorizontal: 16,
  },
  dataRow: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  cell: {
    fontSize: 13,
    fontWeight: "600",
    color: palette.navy,
  },
  headerCell: {
    textTransform: "uppercase",
    color: "rgba(20,33,61,0.65)",
  },
  teamCell: {
    fontWeight: "700",
  },
});

export default StandingsTable;
