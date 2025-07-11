import React, { useState, useRef, useEffect, useCallback } from 'react';
import { View, FlatList, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ActivityIndicator, Alert, Text } from 'react-native';
import { supabase } from '../supabase/client';
import { useAuth } from '../context/AuthContext';
import AIMessageBubble from '../components/AIMessageBubble';
import { Ionicons } from '@expo/vector-icons';

const AssistantScreen = ({ route }) => {
  const { session } = useAuth();
  const flatListRef = useRef(null);

  // Use route param if it exists, otherwise start a new conversation
  const initialConversationId = route.params?.conversationId;

  // Start with an empty array if loading a history, otherwise show the welcome message.
  const [messages, setMessages] = useState([
    ...(initialConversationId ? [] : [{ id: '1', role: 'assistant', content: 'Hello! I am your VAI assistant. How can I help you today?' }])
  ]);
  const [conversationId, setConversationId] = useState(initialConversationId || null);
  const [newMessage, setNewMessage] = useState('');
  // Start in a loading state if we expect to fetch history.
  const [loading, setLoading] = useState(!!initialConversationId);

  const fetchConversationHistory = useCallback(async (convId) => {
    try {
      const { data, error } = await supabase
        .from('ai_messages')
        .select('*')
        .eq('conversation_id', convId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      if (data.length > 0) {
        setMessages(data);
      }
    } catch (error) {
      Alert.alert('Error', 'Could not load conversation history.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (initialConversationId) {
      fetchConversationHistory(initialConversationId);
    }
  }, [initialConversationId, fetchConversationHistory]);

  const handleSendMessage = async () => {
    if (newMessage.trim().length === 0) return;

    const userMessageContent = newMessage.trim();
    const optimisticId = `optimistic-${Date.now()}`;
    const optimisticUserMessage = { id: optimisticId, role: 'user', content: userMessageContent };
    
    // Add user's message to the UI optimistically
    // This makes the app feel instantaneous
    setMessages(currentMessages => [...currentMessages, optimisticUserMessage]);
    setNewMessage('');
    setLoading(true);

    try {
      let currentConversationId = conversationId;

      // If this is the first message, create a new conversation
      if (!currentConversationId) {
        const { data, error } = await supabase
          .from('ai_conversations')
          .insert({ user_id: session.user.id, title: userMessageContent.substring(0, 50) })
          .select()
          .single();

        if (error) throw error;
        currentConversationId = data.id;
        setConversationId(currentConversationId);
      }

      // Save user message to the database
      await supabase.from('ai_messages').insert({
        conversation_id: currentConversationId,
        role: 'user',
        content: userMessageContent,
      });

      // Call the Edge Function
      const { data: assistantResponse, error: functionError } = await supabase.functions.invoke('ai-assistant', {
        body: { messages: [...messages, optimisticUserMessage].map(({ role, content }) => ({ role, content })) },
      });

      if (functionError) throw functionError;

      // Save assistant message to the database
      await supabase.from('ai_messages').insert({
        conversation_id: currentConversationId,
        role: 'assistant',
        content: assistantResponse.content,
      });

      const newAssistantMessage = { id: `assistant-${Date.now()}`, ...assistantResponse, error: false };
      setMessages(currentMessages => [...currentMessages, newAssistantMessage]);

    } catch (error) {
      console.error('Error in AI chat:', error);
      // If an error occurs, update the optimistic message to show an error state
      setMessages(currentMessages =>
        currentMessages.map(msg => msg.id === optimisticId ? { ...msg, error: true } : msg)
      );
      // The error from `invoke` might be a FunctionsError object.
      // The actual error message from the function's Response is often in `error.context`.
      const errorBody = error.context?.body ? JSON.parse(error.context.body) : null;
      const message = errorBody?.error || error.message || 'An unknown error occurred. Please check the Edge Function logs.';
      Alert.alert('Error', `Sorry, something went wrong. Please try again. (${message})`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1 bg-white" keyboardVerticalOffset={90}>
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={({ item }) => <AIMessageBubble message={item} onRetry={() => handleSendMessage()} />}
        keyExtractor={(item) => item.id}
        className="flex-1 p-2"
        contentContainerStyle={{ paddingBottom: 10 }}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
      />
      {loading && <ActivityIndicator size="small" color="#007AFF" className="p-2" />}
      <View className="flex-row items-center p-2 border-t border-gray-200 bg-white">
        <TextInput
          value={newMessage}
          onChangeText={setNewMessage}
          placeholder="Ask your AI assistant..."
          className="flex-1 bg-gray-100 rounded-2xl px-4 py-3 mr-2 text-base"
          editable={!loading}
          multiline
        />
        <TouchableOpacity
          onPress={handleSendMessage}
          disabled={loading || newMessage.trim().length === 0}
          className="bg-blue-500 w-12 h-12 rounded-full justify-center items-center disabled:bg-gray-300"
        >
          <Ionicons name="arrow-up" size={24} color="white" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

export default AssistantScreen;