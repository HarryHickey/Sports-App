import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { palette } from "../theme/colors";

const SegmentedControl = ({ segments, value, onChange }) => {
  return (
    <View style={styles.container}>
      {segments.map((segment) => {
        const active = value === segment.value;
        return (
          <TouchableOpacity
            key={segment.value}
            style={[styles.segment, active && styles.segmentActive]}
            onPress={() => onChange(segment.value)}
          >
            <Text style={[styles.label, active && styles.labelActive]}>{segment.label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    backgroundColor: "rgba(20,33,61,0.08)",
    borderRadius: 18,
    padding: 4,
    marginVertical: 16,
  },
  segment: {
    flex: 1,
    borderRadius: 14,
    paddingVertical: 10,
    alignItems: "center",
  },
  segmentActive: {
    backgroundColor: palette.sunshine,
    shadowColor: palette.sunshine,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 2,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "rgba(20,33,61,0.7)",
  },
  labelActive: {
    color: palette.navy,
  },
});

export default SegmentedControl;
