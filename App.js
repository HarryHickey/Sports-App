import React from "react";
import { NavigationContainer, DefaultTheme } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import HomeScreen from "./src/screens/HomeScreen";
import LeagueScreen from "./src/screens/LeagueScreen";
import { DataProvider } from "./src/context/DataContext";
import { palette } from "./src/theme/colors";

const Stack = createNativeStackNavigator();

const navigationTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: "#f2f4ff",
    primary: palette.sunshine,
    card: "#f2f4ff",
  },
};

export default function App() {
  return (
    <DataProvider>
      <NavigationContainer theme={navigationTheme}>
        <Stack.Navigator>
          <Stack.Screen
            name="Home"
            component={HomeScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="League"
            component={LeagueScreen}
            options={({ route }) => ({
              title: route.params?.leagueName || "League",
              headerStyle: { backgroundColor: "#f2f4ff" },
              headerShadowVisible: false,
            })}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </DataProvider>
  );
}
