// ...existing code...
import React, { useState, useEffect } from 'react';
import { View, Text, Button, TextInput, Alert, ActivityIndicator, ScrollView, Switch } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Avatar from '../components/Avatar';
import { supabase } from '../supabase/client';
import { useAuth } from '../context/AuthContext';
import { signOut } from '../utils/auth';
import { useColorScheme } from '../hooks/useColorScheme';

const ProfileScreen = () => {
  const { session, profile, isAdmin, refreshProfile } = useAuth();
  const navigation = useNavigation();
  const [isUpdating, setIsUpdating] = useState(false);

  // State is now derived directly from the AuthContext's profile object
  const { colorScheme, setColorScheme } = useColorScheme();
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url || '');
  const [username, setUsername] = useState(profile?.username || '');
  const [fullName, setFullName] = useState(profile?.full_name || '');

  // Update local state if the profile from the context changes
  useEffect(() => {
    if (profile) {
      setAvatarUrl(profile.avatar_url || '');
      setUsername(profile.username || '');
      setFullName(profile.full_name || '');
    }
  }, [profile]);

  const updateProfile = async ({ username, full_name, avatar_url }, showAlert = true) => {
    try {
      setIsUpdating(true);
      if (!session?.user) throw new Error('No user on the session!');

      const updates = {
        id: session.user.id,
        username: username,
        full_name: full_name,
        avatar_url: avatar_url,
        updated_at: new Date(),
      };

      const { error } = await supabase.from('profiles').upsert(updates);

      if (error) throw error;
      if (showAlert) {
        await refreshProfile(); // Refresh the global profile state
        Alert.alert('Success', 'Profile updated successfully!');
      }
    } catch (error) {
      Alert.alert('Error updating profile', error.message);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleAvatarUpload = async (asset) => {
    try {
      setIsUpdating(true); // Use the same updating state for avatar upload
      if (!session?.user) throw new Error('No user on the session!');

      // The expo-image-picker asset URI needs to be fetched and converted to a blob.
      const response = await fetch(asset.uri);
      const blob = await response.blob();

      const fileExt = asset.uri.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `${session.user.id}/${fileName}`;

      // The Supabase client's `upload` method expects a blob, not FormData.
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, blob, {
          contentType: asset.mimeType,
          upsert: true, // Overwrite file if it exists
        });

      if (uploadError) {
        throw uploadError;
      }

      // Optimistically update the state to show the new avatar immediately.
      setAvatarUrl(filePath);
      // Update the user's profile with the new avatar path.
      await updateProfile({
        username,
        full_name: fullName,
        avatar_url: filePath,
      }, false); // Pass false to prevent the success alert on avatar upload
    } catch (error) {
      Alert.alert('Upload Error', error.message);
    } finally {
      setIsUpdating(false);
    }
  };

  const publicAvatarUrl = React.useMemo(() => {
    if (!avatarUrl) return null;
    // The getPublicUrl method correctly constructs the full URL.
    const { data } = supabase.storage.from('avatars').getPublicUrl(avatarUrl);
    return data?.publicUrl;
  }, [avatarUrl]);

  if (!profile) {
    return <View className="flex-1 justify-center items-center"><ActivityIndicator size="large" /></View>;
  }

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }} className="bg-white dark:bg-black">
      <View className="items-center p-5">
        <Avatar
          url={publicAvatarUrl}
          size={150}
          onUpload={handleAvatarUpload}
          uploading={isUpdating}
        />
        <Text className="text-2xl font-bold mb-2 text-black dark:text-white">Profile</Text>
        <Text className="text-base text-gray-500 dark:text-gray-400 mb-5">{session?.user?.email}</Text>
        <TextInput className="w-full h-10 border border-gray-300 dark:border-gray-600 rounded-md px-3 mb-3 text-black dark:text-white" placeholderTextColor="gray" placeholder="Username" value={username} onChangeText={setUsername} autoCapitalize="none" />
        <TextInput className="w-full h-10 border border-gray-300 dark:border-gray-600 rounded-md px-3 mb-3 text-black dark:text-white" placeholderTextColor="gray" placeholder="Full Name" value={fullName} onChangeText={setFullName} />
        <View className="mt-2 w-full">
          <Button title={isUpdating ? 'Updating...' : 'Update Profile'} onPress={() => updateProfile({ username, full_name: fullName, avatar_url: avatarUrl }, true)} disabled={isUpdating} />
        </View>
        <View className="flex-row justify-between items-center mt-6 w-full">
          <Text className="text-lg text-black dark:text-white">Dark Mode</Text>
          <Switch
            value={colorScheme === 'dark'}
            onValueChange={(isDark) => setColorScheme(isDark ? 'dark' : 'light')}
          />
        </View>
        {isAdmin && (
          <View className="mt-4 w-full">
            <Button title="Admin Panel" onPress={() => navigation.navigate('AdminPanel')} color="#5856D6" />
          </View>
        )}
        <View className="mt-4 w-full">
          <Button title="Sign Out" onPress={() => signOut()} color="#FF3B30" />
        </View>
      </View>
    </ScrollView>
  );
};

export default ProfileScreen;
// ...existing code...
