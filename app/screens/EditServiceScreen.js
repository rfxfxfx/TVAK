import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, Alert, ScrollView, ActivityIndicator } from 'react-native';
import { supabase } from '../supabase/client';
import { useAuth } from '../context/AuthContext';
import { useNavigation } from '@react-navigation/native';
import ServiceImagePicker from '../components/ServiceImagePicker';

const EditServiceScreen = ({ route }) => {
  const { service } = route.params;
  const { session } = useAuth();
  const navigation = useNavigation();

  const [title, setTitle] = useState(service.title);
  const [description, setDescription] = useState(service.description);
  const [price, setPrice] = useState(service.price.toString());
  const [imageAsset, setImageAsset] = useState(null); // For new image uploads
  const [existingImageUrl, setExistingImageUrl] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (service.image_url) {
      const { data } = supabase.storage.from('services').getPublicUrl(service.image_url);
      setExistingImageUrl(data.publicUrl);
    }
  }, [service.image_url]);

  const handleImagePicked = (asset) => {
    setImageAsset(asset);
  };

  const handleUpdateService = async () => {
    if (!title || !description || !price) {
      Alert.alert('Error', 'Please fill all fields.');
      return;
    }

    setLoading(true);

    try {
      let imageUrl = service.image_url;

      // If a new image was selected, upload it
      if (imageAsset) {
        const fileExt = imageAsset.uri.split('.').pop();
        const fileName = `${Date.now()}.${fileExt}`;
        const filePath = `${session.user.id}/${fileName}`;

        const response = await fetch(imageAsset.uri);
        const blob = await response.blob();

        const { error: uploadError } = await supabase.storage
          .from('services')
          .upload(filePath, blob, { contentType: imageAsset.mimeType, upsert: true });

        if (uploadError) throw uploadError;
        imageUrl = filePath;
      }

      // Update the service in the database
      const { error: updateError } = await supabase
        .from('services')
        .update({
          title,
          description,
          price: parseFloat(price),
          image_url: imageUrl,
        })
        .eq('id', service.id);

      if (updateError) throw updateError;

      Alert.alert('Success', 'Your service has been updated!');
      navigation.goBack();

    } catch (error) {
      console.error('Error updating service:', error);
      Alert.alert('Error', 'Failed to update service. ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView className="flex-1 bg-gray-50" contentContainerStyle={{ padding: 20 }}>
      <Text className="text-2xl font-bold mb-5 text-gray-800">Edit Your Service</Text>

      <ServiceImagePicker
        imageUrl={imageAsset?.uri || existingImageUrl}
        onImagePicked={handleImagePicked}
        uploading={loading}
      />

      <Text className="text-base font-semibold text-gray-600 mb-1">Service Title</Text>
      <TextInput
        className="w-full h-12 border border-gray-300 rounded-md px-4 mb-4 bg-white"
        value={title}
        onChangeText={setTitle}
      />

      <Text className="text-base font-semibold text-gray-600 mb-1">Description</Text>
      <TextInput
        className="w-full h-24 border border-gray-300 rounded-md px-4 mb-4 bg-white"
        value={description}
        onChangeText={setDescription}
        multiline
      />

      <Text className="text-base font-semibold text-gray-600 mb-1">Price (per hour)</Text>
      <TextInput
        className="w-full h-12 border border-gray-300 rounded-md px-4 mb-6 bg-white"
        value={price}
        onChangeText={setPrice}
        keyboardType="numeric"
      />

      <Button title={loading ? 'Updating...' : 'Update Service'} onPress={handleUpdateService} disabled={loading} />
    </ScrollView>
  );
};

export default EditServiceScreen;