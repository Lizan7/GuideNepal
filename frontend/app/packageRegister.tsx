import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import API_BASE_URL from "@/config";

const PackageRegister = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [packageData, setPackageData] = useState({
    title: '',
    description: '',
    duration: '',
    maxPeople: '',
    locations: '',
    price: '',
    image: null as string | null,
  });

  const pickImage = async () => {
    try {
      // Request permission
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Sorry, we need camera roll permissions to make this work!');
        return;
      }

      // Pick the image
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.8,
      });

      if (!result.canceled) {
        setPackageData({ ...packageData, image: result.assets[0].uri });
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const handleCreatePackage = async () => {
    // Validate form
    if (!packageData.title || !packageData.description || !packageData.duration || 
        !packageData.maxPeople || !packageData.locations || !packageData.price) {
      Alert.alert('Missing Information', 'Please fill in all fields');
      return;
    }

    if (!packageData.image) {
      Alert.alert('Missing Image', 'Please select an image for your package');
      return;
    }

    try {
      setLoading(true);
      // Get auth token from storage
      const authToken = await AsyncStorage.getItem('token');
      console.log('Auth Token:', authToken);

      if (!authToken) {
        Alert.alert('Authentication Error', 'Please login again');
        router.replace('/');
        return;
      }

      // Create FormData object
      const formData = new FormData();
      formData.append('title', packageData.title);
      formData.append('description', packageData.description);
      formData.append('duration', packageData.duration);
      formData.append('maxPeople', packageData.maxPeople);
      formData.append('price', packageData.price);
      formData.append('locations', packageData.locations);

      // Add image if exists
      if (packageData.image) {
        const imageUri = packageData.image;
        const filename = imageUri.split('/').pop() || 'image.jpg';
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : 'image/jpeg';

        formData.append('image', {
          uri: imageUri,
          name: filename,
          type,
        } as any);
      }

      console.log('Sending request with form data');

      // Make API call to create package
      const response = await fetch(`${API_BASE_URL}/package/create`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'multipart/form-data',
        },
        body: formData,
      });

      console.log('Response status:', response.status);
      
      // Get the raw response text first
      const responseText = await response.text();
      console.log('Raw response:', responseText);

      let data;
      try {
        // Try to parse the response as JSON
        data = JSON.parse(responseText);
        console.log('Parsed response data:', data);
      } catch (parseError) {
        console.error('JSON Parse Error:', parseError);
        console.error('Response that failed to parse:', responseText);
        Alert.alert(
          'Server Error',
          'Received invalid response from server. Please try again.'
        );
        return;
      }

      if (data.success) {
        Alert.alert('Success', 'Package created successfully', [
          { text: 'OK', onPress: () => router.back() }
        ]);
      } else {
        Alert.alert('Error', data.message || 'Failed to create package');
      }
    } catch (error) {
      console.error('Error creating package:', error);
      if (error instanceof Error) {
        if (error.message === 'Network request failed') {
          Alert.alert(
            'Connection Error',
            'Please check your internet connection and make sure the server is running.'
          );
        } else {
          Alert.alert('Error', `Failed to create package: ${error.message}`);
        }
      } else {
        Alert.alert('Error', 'Failed to create package');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-white" 
    >
      <ScrollView className="flex-1">
        {/* Header */}
        <View className="bg-white p-4 flex-row items-center border-b border-gray-200 shadow-sm">
          <TouchableOpacity 
            onPress={() => router.back()}
            className="p-2 rounded-full bg-gray-100"
          >
            <Ionicons name="arrow-back" size={22} color="#4B5563" />
          </TouchableOpacity>
          <Text className="text-xl font-bold ml-3 text-gray-800">Create New Package</Text>
        </View>

        <View className="p-5 space-y-5">
          {/* Image Selection */}
          <View className="bg-white">
            <Text className="text-gray-700 font-medium mb-2">Package Image</Text>
            <TouchableOpacity
              onPress={pickImage}
              className="border-2 border-dashed border-blue-300 rounded-xl p-4 items-center justify-center bg-blue-50"
            >
              {packageData.image ? (
                <View className="w-full">
                  <Image
                    source={{ uri: packageData.image }}
                    className="w-full h-48 rounded-lg"
                    resizeMode="cover"
                  />
                  <TouchableOpacity 
                    className="absolute top-2 right-2 bg-black/60 rounded-full p-2"
                    onPress={() => setPackageData({ ...packageData, image: null })}
                  >
                    <Ionicons name="close" size={20} color="white" />
                  </TouchableOpacity>
                </View>
              ) : (
                <View className="items-center py-6">
                  <Ionicons name="image-outline" size={48} color="#3B82F6" />
                  <Text className="text-gray-600 mt-3 font-medium">Tap to select package image</Text>
                  <Text className="text-gray-400 text-sm mt-1">(16:9 ratio recommended)</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          {/* Package Name */}
          <View className="px-4 py-2">
            <Text className="text-gray-700 font-medium mb-2">Package Name</Text>
            <TextInput
              className="border border-gray-300 rounded-lg p-3 bg-gray-50"
              value={packageData.title}
              onChangeText={(text) => setPackageData({...packageData, title: text})}
              placeholder="Enter package name"
              placeholderTextColor="#9CA3AF"
            />
          </View>

          {/* Description */}
          <View className="bg-white p-4">
            <Text className="text-gray-700 font-medium mb-2">Description</Text>
            <TextInput
              className="border border-gray-300 rounded-lg p-3 bg-gray-50 min-h-[100px]"
              value={packageData.description}
              onChangeText={(text) => setPackageData({...packageData, description: text})}
              placeholder="Enter package description"
              placeholderTextColor="#9CA3AF"
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          {/* Duration and Max People */}
          <View className="flex-row space-x-4">
            <View className="flex-1 bg-white p-4">
              <Text className="text-gray-700 font-medium mb-2">Duration (days)</Text>
              <TextInput
                className="border border-gray-300 rounded-lg p-3 bg-gray-50"
                value={packageData.duration}
                onChangeText={(text) => setPackageData({...packageData, duration: text})}
                placeholder="e.g., 5"
                placeholderTextColor="#9CA3AF"
                keyboardType="numeric"
              />
            </View>

            <View className="flex-1 bg-white p-4">
              <Text className="text-gray-700 font-medium mb-2">Max People</Text>
              <TextInput
                className="border border-gray-300 rounded-lg p-3 bg-gray-50"
                value={packageData.maxPeople}
                onChangeText={(text) => setPackageData({...packageData, maxPeople: text})}
                placeholder="e.g., 10"
                placeholderTextColor="#9CA3AF"
                keyboardType="numeric"
              />
            </View>
          </View>

          {/* Locations */}
          <View className="bg-white p-4">
            <Text className="text-gray-700 font-medium mb-2">Places to Visit</Text>
            <TextInput
              className="border border-gray-300 rounded-lg p-3 bg-gray-50"
              value={packageData.locations}
              onChangeText={(text) => setPackageData({...packageData, locations: text})}
              placeholder="e.g., Kathmandu, Pokhara, Chitwan"
              placeholderTextColor="#9CA3AF"
            />
            <Text className="text-gray-500 text-xs mt-1">Separate locations with commas</Text>
          </View>

          {/* Price */}
          <View className="bg-white p-4">
            <Text className="text-gray-700 font-medium mb-2">Price (in Rs.)</Text>
            <View className="flex-row items-center">
              <Text className="text-gray-500 mr-2">Rs.</Text>
              <TextInput
                className="border border-gray-300 rounded-lg p-3 bg-gray-50 flex-1"
                value={packageData.price}
                onChangeText={(text) => setPackageData({...packageData, price: text})}
                placeholder="Enter price"
                placeholderTextColor="#9CA3AF"
                keyboardType="numeric"
              />
            </View>
          </View>

          {/* Create Button */}
          <TouchableOpacity
            className="bg-blue-600 py-4 rounded-xl mt-4 mb-8 shadow-md"
            onPress={handleCreatePackage}
            disabled={loading}
          >
            {loading ? (
              <View className="flex-row items-center justify-center">
                <ActivityIndicator color="white" size="small" />
                <Text className="text-white font-bold ml-2">Creating Package...</Text>
              </View>
            ) : (
              <Text className="text-white text-center font-bold text-lg">Create Package</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default PackageRegister; 