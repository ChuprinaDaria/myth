import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {createStackNavigator} from '@react-navigation/stack';
import {StatusBar} from 'react-native';
import HomeScreen from './src/screens/HomeScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import AboutScreen from './src/screens/AboutScreen';
import EventScreen from './src/screens/EventScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

function EventsStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Головна" component={HomeScreen} />
      <Stack.Screen name="Подія" component={EventScreen} />
    </Stack.Navigator>
  );
}

export default function App(): React.JSX.Element {
  return (
    <NavigationContainer>
      <StatusBar barStyle="dark-content" />
      <Tab.Navigator>
        <Tab.Screen name="Календар" component={EventsStack} options={{ headerShown: false }} />
        <Tab.Screen name="Налаштування" component={SettingsScreen} />
        <Tab.Screen name="Про застосунок" component={AboutScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

