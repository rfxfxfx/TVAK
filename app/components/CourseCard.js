import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native'; 

const CourseCard = ({ course }) => {
  const navigation = useNavigation();
  const progress = course.total_lessons > 0
    ? (course.completed_lessons / course.total_lessons) * 100
    : 0;

  return (
    <TouchableOpacity
      className="bg-white rounded-xl shadow-md overflow-hidden mb-4 active:opacity-75"
      onPress={() => navigation.navigate('CourseDetail', { course })}
    >
      <View>
        <Image
          className="w-full h-40"
          source={{ uri: course.image_url || 'https://placehold.co/600x400/EEE/31343C?text=VAI' }}
          resizeMode="cover"
        />
        {course.is_premium && (
          <View className="absolute top-2 right-2 bg-yellow-400 px-2 py-1 rounded-full">
            <Text className="text-xs font-bold text-yellow-900">PREMIUM</Text>
          </View>
        )}
      </View>
      <View className="p-4">
        <Text className="text-lg font-bold text-gray-800">{course.title}</Text>
        <Text className="mt-1 text-sm text-gray-600" numberOfLines={2}>{course.description}</Text> 
      </View>
      <View className="px-4 pb-4">
        <View className="bg-gray-200 h-2 rounded-full overflow-hidden">
          <View className="bg-blue-500 h-2 rounded-full" style={{ width: `${progress}%` }} />
        </View>
      </View>
    </TouchableOpacity>
  );
}; 

export default CourseCard;