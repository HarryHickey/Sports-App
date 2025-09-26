import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { palette } from "../theme/colors";

const SectionHeader = ({ title, subtitle, rightContent }) => (
  <View style={styles.container}>
    <View>
      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
    {rightContent ? <View style={styles.right}>{rightContent}</View> : null}
  </View>
);

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: palette.navy,
  },
  subtitle: {
    fontSize: 14,
    color: "rgba(20,33,61,0.7)",
    marginTop: 4,
  },
  right: {
    marginLeft: 12,
  },
});

export default SectionHeader;
