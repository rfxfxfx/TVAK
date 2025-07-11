import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { useAuth } from '../context/AuthContext';

const MessageBubble = ({ message, onDelete }) => {
  const { session } = useAuth();
  const isCurrentUser = message.profile_id === session?.user?.id;

  // Fallback for profiles that might not exist or be fetched yet
  const avatarUrl = message.profiles?.avatar_url
    ? `${process.env.EXPO_PUBLIC_SUPABASE_URL}/storage/v1/object/public/avatars/${message.profiles.avatar_url}`
    : 'https://placehold.co/64x64/EEE/31343C?text=VAI';

  const username = message.profiles?.username || 'User';

  const handleLongPress = () => {
    if (isCurrentUser && onDelete) {
      onDelete(message);
    }
  };

  return (
    <TouchableOpacity onLongPress={handleLongPress} disabled={!isCurrentUser} activeOpacity={0.8}>
      <View className={`flex-row items-start p-3 my-1 ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
        {!isCurrentUser && <Image source={{ uri: avatarUrl }} className="w-10 h-10 rounded-full mr-3" />}
        <View className={`max-w-[80%] rounded-2xl px-4 py-2 ${isCurrentUser ? 'bg-blue-500' : 'bg-gray-200'}`}>
          {!isCurrentUser && <Text className="font-bold mb-1 text-gray-700">{username}</Text>}
          <Text className={`text-base ${isCurrentUser ? 'text-white' : 'text-gray-800'}`}>{message.content}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default MessageBubble;