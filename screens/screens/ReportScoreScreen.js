import React, {useEffect, useState} from "react";
import { View, Text, TextInput, Button, StyleSheet, ActivityIndicator } from "react-native";
import axios from "axios";

const API_BASE = "http://192.168.X.Y:4000";

export default function ReportScoreScreen({route, navigation}) {
  const { matchId } = route.params;
  const [match, setMatch] = useState(null);
  const [
