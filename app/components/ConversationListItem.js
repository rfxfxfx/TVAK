import React from 'react';
import { Text, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import dayjs from 'dayjs';

const ConversationListItem = ({ conversation }) => {
  const navigation = useNavigation();

  return (
    <TouchableOpacity
      className="bg-white p-4 mb-3 rounded-lg shadow-sm active:bg-gray-100"
      onPress={() => navigation.navigate('Assistant', { conversationId: conversation.id })}
    >
      <Text className="text-base font-semibold text-gray-800" numberOfLines={1}>{conversation.title || 'Untitled Conversation'}</Text>
      <Text className="text-sm text-gray-500 mt-1">{dayjs(conversation.created_at).format('MMM D, YYYY h:mm A')}</Text>
    </TouchableOpacity>
  );
};

export default ConversationListItem;