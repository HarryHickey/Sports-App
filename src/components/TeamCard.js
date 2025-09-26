import React from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { palette } from "../theme/colors";

const TeamCard = ({
  team,
  players,
  onAddPlayer,
  onEditTeam,
  onDeleteTeam,
  onRemovePlayer,
  children,
}) => {
  return (
    <View style={[styles.card, { borderColor: team.badgeColor || palette.sky }]}> 
      <View style={styles.header}>
        <View>
          <Text style={styles.name}>{team.name}</Text>
          <Text style={styles.playerCount}>{players.length} players</Text>
        </View>
        <View style={styles.actions}>
          <TouchableOpacity style={styles.actionButton} onPress={onEditTeam}>
            <Text style={styles.actionText}>Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.deleteButton]}
            onPress={onDeleteTeam}
          >
            <Text style={[styles.actionText, styles.deleteText]}>Delete</Text>
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.body}>
        {players.map((player) => (
          <View key={player.id} style={styles.playerRow}>
            <View>
              <Text style={styles.playerName}>{player.name}</Text>
              {player.position ? <Text style={styles.playerRole}>{player.position}</Text> : null}
            </View>
            {onRemovePlayer ? (
              <TouchableOpacity
                onPress={() => onRemovePlayer(player)}
                style={styles.removeButton}
              >
                <Text style={styles.removeText}>Remove</Text>
              </TouchableOpacity>
            ) : null}
          </View>
        ))}
      </View>
      <TouchableOpacity style={styles.addButton} onPress={onAddPlayer}>
        <Text style={styles.addButtonText}>➕ Add Player</Text>
      </TouchableOpacity>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 24,
    padding: 18,
    marginBottom: 18,
    borderWidth: 3,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  name: {
    fontSize: 18,
    fontWeight: "700",
    color: palette.navy,
  },
  playerCount: {
    marginTop: 4,
    color: "rgba(20,33,61,0.65)",
    fontSize: 12,
  },
  actions: {
    flexDirection: "row",
  },
  actionButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 14,
    backgroundColor: "rgba(93, 211, 243, 0.25)",
    marginLeft: 8,
  },
  deleteButton: {
    backgroundColor: "rgba(255, 107, 107, 0.15)",
  },
  actionText: {
    fontSize: 12,
    fontWeight: "600",
    color: palette.navy,
  },
  deleteText: {
    color: palette.coral,
  },
  body: {
    marginTop: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "rgba(20,33,61,0.1)",
    paddingTop: 12,
  },
  playerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 6,
  },
  playerName: {
    fontSize: 14,
    color: palette.navy,
  },
  playerRole: {
    fontSize: 12,
    color: "rgba(20,33,61,0.55)",
  },
  removeButton: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: "rgba(255, 107, 107, 0.2)",
  },
  removeText: {
    fontSize: 11,
    fontWeight: "700",
    color: palette.coral,
  },
  addButton: {
    marginTop: 14,
    backgroundColor: palette.sunshine,
    borderRadius: 16,
    paddingVertical: 10,
    alignItems: "center",
  },
  addButtonText: {
    fontSize: 14,
    fontWeight: "700",
    color: palette.navy,
  },
});

export default TeamCard;
