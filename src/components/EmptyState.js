import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { palette } from "../theme/colors";

const EmptyState = ({ emoji = "🧐", title, description }) => (
  <View style={styles.container}>
    <Text style={styles.emoji}>{emoji}</Text>
    <Text style={styles.title}>{title}</Text>
    {description ? <Text style={styles.description}>{description}</Text> : null}
  </View>
);

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(94,211,243,0.15)",
    borderRadius: 20,
    paddingVertical: 24,
    paddingHorizontal: 16,
  },
  emoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
    color: palette.navy,
    textAlign: "center",
  },
  description: {
    marginTop: 6,
    fontSize: 13,
    color: "rgba(20,33,61,0.7)",
    textAlign: "center",
  },
});

export default EmptyState;
