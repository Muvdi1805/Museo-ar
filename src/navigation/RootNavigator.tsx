import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import React from "react";

import ArViewerScreen from "../features/ar-museum/presentation/screens/ArViewerScreen";
import PlaceArtworkScreen from "../features/ar-museum/presentation/screens/PlaceArtworkScreen";
import HomeScreen from "../features/home/HomeScreen";
import { RootStackParamList, TabParamList } from "./types";

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

function Tabs() {
  return (
    <Tab.Navigator>
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          title: "Inicio",
          tabBarIcon: ({ color, size }) => <MaterialCommunityIcons name="home" color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name="ArMuseum"
        component={ArViewerScreen}
        options={{
          title: "Museo AR",
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="rotate-3d-variant" color={color} size={size} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

export default function RootNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Tabs" component={Tabs} options={{ headerShown: false }} />
      <Stack.Screen
        name="PlaceArtwork"
        component={PlaceArtworkScreen}
        options={{ title: "Nueva obra", presentation: "modal" }}
      />
    </Stack.Navigator>
  );
}
