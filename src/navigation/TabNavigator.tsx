import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import * as NavigationBar from 'expo-navigation-bar';
import { useEffect } from 'react';
import { Platform, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import HomeScreen from '../screens/HomeScreen';
import ReciclarScreen from '../screens/ReciclarScreen';
import RankingScreen from '../screens/RankingScreen';
import { RootTabParamList } from '../types/navigation';
import TelaInformativo from '../screens/InfoScreen';

const Tab = createBottomTabNavigator<RootTabParamList>();

export default function TabNavigator() {
  useEffect(() => {
    if (Platform.OS === 'android') {
      NavigationBar.setVisibilityAsync("hidden");
      NavigationBar.setBehaviorAsync("overlay-swipe"); // Permite gestos
    }
  }, []);

  return (
    <NavigationContainer>
      <StatusBar style="light" translucent backgroundColor="transparent" />

      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarStyle: styles.tabBar,
          tabBarActiveTintColor: '#2e7d32',
          tabBarInactiveTintColor: '#95a5a6',
          tabBarLabelStyle: styles.tabBarLabel,
        }}
      >
        <Tab.Screen
          name="Home"
          component={HomeScreen}
          options={{
            tabBarIcon: ({ color, size }) => (
              <Icon name="home" color={color} size={size} />
            ),
          }}
        />
        <Tab.Screen
          name="Reciclar"
          component={ReciclarScreen}
          options={{
            tabBarIcon: ({ color, size }) => (
              <Icon name="recycle" color={color} size={size} />
            ),
          }}
        />
        
        <Tab.Screen
          name="Ranking"
          component={RankingScreen}
          options={{
            tabBarIcon: ({ color, size }) => (
              <Icon name="trophy" color={color} size={size} />
            ),
          }}
        />

         <Tab.Screen
          name="Info"
          component={TelaInformativo}
          options={{
            tabBarIcon: ({ color, size }) => (
              <Icon name="book" color={color} size={size} />
            ),
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: '#f8fff8',
    borderTopWidth: 0,
    height: 60,
    paddingBottom: 8,
  },
  tabBarLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
});