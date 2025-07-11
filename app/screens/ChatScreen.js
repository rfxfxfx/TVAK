// ...existing code...
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, FlatList, TextInput, Button, Alert, ActivityIndicator, KeyboardAvoidingView, Platform, RefreshControl } from 'react-native';
import { supabase } from '../supabase/client';
import { useAuth } from '../context/AuthContext';
import MessageBubble from '../components/MessageBubble';

const ChatScreen = () => {
  const { session } = useAuth();
  const flatListRef = useRef(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchMessages = useCallback(async () => {
    const { data, error } = await supabase
      .from('messages')
      .select('*, profiles(username, avatar_url)')
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      Alert.alert('Error', 'Could not fetch messages');
    } else {
      setMessages(data.reverse());
    }
    setLoading(false);
    setRefreshing(false);
  }, []);

  useEffect(() => {
    fetchMessages();

    const channel = supabase
      .channel('public:messages')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, async (payload) => {
        const { data: profileData, error } = await supabase
          .from('profiles')
          .select('username, avatar_url')
          .eq('id', payload.new.profile_id)
          .single();
        
        if (error) {
          console.error("Error fetching profile for new message:", error);
        } else {
          const messageWithProfile = { ...payload.new, profiles: profileData };
          setMessages((currentMessages) => [...currentMessages, messageWithProfile]);
        }
      })
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'messages' }, (payload) => {
        // When a message is deleted, remove it from the local state.
        // The `old` object in the payload contains the data of the deleted row.
        setMessages((currentMessages) => currentMessages.filter(msg => msg.id !== payload.old.id));
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchMessages]);

  // Scroll to the bottom when messages change
  useEffect(() => {
    flatListRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  const handleSendMessage = async () => {
    if (newMessage.trim().length === 0) return;

    const { error } = await supabase
      .from('messages')
      .insert({ profile_id: session.user.id, content: newMessage.trim() });

    if (error) {
      Alert.alert('Error', 'Could not send message');
    } else {
      setNewMessage('');
    }
  };

  const handleDeleteMessage = (message) => {
    Alert.alert(
      'Delete Message',
      'Are you sure you want to delete this message? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const { error } = await supabase
              .from('messages')
              .delete()
              .eq('id', message.id);

            if (error) {
              Alert.alert('Error', 'Could not delete message.');
            }
          },
        },
      ]
    );
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchMessages();
  }, [fetchMessages]);

  if (loading) {
    return <View className="flex-1 justify-center items-center"><ActivityIndicator size="large" /></View>;
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1 bg-white" keyboardVerticalOffset={90}>
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={({ item }) => <MessageBubble message={item} onDelete={handleDeleteMessage} />}
        keyExtractor={(item) => item.id.toString()}
        className="flex-1 p-2"
        contentContainerStyle={{ paddingBottom: 10 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: false })}
      />
      <View className="flex-row items-center p-2 border-t border-gray-200">
        <TextInput
          value={newMessage}
          onChangeText={setNewMessage}
          placeholder="Type a message..."
          className="flex-1 bg-gray-100 rounded-full px-4 py-2 mr-2"
        />
        <Button title="Send" onPress={handleSendMessage} />
      </View>
    </KeyboardAvoidingView>
  );
};

export default ChatScreen;
// ...existing code...
