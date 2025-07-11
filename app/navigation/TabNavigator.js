import React from 'react';
import { Button, TouchableOpacity, View } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
 
import AssistantScreen from '../screens/AssistantScreen';
import TrainingScreen from '../screens/TrainingScreen';
import ChatScreen from '../screens/ChatScreen';
import MarketplaceScreen from '../screens/MarketplaceScreen';

const Tab = createBottomTabNavigator();

const TabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route, navigation }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
 
          if (route.name === 'Assistant') {
            iconName = focused ? 'sparkles' : 'sparkles-outline';
          } else if (route.name === 'Training') {
            iconName = focused ? 'barbell' : 'barbell-outline';
          } else if (route.name === 'Chat') {
            iconName = focused ? 'chatbubbles' : 'chatbubbles-outline';
          } else if (route.name === 'Marketplace') {
            iconName = focused ? 'storefront' : 'storefront-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: 'gray',
        headerLeft: () => (
          route.name === 'Assistant' && (
            <View style={{ flexDirection: 'row' }}>
              <TouchableOpacity onPress={() => navigation.navigate('ConversationHistory')} style={{ marginLeft: 16 }}>
                <Ionicons name="time-outline" size={24} color="#007AFF" />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => navigation.navigate('Assistant', { conversationId: null, key: Date.now() })} // Use key to force re-mount
                style={{ marginLeft: 16 }}
              >
                <Ionicons name="add-circle-outline" size={24} color="#007AFF" />
              </TouchableOpacity>
            </View>
          )
        ),
        headerRight: () => (
          <Button
            onPress={() => navigation.navigate('Profile')}
            title="Profile"
            color="#007AFF"
          />
        ),
      })}
    >
      <Tab.Screen name="Assistant" component={AssistantScreen} />
      <Tab.Screen name="Training" component={TrainingScreen} />
      <Tab.Screen name="Chat" component={ChatScreen} />
      <Tab.Screen name="Marketplace" component={MarketplaceScreen} />
    </Tab.Navigator>
  );
};

export default TabNavigator;