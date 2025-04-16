import React from 'react';
import { SQLiteProvider } from 'expo-sqlite';
import TabNavigator from './src/navigation/TabNavigator';
import { StatusBar } from 'expo-status-bar';
import { Platform, StyleSheet, View, Text } from 'react-native';
import useImmersiveMode from './src/hooks/useImmersiveMode'; 




export default function App() {
  useImmersiveMode();

  return (
    <SQLiteProvider databaseName="reciclaapp.db">
      <View style={styles.container}>
        <TabNavigator />
      </View>
    </SQLiteProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? 0 : 0, 
  }
});