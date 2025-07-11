import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert, ScrollView, ActivityIndicator } from 'react-native';
import { supabase } from '../supabase/client';
import { useAuth } from '../context/AuthContext';
import { useNavigation } from '@react-navigation/native';
import ServiceImagePicker from '../components/ServiceImagePicker';

const CreateServiceScreen = () => {
  const { session } = useAuth();
  const navigation = useNavigation();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [imageAsset, setImageAsset] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleImagePicked = (asset) => {
    setImageAsset(asset);
  };

  const handleCreateService = async () => {
    if (!title || !description || !price || !imageAsset) {
      Alert.alert('Error', 'Please fill all fields and select an image.');
      return;
    }

    setLoading(true);

    try {
      // 1. Upload Image
      const fileExt = imageAsset.uri.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `${session.user.id}/${fileName}`;

      const response = await fetch(imageAsset.uri);
      const blob = await response.blob();

      const { error: uploadError } = await supabase.storage
        .from('services') // Use a 'services' bucket
        .upload(filePath, blob, {
          contentType: imageAsset.mimeType,
          upsert: false,
        });

      if (uploadError) throw uploadError;

      // 2. Insert Service into Database
      const { error: insertError } = await supabase.from('services').insert({
        user_id: session.user.id,
        title,
        description,
        price: parseFloat(price),
        image_url: filePath, // Save the path, not the full URL
      });

      if (insertError) throw insertError;

      Alert.alert('Success', 'Your service has been listed!');
      navigation.goBack();

    } catch (error) {
      console.error('Error creating service:', error);
      Alert.alert('Error', 'Failed to create service. ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView className="flex-1 bg-gray-50" contentContainerStyle={{ padding: 20 }}>
      <Text className="text-2xl font-bold mb-5 text-gray-800">List a New Service</Text>

      <ServiceImagePicker
        imageUrl={imageAsset?.uri}
        onImagePicked={handleImagePicked}
        uploading={loading}
      />

      <Text className="text-base font-semibold text-gray-600 mb-1">Service Title</Text>
      <TextInput
        className="w-full h-12 border border-gray-300 rounded-md px-4 mb-4 bg-white"
        placeholder="e.g., Professional Social Media Management"
        value={title}
        onChangeText={setTitle}
      />

      <Text className="text-base font-semibold text-gray-600 mb-1">Description</Text>
      <TextInput
        className="w-full h-24 border border-gray-300 rounded-md px-4 mb-4 bg-white"
        placeholder="Describe the service you offer..."
        value={description}
        onChangeText={setDescription}
        multiline
      />

      <Text className="text-base font-semibold text-gray-600 mb-1">Price (per hour)</Text>
      <TextInput
        className="w-full h-12 border border-gray-300 rounded-md px-4 mb-6 bg-white"
        placeholder="e.g., 25.00"
        value={price}
        onChangeText={setPrice}
        keyboardType="numeric"
      />

      <Button title={loading ? 'Creating...' : 'Create Service'} onPress={handleCreateService} disabled={loading} />
    </ScrollView>
  );
};

export default CreateServiceScreen;