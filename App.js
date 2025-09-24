import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import HomeScreen from "./screens/HomeScreen";
import AuthScreen from "./screens/AuthScreen";
import FixturesScreen from "./screens/FixturesScreen";
import ReportScoreScreen from "./screens/ReportScoreScreen";

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Auth">
        <Stack.Screen name="Auth" component={AuthScreen} options={{headerShown:false}} />
        <Stack.Screen name="Home" component={HomeScreen} options={{title:"Nearby leagues"}} />
        <Stack.Screen name="Fixtures" component={FixturesScreen} options={{title:"Fixtures"}} />
        <Stack.Screen name="ReportScore" component={ReportScoreScreen} options={{title:"Report score"}} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
