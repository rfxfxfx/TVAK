import React from 'react';
import { View, Image, TouchableOpacity, ActivityIndicator, Text } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';

export default function ServiceImagePicker({ imageUrl, onImagePicked, uploading = false }) {
  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      alert('Sorry, we need camera roll permissions to make this work!');
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.7,
    });

    if (!result.canceled) {
      onImagePicked(result.assets[0]);
    }
  };

  return (
    <TouchableOpacity
      onPress={pickImage}
      disabled={uploading}
      className="w-full h-48 bg-gray-200 rounded-lg justify-center items-center mb-4"
    >
      {imageUrl ? (
        <Image source={{ uri: imageUrl }} className="w-full h-full rounded-lg" />
      ) : (
        <Ionicons name="camera" size={40} color="#6B7280" />
      )}
      {uploading && <View className="absolute inset-0 bg-black/40 justify-center items-center rounded-lg"><ActivityIndicator color="#fff" /></View>}
    </TouchableOpacity>
  );
}