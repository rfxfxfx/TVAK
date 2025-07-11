// ...existing code...
import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, ActivityIndicator, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { supabase } from '../supabase/client';
import CourseCard from '../components/CourseCard';

const TrainingScreen = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true); // Start loading initially

  // useFocusEffect is perfect for re-fetching data when a user navigates back to the screen.
  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      const fetchCourses = async () => {
        setLoading(true);
        try {
          const { data, error } = await supabase.rpc('get_courses_with_progress');

          if (isActive) {
            if (error) throw error;
            setCourses(data);
          }
        } catch (error) {
          if (isActive) {
            Alert.alert('Error', 'Failed to fetch courses.');
            console.error('Error fetching courses:', error);
          }
        } finally {
          if (isActive) {
            setLoading(false);
          }
        }
      };

      fetchCourses();

      return () => {
        isActive = false; // Cleanup to prevent state updates on an unmounted component
      };
    }, [])
  );

  if (loading) {
    return <View className="flex-1 justify-center items-center"><ActivityIndicator size="large" color="#007AFF" /></View>;
  }

  return (
    <FlatList
      data={courses}
      keyExtractor={(item) => item.id.toString()}
      renderItem={({ item }) => <CourseCard course={item} />}
      contentContainerStyle={{ padding: 16, backgroundColor: '#f0f0f0' }}
      ListHeaderComponent={() => <Text className="text-3xl font-bold mb-4 text-gray-800">Training Modules</Text>}
      ListEmptyComponent={() => <View className="flex-1 justify-center items-center mt-20"><Text className="text-lg text-gray-500">No courses available yet.</Text></View>}
    />
  );
};

export default TrainingScreen;
// ...existing code...
