// ...existing code...
import React from 'react';
import { View, Text, Button, Alert } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../supabase/client';

const SubscriptionScreen = () => {
  const { profile, session, refreshProfile } = useAuth();

  const handleUpgrade = () => {
    // In a real app, this would trigger a payment flow (e.g., with Stripe).
    // For now, we'll just manually update the user's role in the database for testing.
    Alert.alert(
      'Simulate Upgrade',
      'This would normally open a payment screen. For now, do you want to simulate a successful upgrade to Premium?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Upgrade',
          onPress: async () => {
            const { error } = await supabase
              .from('profiles')
              .update({ role: 'premium' })
              .eq('id', session.user.id);

            if (error) {
              Alert.alert('Error', 'Could not simulate upgrade.');
            } else {
              await refreshProfile(); // Refresh the profile in the context
              Alert.alert('Success!', 'You are now a Premium member!');
            }
          },
        },
      ]
    );
  };

  return (
    <View className="flex-1 items-center justify-center p-5 bg-gray-50">
      <Text className="text-3xl font-bold mb-2 text-gray-800">Subscription Status</Text>
      <Text className="text-xl font-semibold capitalize p-2 bg-blue-100 text-blue-800 rounded-md">
        {profile?.role || 'Free'} Member
      </Text>

      <View className="mt-8 w-full max-w-sm">
        {profile?.role === 'free' ? (
          <>
            <Text className="text-center text-base text-gray-600 mb-4">Upgrade to Premium to unlock all training modules and get a certified badge!</Text>
            <Button title="Upgrade to Premium" onPress={handleUpgrade} />
          </>
        ) : (
          <Text className="text-center text-base text-gray-600">Thank you for being a Premium member!</Text>
        )}
      </View>
    </View>
  );
};

export default SubscriptionScreen;
// ...existing code...
