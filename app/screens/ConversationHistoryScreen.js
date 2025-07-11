import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, ActivityIndicator, Alert, RefreshControl } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { supabase } from '../supabase/client';
import ConversationListItem from '../components/ConversationListItem';

const ConversationHistoryScreen = () => {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchConversations = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('ai_conversations')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setConversations(data);
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch conversation history.');
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      const loadData = () => {
        setLoading(true);
        fetchConversations();
      };
      loadData();
    }, [fetchConversations])
  );

  if (loading) {
    return <View className="flex-1 justify-center items-center"><ActivityIndicator size="large" /></View>;
  }

  return (
    <FlatList
      data={conversations}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => <ConversationListItem conversation={item} />}
      contentContainerStyle={{ padding: 16, backgroundColor: '#f0f0f0' }}
      ListHeaderComponent={() => <Text className="text-3xl font-bold mb-4 text-gray-800">Conversation History</Text>}
      ListEmptyComponent={() => <View className="flex-1 justify-center items-center mt-20"><Text className="text-lg text-gray-500">No conversations yet.</Text></View>}
      refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchConversations} />}
    />
  );
};

export default ConversationHistoryScreen;