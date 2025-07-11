import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../supabase/client';

const ServiceCard = ({ service, onDelete }) => {
  const { session } = useAuth();
  const navigation = useNavigation();
  const isOwner = session?.user?.id === service.user_id;

  const avatarUrl = service.profiles?.avatar_url
    ? `${process.env.EXPO_PUBLIC_SUPABASE_URL}/storage/v1/object/public/avatars/${service.profiles.avatar_url}`
    : 'https://placehold.co/64x64/EEE/31343C?text=VAI';

  const serviceImageUrl = service.image_url
    ? supabase.storage.from('services').getPublicUrl(service.image_url).data.publicUrl
    : 'https://placehold.co/600x400/EEE/31343C?text=Service';

  const username = service.profiles?.username || 'Freelancer';

  return (
    <View className="bg-white rounded-xl shadow-lg overflow-hidden mb-5">
      <Image
        className="w-full h-40"
        source={{ uri: serviceImageUrl }}
        resizeMode="cover"
      />
      <View className="p-4">
        <Text className="text-xl font-bold text-gray-900" numberOfLines={1}>{service.title}</Text>
        <Text className="text-base text-gray-600 mt-1" numberOfLines={2}>{service.description}</Text>
        <View className="flex-row items-center justify-between mt-4">
          <Image source={{ uri: avatarUrl }} className="w-10 h-10 rounded-full" />
          <Text className="ml-3 text-sm font-semibold text-gray-700">{username}</Text>
          <View className="flex-1" />
          {isOwner && (
            <View className="flex-row">
              <TouchableOpacity
                className="bg-gray-200 px-4 py-2 rounded-full"
                onPress={() => navigation.navigate('EditService', { service })}
              >
                <Text className="font-semibold text-gray-800">Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity className="ml-2 bg-red-100 px-4 py-2 rounded-full" onPress={() => onDelete(service)}>
                <Text className="font-semibold text-red-700">Delete</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
      <View className="bg-gray-50 px-4 py-3 border-t border-gray-200">
        <Text className="text-lg font-bold text-blue-600">${Number(service.price).toFixed(2)} <Text className="text-sm font-normal text-gray-500">/{service.price_unit.replace('_', ' ')}</Text></Text>
      </View>
    </View>
  );
};

export default ServiceCard;