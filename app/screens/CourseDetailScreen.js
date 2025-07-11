import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, ActivityIndicator, Alert, Image, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { supabase } from '../supabase/client';
import { useAuth } from '../context/AuthContext';
import LessonListItem from '../components/LessonListItem';
import { Ionicons } from '@expo/vector-icons';

const CourseDetailScreen = ({ route }) => {
  const { course } = route.params;
  const { session, isPremium } = useAuth();
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();
  const isCourseLocked = course.is_premium && !isPremium;

  const fetchLessons = useCallback(async () => {
    if (!session?.user) return;

    try {
      // Fetch lessons and join with user_progress to see if the current user has completed it.
      const { data, error } = await supabase
        .from('lessons')
        .select(`
          *,
          user_progress ( user_id )
        `)
        .eq('course_id', course.id)
        .eq('user_progress.user_id', session.user.id)
        .order('order', { ascending: true });

      if (error) throw error;

      // Map the data to a more usable format with an `is_completed` boolean.
      const lessonsWithCompletion = data.map(lesson => ({
        ...lesson,
        is_completed: lesson.user_progress.length > 0,
      }));
      setLessons(lessonsWithCompletion);

    } catch (error) {
      Alert.alert('Error', 'Failed to fetch lessons.');
      console.error('Error fetching lessons:', error);
    } finally {
      setLoading(false);
    }
  }, [course.id, session?.user]);

  useEffect(() => {
    fetchLessons();
  }, [fetchLessons]);

  const handleToggleLesson = async (lesson) => {
    try {
      const isCompleted = lesson.is_completed;
      const { error } = isCompleted
        ? await supabase.from('user_progress').delete().match({ user_id: session.user.id, lesson_id: lesson.id })
        : await supabase.from('user_progress').insert({ user_id: session.user.id, lesson_id: lesson.id });

      if (error) throw error;
      fetchLessons(); // Re-fetch to update the UI
    } catch (error) {
      Alert.alert('Error', 'Failed to update lesson progress.');
      console.error('Error toggling lesson:', error);
    }
  };

  if (loading) {
    return <View className="flex-1 justify-center items-center"><ActivityIndicator size="large" color="#007AFF" /></View>;
  }

  if (isCourseLocked) {
    return (
      <View className="flex-1 justify-center items-center p-5 bg-gray-100">
        <Ionicons name="lock-closed" size={48} color="#FBBF24" />
        <Text className="text-xl font-bold mt-4 text-gray-800">Premium Content</Text>
        <Text className="text-base text-gray-600 mt-2 text-center">Upgrade to a Premium account to access this course.</Text>
        <TouchableOpacity
          className="mt-6 bg-blue-500 px-6 py-3 rounded-full shadow-lg"
          onPress={() => navigation.navigate('Subscription')}
        >
          <Text className="text-white font-bold text-base">Upgrade Now</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-100">
      <FlatList
        data={lessons}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <LessonListItem lesson={item} onToggleComplete={() => handleToggleLesson(item)} />
        )}
        ListHeaderComponent={
          <>
            <Image
              className="w-full h-48"
              source={{ uri: course.image_url || 'https://placehold.co/600x400/EEE/31343C?text=VAI' }}
              resizeMode="cover"
            />
            <View className="p-5">
              <Text className="text-2xl font-bold mb-2 text-gray-800">{course.title}</Text>
              <Text className="text-base text-gray-600 mb-6">{course.description}</Text>
              <Text className="text-xl font-semibold text-gray-700 mb-3">Lessons</Text>
            </View>
          </>
        }
        ListEmptyComponent={
          <View className="flex-1 justify-center items-center mt-10">
            <Text className="text-lg text-gray-500">No lessons in this course yet.</Text>
          </View>
        }
        contentContainerStyle={{ paddingBottom: 20 }}
      />
    </View>
  );
};

export default CourseDetailScreen;