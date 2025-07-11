// ...existing code...
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, SectionList, ActivityIndicator, Alert, RefreshControl, TextInput } from 'react-native';
import { supabase } from '../supabase/client';
import UserListItem from '../components/UserListItem';
import AdminServiceListItem from '../components/AdminServiceListItem';
import { useDebounce } from '../hooks/useDebounce';

const AdminPanelScreen = () => {
  const [users, setUsers] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebounce(searchQuery, 500);

  const fetchData = useCallback(async (query) => {
    setLoading(true);
    try {
      let usersQuery = supabase.from('profiles').select('*').order('username', { ascending: true });
      let servicesQuery = supabase.from('services').select('*, profiles(username)').order('created_at', { ascending: false });

      if (query) {
        // Search users by username or full name
        usersQuery = usersQuery.or(`username.ilike.%${query}%,full_name.ilike.%${query}%`);
        // Search services by title
        servicesQuery = servicesQuery.or(`title.ilike.%${query}%`);
      }

      const [usersRes, servicesRes] = await Promise.all([
        usersQuery,
        servicesQuery,
      ]);

      if (usersRes.error) throw usersRes.error;
      if (servicesRes.error) throw servicesRes.error;

      setUsers(usersRes.data);
      setServices(servicesRes.data);
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch admin data.');
      console.error('Error fetching admin data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData(debouncedSearch);
  }, [fetchData, debouncedSearch]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData(debouncedSearch);
  };

  const handleManageUser = (user) => {
    Alert.alert(
      `Manage ${user.username}`,
      'Select a new role for this user.',
      [
        { text: 'Make Admin', onPress: () => updateUserRole(user.id, 'admin') },
        { text: 'Make Premium', onPress: () => updateUserRole(user.id, 'premium') },
        { text: 'Make Free', onPress: () => updateUserRole(user.id, 'free') },
        { text: 'Ban User', onPress: () => showBanOptions(user), style: 'destructive' },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const updateUserRole = async (target_user_id, new_role) => {
    const originalUsers = [...users];
    // Optimistically update the UI for a faster user experience
    setUsers(currentUsers =>
      currentUsers.map(u =>
        u.id === target_user_id ? { ...u, role: new_role } : u
      )
    );

    const { error } = await supabase.functions.invoke('set-user-role', {
      body: { target_user_id, new_role },
    });

    if (error) {
      Alert.alert('Error', `Failed to update role: ${error.message}`);
      // If the update fails, revert to the original state
      setUsers(originalUsers);
    } else {
      Alert.alert('Success', 'User role updated.');
      // No need to re-fetch, the UI is already updated.
      // You could optionally call fetchUsers() here to ensure data consistency.
    }
  };

  const showBanOptions = (user) => {
    Alert.alert(
      `Ban ${user.username}`,
      'Select ban duration.',
      [
        { text: 'Ban for 1 Day', onPress: () => banUser(user.id, 24) },
        { text: 'Ban for 7 Days', onPress: () => banUser(user.id, 24 * 7) },
        { text: 'Ban Permanently', onPress: () => banUser(user.id, 'infinity'), style: 'destructive' },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const banUser = async (target_user_id, ban_duration_hours) => {
    const { error } = await supabase.functions.invoke('ban-user', {
      body: { target_user_id, ban_duration_hours },
    });

    if (error) {
      Alert.alert('Error', `Failed to ban user: ${error.message}`);
    } else {
      Alert.alert('Success', 'User has been banned.');
      // We don't need to refresh the list here, as the ban status isn't visible
      // in the admin panel UI itself (it's on the auth.users table).
      // The user will be logged out on their next session check.
    }
  };

  const handleDeleteService = (service) => {
    Alert.alert(
      'Delete Service',
      `Are you sure you want to delete "${service.title}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const { error } = await supabase.functions.invoke('delete-service', {
              body: { service_id: service.id },
            });

            if (error) {
              Alert.alert('Error', `Failed to delete service: ${error.message}`);
            } else {
              Alert.alert('Success', 'Service has been deleted.');
              setServices(currentServices => currentServices.filter(s => s.id !== service.id));
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return <View className="flex-1 justify-center items-center"><ActivityIndicator size="large" color="#007AFF" /></View>;
  }

  const sections = [
    { title: 'User Management', data: users, renderItem: ({ item }) => <UserListItem user={item} onManagePress={handleManageUser} /> },
    { title: 'Service Management', data: services, renderItem: ({ item }) => <AdminServiceListItem service={item} onDeletePress={handleDeleteService} /> },
  ];

  return (
    <SectionList
      sections={sections}
      keyExtractor={(item) => item.id}
      renderItem={(props) => props.section.renderItem(props)}
      ListHeaderComponent={
        <TextInput
          placeholder="Search users or services..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          className="bg-white p-3 rounded-lg mb-4 border border-gray-200"
        />
      }
      renderSectionHeader={({ section: { title } }) => (
        <Text className="text-3xl font-bold mt-6 mb-4 text-gray-800 bg-gray-100 pt-2">{title}</Text>
      )}
      contentContainerStyle={{ paddingHorizontal: 16 }}
      className="bg-gray-100"
      stickySectionHeadersEnabled={false}
      ListEmptyComponent={() => <View className="flex-1 justify-center items-center mt-20"><Text className="text-lg text-gray-500">No data found.</Text></View>}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    />
  );
};

export default AdminPanelScreen;
// ...existing code...
