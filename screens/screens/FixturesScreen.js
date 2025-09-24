import React, {useEffect, useState} from "react";
import { View, Text, FlatList, Button, StyleSheet, ActivityIndicator } from "react-native";
import axios from "axios";

const API_BASE = "http://192.168.X.Y:4000";

export default function FixturesScreen({route, navigation}) {
  const { leagueId } = route.params;
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`${API_BASE}/matches?league_id=${leagueId}`)
      .then(res => setMatches(res.data))
      .catch(err => alert("Could not fetch matches: " + err.message))
      .finally(()=>setLoading(false));
  }, [leagueId]);

  if(loading) return <View style={{flex:1,justifyContent:"center"}}><ActivityIndicator size="large"/></View>;

  return (
    <View style={{flex:1,padding:12}}>
      <FlatList
        data={matches}
        keyExtractor={(item)=>item.id.toString()}
        renderItem={({item}) => (
          <View style={styles.match}>
            <Text style={styles.title}>Match #{item.id}</Text>
            <Text>{item.team_home_id} vs {item.team_away_id}</Text>
            <Text>{new Date(item.scheduled_at).toLocaleString()}</Text>
            <Text>{item.field_location}</Text>
            <Text>Score: {item.score_home} - {item.score_away}</Text>
            <View style={{flexDirection:"row",marginTop:8}}>
              <Button title="Report score" onPress={()=>navigation.navigate("ReportScore",{matchId:item.id})}/>
            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  match:{padding:12,borderWidth:1,borderRadius:8,marginVertical:8},
  title:{fontSize:15,fontWeight:"600"}
});
