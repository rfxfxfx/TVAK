import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const AIMessageBubble = ({ message, onRetry }) => {
  const isAssistant = message.role === 'assistant';
  const hasError = !!message.error;

  return (
    <View className={`flex-row items-start p-3 my-1 max-w-[90%] ${isAssistant ? 'self-start' : 'self-end'}`}>
      {isAssistant && (
        <View className="w-10 h-10 rounded-full bg-blue-500 justify-center items-center mr-3">
          <Ionicons name="sparkles" size={20} color="white" />
        </View>
      )}
      <View className={`rounded-2xl px-4 py-3 ${isAssistant ? 'bg-gray-200' : 'bg-blue-500'} ${hasError ? 'bg-red-100 border border-red-300' : ''}`}>
        <Text className={`text-base ${isAssistant ? 'text-gray-800' : 'text-white'}`}>{message.content}</Text>
        {hasError && (
          <TouchableOpacity onPress={onRetry} className="mt-2 flex-row items-center">
            <Ionicons name="refresh" size={16} color="#DC2626" />
            <Text className="ml-1 text-red-600 font-semibold">Retry</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

export default AIMessageBubble;