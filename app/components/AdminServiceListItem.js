import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../supabase/client';

const AdminServiceListItem = ({ service, onDeletePress }) => {
  const serviceImageUrl = service.image_url
    ? supabase.storage.from('services').getPublicUrl(service.image_url).data.publicUrl
    : 'https://placehold.co/600x400/EEE/31343C?text=Service';

  return (
    <View className="flex-row items-center bg-white p-3 mb-3 rounded-lg shadow-sm">
      <Image source={{ uri: serviceImageUrl }} className="w-16 h-12 rounded-md" />
      <View className="flex-1 ml-4">
        <Text className="text-base font-semibold text-gray-800" numberOfLines={1}>{service.title}</Text>
        <Text className="text-sm text-gray-500">by {service.profiles?.username || 'Unknown'}</Text>
      </View>
      <TouchableOpacity onPress={() => onDeletePress(service)} className="p-2">
        <Ionicons name="trash-outline" size={22} color="#EF4444" />
      </TouchableOpacity>
    </View>
  );
};

export default AdminServiceListItem;