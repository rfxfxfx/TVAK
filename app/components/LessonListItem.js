import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const LessonListItem = ({ lesson, onToggleComplete }) => {
  return (
    <TouchableOpacity
      className="flex-row items-center bg-white p-4 mx-4 mb-2 rounded-lg shadow-sm active:bg-gray-200"
      onPress={onToggleComplete}
    >
      <Ionicons
        name={lesson.is_completed ? 'checkmark-circle' : 'ellipse-outline'}
        size={24}
        color={lesson.is_completed ? '#34D399' : '#9CA3AF'}
      />
      <Text className="flex-1 ml-4 text-base text-gray-800">{lesson.title}</Text>
    </TouchableOpacity>
  );
};

export default LessonListItem;