// ...existing code...
import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, ActivityIndicator, Alert, TouchableOpacity, RefreshControl, TextInput } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { supabase } from '../supabase/client';
import ServiceCard from '../components/ServiceCard';
import { Ionicons } from '@expo/vector-icons';
import { useDebounce } from '../hooks/useDebounce';

const MarketplaceScreen = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const navigation = useNavigation();
  const debouncedSearch = useDebounce(searchQuery, 500); // 500ms delay

  const fetchServices = useCallback(async (query) => {
    setLoading(true);
    try {
      let queryBuilder = supabase
        .from('services')
        .select('*, profiles(username, avatar_url)')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (query) {
        // Use .or() to search in both title and description
        // The % wildcards allow for partial matches
        queryBuilder = queryBuilder.or(`title.ilike.%${query}%,description.ilike.%${query}%`);
      }

      const { data, error } = await queryBuilder;

      if (error) throw error;
      setServices(data);
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch services.');
      console.error('Error fetching services:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // This effect re-runs when the screen is focused or when the debounced search term changes.
  useFocusEffect(
    useCallback(() => {
      const loadData = () => fetchServices(debouncedSearch);
      loadData();
    }, [debouncedSearch, fetchServices])
  );

  const handleDeleteService = (service) => {
    Alert.alert(
      'Delete Service',
      `Are you sure you want to permanently delete "${service.title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              // First, delete the image from storage if it exists
              if (service.image_url) {
                const { error: storageError } = await supabase.storage.from('services').remove([service.image_url]);
                if (storageError) throw storageError;
              }

              // Then, delete the service record from the database
              const { error: dbError } = await supabase.from('services').delete().eq('id', service.id);
              if (dbError) throw dbError;

              // Optimistically update the UI
              setServices(currentServices => currentServices.filter(s => s.id !== service.id));
              Alert.alert('Success', 'Your service has been deleted.');
            } catch (error) {
              Alert.alert('Error', `Failed to delete service: ${error.message}`);
            }
          },
        },
      ]
    );
  };

  // Only show the full-screen loader on the initial load when there are no services yet.
  if (loading && services.length === 0) {
    return <View className="flex-1 justify-center items-center"><ActivityIndicator size="large" color="#007AFF" /></View>;
  }

  return (
    <View className="flex-1 bg-gray-100">
      <FlatList
        data={services}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => <ServiceCard service={item} onDelete={handleDeleteService} />}
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16 }}
        ListHeaderComponent={
          <>
            <Text className="text-3xl font-bold mb-4 text-gray-800">Freelancer Marketplace</Text>
            <TextInput
              placeholder="Search for services..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              className="bg-white p-3 rounded-lg mb-4 border border-gray-200"
            />
          </>
        }
        ListEmptyComponent={() => <View className="flex-1 justify-center items-center mt-20"><Text className="text-lg text-gray-500">No services available yet.</Text></View>}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={() => fetchServices(debouncedSearch)} />}
      />
      <TouchableOpacity
        className="absolute bottom-6 right-6 bg-blue-500 w-14 h-14 rounded-full justify-center items-center shadow-lg"
        onPress={() => navigation.navigate('CreateService')}
      >
        <Ionicons name="add" size={32} color="white" />
      </TouchableOpacity>
    </View>
  );
};

export default MarketplaceScreen;
// ...existing code...
