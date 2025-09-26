import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { palette } from "../theme/colors";
import { format } from "date-fns";

const formatDate = (value) => {
  try {
    return format(new Date(value), "EEE, MMM d • h:mm a");
  } catch (error) {
    return value;
  }
};

const FixtureCard = ({ fixture, homeTeam, awayTeam, onEdit, onDelete, onRecord }) => {
  const isCompleted = fixture.status === "completed";
  return (
    <View style={[styles.card, isCompleted ? styles.completed : styles.upcoming]}>
      <View style={styles.row}>
        <Text style={styles.venue}>{fixture.venue}</Text>
        <Text style={styles.date}>{formatDate(fixture.date)}</Text>
      </View>
      <View style={styles.scoreRow}>
        <Text style={styles.teamName}>{homeTeam?.name}</Text>
        <View style={styles.scoreBubble}>
          <Text style={styles.scoreText}>
            {isCompleted ? `${fixture.result?.home} : ${fixture.result?.away}` : "vs"}
          </Text>
        </View>
        <Text style={styles.teamName}>{awayTeam?.name}</Text>
      </View>
      <View style={styles.actions}>
        <TouchableOpacity style={styles.action} onPress={onEdit}>
          <Text style={styles.actionText}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.action} onPress={onRecord}>
          <Text style={styles.actionText}>{isCompleted ? "Update Result" : "Record Result"}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.action, styles.delete]} onPress={onDelete}>
          <Text style={[styles.actionText, styles.deleteText]}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 24,
    padding: 16,
    marginBottom: 16,
    backgroundColor: "#fff",
    borderWidth: 2,
  },
  upcoming: {
    borderColor: palette.sky,
  },
  completed: {
    borderColor: palette.lime,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  venue: {
    fontSize: 14,
    fontWeight: "600",
    color: palette.navy,
  },
  date: {
    fontSize: 13,
    color: "rgba(20,33,61,0.6)",
  },
  scoreRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginVertical: 16,
  },
  teamName: {
    flex: 0.3,
    fontSize: 15,
    fontWeight: "600",
    color: palette.navy,
  },
  scoreBubble: {
    flex: 0.4,
    backgroundColor: palette.sunshine,
    paddingVertical: 8,
    borderRadius: 20,
    alignItems: "center",
  },
  scoreText: {
    fontSize: 16,
    fontWeight: "700",
    color: palette.navy,
  },
  actions: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  action: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 16,
    marginHorizontal: 4,
    alignItems: "center",
    backgroundColor: "rgba(20,33,61,0.08)",
  },
  actionText: {
    fontSize: 13,
    fontWeight: "600",
    color: palette.navy,
  },
  delete: {
    backgroundColor: "rgba(255,107,107,0.15)",
  },
  deleteText: {
    color: palette.coral,
  },
});

export default FixtureCard;
