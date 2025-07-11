import 'react-native-reanimated'; // This must be the first import
import * as React from 'react';
import { useColorScheme as useNativewindColorScheme } from "nativewind";
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { AuthProvider, useAuth } from './app/context/AuthContext';

import TabNavigator from './app/navigation/TabNavigator';
import LoginScreen from './app/screens/LoginScreen';
import SubscriptionScreen from './app/screens/SubscriptionScreen';
import CreateServiceScreen from './app/screens/CreateServiceScreen';
import EditServiceScreen from './app/screens/EditServiceScreen';
import CourseDetailScreen from './app/screens/CourseDetailScreen';
import ConversationHistoryScreen from './app/screens/ConversationHistoryScreen';
import ProfileScreen from './app/screens/ProfileScreen';
import AdminPanelScreen from './app/screens/AdminPanelScreen';




const Stack = createNativeStackNavigator();

const AppNavigator = () => {
  const { session, loading, isAdmin } = useAuth();
  const { setColorScheme } = useNativewindColorScheme();

  React.useEffect(() => {
    const loadColorScheme = async () => {
      const storedScheme = await AsyncStorage.getItem('colorScheme');
      if (storedScheme) {
        setColorScheme(storedScheme);
      }
    };
    loadColorScheme();
  }, [setColorScheme]);

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <Stack.Navigator>
      {session && session.user ? (
        <>
          <Stack.Screen name="VAI" component={TabNavigator} options={{ headerShown: false }} />
          <Stack.Screen name="Profile" component={ProfileScreen} />
          <Stack.Screen name="CourseDetail" component={CourseDetailScreen} options={({ route }) => ({ title: route.params.course.title })} />
          <Stack.Screen name="Subscription" component={SubscriptionScreen} />
          <Stack.Screen name="CreateService" component={CreateServiceScreen} options={{ title: 'List a Service' }} />
          <Stack.Screen name="EditService" component={EditServiceScreen} options={{ title: 'Edit Service' }} />
          <Stack.Screen name="ConversationHistory" component={ConversationHistoryScreen} options={{ title: 'History' }} />
          {isAdmin && (
            <Stack.Screen name="AdminPanel" component={AdminPanelScreen} />
          )}
        </>
      ) : (
        <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
      )}
    </Stack.Navigator>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <NavigationContainer>
        <AppNavigator />
        <StatusBar style="auto" />
      </NavigationContainer>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
