import React from 'react';
import { View, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';

export default function Avatar({ url, size = 150, onUpload, uploading = false }) {
  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      alert('Sorry, we need camera roll permissions to make this work!');
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5, // Lower quality for faster uploads
    });

    if (!result.canceled) {
      onUpload(result.assets[0]);
    }
  };

  return (
    <TouchableOpacity
      onPress={pickImage}
      disabled={uploading}
      className="relative items-center justify-center mb-5"
      style={{ height: size, width: size, borderRadius: size / 2 }}
    >
      {url ? (
        <Image source={{ uri: url }} className="w-full h-full rounded-full border-2 border-blue-500" />
      ) : (
        <View className="w-full h-full rounded-full bg-gray-300 border-2 border-blue-500 justify-center items-center">
          <Ionicons name="camera" size={size * 0.4} color="#fff" />
        </View>
      )}
      {uploading && (
        <View className="absolute inset-0 bg-black/40 justify-center items-center rounded-full">
          <ActivityIndicator color="#fff" />
        </View>
      )}
    </TouchableOpacity>
  );
}