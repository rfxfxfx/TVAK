import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const UserListItem = ({ user, onManagePress }) => {
  const avatarUrl = user.avatar_url
    ? `${process.env.EXPO_PUBLIC_SUPABASE_URL}/storage/v1/object/public/avatars/${user.avatar_url}`
    : 'https://placehold.co/64x64/EEE/31343C?text=VAI';

  return (
    <View className="flex-row items-center bg-white p-3 mb-3 rounded-lg shadow-sm">
      <Image source={{ uri: avatarUrl }} className="w-12 h-12 rounded-full" />
      <View className="flex-1 ml-4">
        <Text className="text-base font-bold text-gray-800">{user.username || 'No Username'}</Text>
        <Text className="text-sm text-gray-500">{user.full_name || 'No Name'}</Text>
      </View>
      <TouchableOpacity onPress={() => onManagePress(user)} className="flex-row items-center bg-gray-200 px-3 py-2 rounded-full active:bg-gray-300">
        <Text className="text-xs font-semibold uppercase text-gray-700 mr-1">{user.role}</Text>
        <Ionicons name="ellipsis-vertical" size={14} color="#4B5563" />
      </TouchableOpacity>
    </View>
  );
};

export default UserListItem;