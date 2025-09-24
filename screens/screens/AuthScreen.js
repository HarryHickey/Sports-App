import React, {useState} from "react";
import { View, Text, TextInput, Button, StyleSheet } from "react-native";
import { auth } from "../firebaseConfig";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";

export default function AuthScreen({navigation}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function signUp() {
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      navigation.replace("Home");
    } catch (err) {
      alert(err.message);
    }
  }

  async function signIn() {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigation.replace("Home");
    } catch (err) {
      alert(err.message);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Local League</Text>
      <TextInput placeholder="Email" value={email} onChangeText={setEmail} style={styles.input}/>
      <TextInput placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry style={styles.input}/>
      <View style={styles.row}>
        <Button title="Sign in" onPress={signIn}/>
        <Button title="Sign up" onPress={signUp}/>
      </View>
      <View style={{marginTop:16}}>
        <Button title="Continue as guest" onPress={() => navigation.replace("Home")} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container:{flex:1,justifyContent:"center",padding:20},
  title:{fontSize:28,marginBottom:20,textAlign:"center"},
  input:{borderWidth:1,borderRadius:6,padding:10,marginVertical:8},
  row:{flexDirection:"row",justifyContent:"space-between"}
});
