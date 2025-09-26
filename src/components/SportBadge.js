import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { sportBadges } from "../theme/colors";

const SportBadge = ({ sport }) => {
  const config = sportBadges[sport] || { label: sport, emoji: "⭐", accent: "#ccc" };
  return (
    <View style={[styles.container, { backgroundColor: config.accent }]}>
      <Text style={styles.emoji}>{config.emoji}</Text>
      <Text style={styles.label}>{config.label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  emoji: {
    fontSize: 16,
    marginRight: 6,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: "#fff",
  },
});

export default SportBadge;
