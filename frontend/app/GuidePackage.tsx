import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  ScrollView,
  TextInput,
  Alert,
  Dimensions,
  ActivityIndicator,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import BottomSheet, { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../config';
import BottomNavigation from "@/components/BottomNavigation";

interface Package {
  id: string;
  title: string;
  description: string;
  price: number;
  duration: string;
  maxPeople: number;
  image: string;
  locations: string[];
  difficulty?: 'Easy' | 'Moderate' | 'Challenging';
}

interface EnrolledUser {
  id: string;
  name: string;
  email: string;
  phone?: string;
  enrollmentDate: string;
}

const GuidePackage = () => {
  const router = useRouter();
  const bottomSheetRef = useRef<BottomSheet>(null);
  const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false);
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [newPackage, setNewPackage] = useState({
    title: '',
    description: '',
    duration: '',
    maxPeople: '',
    locations: '',
    price: '',
    image: null as string | null,
  });
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);
  const [enrolledUsers, setEnrolledUsers] = useState<EnrolledUser[]>([]);
  const [loadingEnrolledUsers, setLoadingEnrolledUsers] = useState(false);
  const [showEnrolledUsersModal, setShowEnrolledUsersModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingPackage, setEditingPackage] = useState<Package | null>(null);
  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
    duration: '',
    maxPeople: '',
    locations: '',
    price: '',
    image: null as string | null,
  });

  // Variables for bottom sheet
  const snapPoints = useMemo(() => ['25%', '50%', '90%'], []);

  const handleSheetChanges = useCallback((index: number) => {
    setIsBottomSheetOpen(index > 0);
  }, []);

  // Fetch packages from API
  const fetchPackages = async () => {
    try {
      setLoading(true);
      const apiUrl = `${API_BASE_URL}/package`;
      console.log('Fetching packages from:', apiUrl);
      
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      });

      console.log('Response status:', response.status);
      
      // Check if the response is OK
      if (!response.ok) {
        throw new Error(`Server responded with status: ${response.status}`);
      }
      
      // Get the response text first
      const responseText = await response.text();
      console.log('Raw response:', responseText.substring(0, 100) + '...');
      
      // Check if the response is empty
      if (!responseText || responseText.trim() === '') {
        throw new Error('Empty response from server');
      }
      
      // Try to parse the response as JSON
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error('JSON parse error:', parseError);
        console.error('Response starts with:', responseText.substring(0, 50));
        throw new Error(`Invalid JSON response: ${responseText.substring(0, 100)}...`);
      }

      
      if (data.success) {
        // Transform the data to match our Package interface
        const transformedPackages = data.data.map((pkg: any) => {
          // Handle image URL properly
          let imageUrl = 'https://images.unsplash.com/photo-1585409677983-0f6c41ca9c3b?w=500';
          
          if (pkg.image) {
            // Check if the image URL is already a full URL
            if (pkg.image.startsWith('http://') || pkg.image.startsWith('https://')) {
              imageUrl = pkg.image;
            } else {
              // Construct the full URL with the API base URL
              imageUrl = `${API_BASE_URL}${pkg.image}`;
            }
            
            console.log(`Package ${pkg.id} image URL: ${imageUrl}`);
          }
          
          return {
            id: pkg.id.toString(),
            title: pkg.title,
            description: pkg.description,
            price: pkg.price,
            duration: pkg.duration.toString(),
            maxPeople: pkg.maxPeople,
            image: imageUrl,
            locations: Array.isArray(pkg.locations) ? pkg.locations : 
                      (typeof pkg.locations === 'string' ? 
                        (pkg.locations.startsWith('[') ? JSON.parse(pkg.locations) : pkg.locations.split(',')) : 
                        []),
            difficulty: 'Moderate', // Default value since it's not in the API
          };
        });
        
        setPackages(transformedPackages);
      } else {
        Alert.alert('Error', data.message || 'Failed to fetch packages');
      }
    } catch (error) {
      console.error('Error fetching packages:', error);
      let errorMessage = 'Failed to fetch packages. ';
      
      if (error instanceof Error) {
        if (error.message.includes('Network request failed')) {
          errorMessage += 'Please check your internet connection and make sure the server is running.';
        } else if (error.message.includes('Invalid JSON')) {
          errorMessage += 'The server returned an invalid response. Please try again later.';
        } else if (error.message.includes('Empty response')) {
          errorMessage += 'The server returned an empty response. Please try again later.';
        } else {
          errorMessage += error.message;
        }
      }
      
      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Fetch packages on component mount
  useEffect(() => {
    fetchPackages();
  }, []);

  // Handle pull-to-refresh
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchPackages();
  }, []);

  const pickImage = async () => {
    try {
      // Request permission
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Sorry, we need camera roll permissions to make this work!');
        return;
      }

      // Pick the image
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [16, 9],
        quality: 1,
      });

      if (!result.canceled) {
        setNewPackage({ ...newPackage, image: result.assets[0].uri });
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const handleCreatePackage = () => {
    // Navigate to packageRegister.tsx
    router.push('/packageRegister');
  };

  // Fetch enrolled users for a specific package
  const fetchEnrolledUsers = async (packageId: string) => {
    try {
      setLoadingEnrolledUsers(true);
      const token = await AsyncStorage.getItem('token');
      
      if (!token) {
        Alert.alert('Error', 'Authentication required');
        return;
      }
      
      // Fix the API URL to match the backend route
      const apiUrl = `${API_BASE_URL}/package/${packageId}/enrolled-users`;
      console.log('Fetching enrolled users from:', apiUrl);
      console.log('Package ID:', packageId);
      
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      
      console.log('Response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        throw new Error(`Server responded with status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Response data:', data);
      
      if (data.success) {
        setEnrolledUsers(data.data);
      } else {
        Alert.alert('Error', data.message || 'Failed to fetch enrolled users');
      }
    } catch (error) {
      console.error('Error fetching enrolled users:', error);
      Alert.alert('Error', 'Failed to fetch enrolled users. Please try again later.');
    } finally {
      setLoadingEnrolledUsers(false);
    }
  };

  // Show enrolled users modal
  const handleShowEnrolledUsers = (pkg: Package) => {
    setSelectedPackage(pkg);
    setShowEnrolledUsersModal(true);
    fetchEnrolledUsers(pkg.id);
  };

  // Handle edit package
  const handleEditPackage = (pkg: Package) => {
    setEditingPackage(pkg);
    setEditForm({
      title: pkg.title,
      description: pkg.description,
      duration: pkg.duration,
      maxPeople: pkg.maxPeople.toString(),
      locations: Array.isArray(pkg.locations) ? pkg.locations.join(', ') : pkg.locations,
      price: pkg.price.toString(),
      image: null,
    });
    setIsEditMode(true);
    bottomSheetRef.current?.expand();
  };

  // Handle update package
  const handleUpdatePackage = async () => {
    try {
      if (!editingPackage) return;

      const token = await AsyncStorage.getItem('token');
      if (!token) {
        Alert.alert('Error', 'Authentication required');
        return;
      }

      // Validate form
      if (!editForm.title || !editForm.description || !editForm.duration || 
          !editForm.maxPeople || !editForm.locations || !editForm.price) {
        Alert.alert('Error', 'Please fill in all required fields');
        return;
      }

      // Create form data
      const formData = new FormData();
      formData.append('title', editForm.title);
      formData.append('description', editForm.description);
      formData.append('duration', editForm.duration);
      formData.append('maxPeople', editForm.maxPeople);
      formData.append('locations', editForm.locations);
      formData.append('price', editForm.price);

      // Add image if selected
      if (editForm.image) {
        const imageUri = editForm.image;
        const filename = imageUri.split('/').pop() || 'image.jpg';
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : 'image/jpeg';
        
        formData.append('image', {
          uri: imageUri,
          name: filename,
          type,
        } as any);
      }

      // Send update request
      const response = await fetch(`${API_BASE_URL}/package/${editingPackage.id}`, {
        method: 'PUT',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Server responded with status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        Alert.alert('Success', 'Package updated successfully');
        bottomSheetRef.current?.close();
        fetchPackages(); // Refresh the packages list
      } else {
        Alert.alert('Error', data.message || 'Failed to update package');
      }
    } catch (error) {
      console.error('Error updating package:', error);
      Alert.alert('Error', 'Failed to update package. Please try again later.');
    }
  };

  const renderPackageCard = ({ item }: { item: Package }) => (
    <View className="bg-white rounded-lg shadow-md m-2 overflow-hidden">
      <View className="w-full h-48 bg-gray-200">
        <Image
          source={{ uri: item.image }}
          className="w-full h-48"
          resizeMode="cover"
          onError={(e) => {
            console.error('Image loading error:', e.nativeEvent.error);
            // Set a fallback image if the original fails to load
            item.image = 'https://images.unsplash.com/photo-1585409677983-0f6c41ca9c3b?w=500';
          }}
        />
      </View>
      <View className="p-4">
        <Text className="text-xl font-bold text-gray-800">{item.title}</Text>
        <Text className="text-gray-600 mt-1">{item.description}</Text>
        
        <View className="flex-row items-center mt-2">
          <Ionicons name="time-outline" size={16} color="#4B5563" />
          <Text className="text-gray-600 ml-1">{item.duration} days</Text>
          
          <Ionicons name="people-outline" size={16} color="#4B5563" className="ml-4" />
          <Text className="text-gray-600 ml-1">Max {item.maxPeople} people</Text>
        </View>

        <View className="flex-row items-center mt-2">
          <Ionicons name="location-outline" size={16} color="#4B5563" />
          <Text className="text-gray-600 ml-1">{Array.isArray(item.locations) ? item.locations.join(' → ') : item.locations}</Text>
        </View>

        <View className="flex-row justify-between items-center mt-4">
          <Text className="text-lg font-bold text-blue-600">
            Enroll Price: Rs. {item.price.toLocaleString()}
          </Text>
          <View className="flex-row">
            <TouchableOpacity 
              className="bg-green-500 px-4 py-2 rounded-lg mr-2"
              onPress={() => handleShowEnrolledUsers(item)}
            >
              <Text className="text-white">Users</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              className="bg-blue-500 px-4 py-2 rounded-lg mr-2"
              onPress={() => handleEditPackage(item)}
            >
              <Text className="text-white">Edit</Text>
            </TouchableOpacity>
            
          </View>
        </View>
      </View>
    </View>
  );

  const renderBottomSheet = () => (
    <BottomSheet
      ref={bottomSheetRef}
      index={-1}
      snapPoints={snapPoints}
      onChange={handleSheetChanges}
      enablePanDownToClose={true}
      backgroundStyle={{ backgroundColor: 'white' }}
    >
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
      >
        <View className="flex-1">
          <View className="px-4 py-2 border-b border-gray-200">
            <View className="flex-row justify-between items-center">
              <Text className="text-xl font-bold">
                {isEditMode ? 'Edit Package' : 'Create New Package'}
              </Text>
              <TouchableOpacity onPress={() => {
                bottomSheetRef.current?.close();
                setIsEditMode(false);
                setEditingPackage(null);
              }}>
                <Ionicons name="close" size={24} color="black" />
              </TouchableOpacity>
            </View>
          </View>

          <BottomSheetScrollView contentContainerStyle={{ padding: 16 }}>
            <View className="space-y-4 gap-2">
              {/* Image Selection */}
              <View className="gap-1">
                <Text className="text-gray-600 mb-1">Package Image</Text>
                <TouchableOpacity
                  onPress={pickImage}
                  className="border-2 border-dashed border-gray-300 rounded-lg p-4 items-center justify-center"
                >
                  {editForm.image ? (
                    <View className="w-full">
                      <Image
                        source={{ uri: editForm.image }}
                        className="w-full h-48 rounded-lg"
                        resizeMode="cover"
                      />
                      <TouchableOpacity 
                        className="absolute top-2 right-2 bg-black/50 rounded-full p-1"
                        onPress={() => setEditForm({ ...editForm, image: null })}
                      >
                        <Ionicons name="close" size={20} color="white" />
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <View className="items-center">
                      <Ionicons name="image-outline" size={48} color="gray" />
                      <Text className="text-gray-500 mt-2">Tap to select package image</Text>
                      <Text className="text-gray-400 text-sm">(16:9 ratio recommended)</Text>
                    </View>
                  )}
                </TouchableOpacity>
              </View>

              <View className="gap-2">
                <Text className="text-gray-600 mb-1">Package Name</Text>
                <TextInput
                  className="border border-gray-300 rounded-lg p-2"
                  value={editForm.title}
                  onChangeText={(text) => setEditForm({...editForm, title: text})}
                  placeholder="Enter package name"
                  placeholderTextColor="gray"
                />
              </View>

              <View className="gap-2">
                <Text className="text-gray-600 mb-1">Description</Text>
                <TextInput
                  className="border border-gray-300 rounded-lg p-2"
                  value={editForm.description}
                  onChangeText={(text) => setEditForm({...editForm, description: text})}
                  placeholder="Enter package description"
                  placeholderTextColor="gray"
                  multiline
                  numberOfLines={3}
                  style={{ textAlignVertical: 'top' }}
                />
              </View>

              <View className="gap-2">
                <Text className="text-gray-600 mb-1">Duration (in days)</Text>
                <TextInput
                  className="border border-gray-300 rounded-lg p-2"
                  value={editForm.duration}
                  onChangeText={(text) => setEditForm({...editForm, duration: text})}
                  placeholder="Enter duration"
                  placeholderTextColor="gray"
                  keyboardType="numeric"
                />
              </View>

              <View className="gap-2">
                <Text className="text-gray-600 mb-1">Maximum People</Text>
                <TextInput
                  className="border border-gray-300 rounded-lg p-2"
                  value={editForm.maxPeople}
                  onChangeText={(text) => setEditForm({...editForm, maxPeople: text})}
                  placeholder="Enter maximum number of people"
                  placeholderTextColor="gray"
                  keyboardType="numeric"
                />
              </View>

              <View className="gap-2">
                <Text className="text-gray-600 mb-1">Places to Visit (comma-separated)</Text>
                <TextInput
                  className="border border-gray-300 rounded-lg p-2"
                  value={editForm.locations}
                  onChangeText={(text) => setEditForm({...editForm, locations: text})}
                  placeholder="e.g., Kathmandu, Pokhara, Chitwan"
                  placeholderTextColor="gray"
                />
              </View>

              <View className="gap-2">
                <Text className="text-gray-600 mb-1">Price (in Rs.)</Text>
                <TextInput
                  className="border border-gray-300 rounded-lg p-2"
                  value={editForm.price}
                  onChangeText={(text) => setEditForm({...editForm, price: text})}
                  placeholder="Enter price"
                  placeholderTextColor="gray"
                  keyboardType="numeric"
                />
              </View>

              <TouchableOpacity
                className="bg-blue-500 py-3 rounded-lg mt-6 mb-8"
                onPress={isEditMode ? handleUpdatePackage : handleCreatePackage}
              >
                <Text className="text-white text-center font-bold">
                  {isEditMode ? 'Update Package' : 'Create Package'}
                </Text>
              </TouchableOpacity>
            </View>
          </BottomSheetScrollView>
        </View>
      </KeyboardAvoidingView>
    </BottomSheet>
  );

  // Render enrolled users modal
  const renderEnrolledUsersModal = () => (
    <Modal
      visible={showEnrolledUsersModal}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setShowEnrolledUsersModal(false)}
    >
      <View className="flex-1 bg-black/50 justify-center items-center">
        <View className="bg-white w-11/12 max-h-4/5 rounded-lg overflow-hidden">
          <View className="p-4 border-b border-gray-200 flex-row justify-between items-center">
            <Text className="text-xl font-bold">
              {selectedPackage?.title} - Enrolled Users
            </Text>
            <TouchableOpacity onPress={() => setShowEnrolledUsersModal(false)}>
              <Ionicons name="close" size={24} color="black" />
            </TouchableOpacity>
          </View>
          
          {loadingEnrolledUsers ? (
            <View className="p-8 items-center">
              <ActivityIndicator size="large" color="#3B82F6" />
              <Text className="mt-2 text-gray-600">Loading enrolled users...</Text>
            </View>
          ) : enrolledUsers.length === 0 ? (
            <View className="p-8 items-center">
              <Ionicons name="people-outline" size={48} color="#9CA3AF" />
              <Text className="text-xl font-bold text-gray-700 mt-4">No Enrolled Users</Text>
              <Text className="text-gray-500 text-center mt-2">
                No users have enrolled in this package yet.
              </Text>
            </View>
          ) : (
            <ScrollView className="p-4">
              {enrolledUsers.map((user) => (
                <View key={user.id} className="bg-gray-50 p-4 rounded-lg mb-3">
                  <View className="flex-row justify-between items-center">
                    <Text className="text-lg font-semibold text-gray-800">{user.name}</Text>
                    <Text className="text-sm text-gray-500">
                      {new Date(user.enrollmentDate).toLocaleDateString()}
                    </Text>
                  </View>
                  <Text className="text-gray-600 mt-1">{user.email}</Text>
                  {user.phone && <Text className="text-gray-600">{user.phone}</Text>}
                </View>
              ))}
            </ScrollView>
          )}
        </View>
      </View>
    </Modal>
  );

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View className="flex-1 bg-gray-100">
        {/* Header */}
        <View className="bg-white p-4 flex-row gap-2 items-center shadow-sm">
          <TouchableOpacity onPress={() => router.replace("/GuideHome")}>
            <Ionicons name="arrow-back" size={24} color="black" />
          </TouchableOpacity>
          <Text className="text-xl font-bold">My Packages</Text>
          <TouchableOpacity 
            className="bg-blue-500 px-4 py-2 rounded-lg absolute right-4"
            onPress={handleCreatePackage}
          >
            <Text className="text-white">Create</Text>
          </TouchableOpacity>
        </View>

        {/* Package List */}
        {loading ? (
          <View className="flex-1 justify-center items-center">
            <ActivityIndicator size="large" color="#3B82F6" />
            <Text className="mt-2 text-gray-600">Loading packages...</Text>
          </View>
        ) : packages.length === 0 ? (
          <View className="flex-1 justify-center items-center p-4">
            <Ionicons name="cube-outline" size={64} color="#9CA3AF" />
            <Text className="text-xl font-bold text-gray-700 mt-4">No Packages Yet</Text>
            <Text className="text-gray-500 text-center mt-2">
              Create your first travel package to start offering tours to travelers.
            </Text>
            <TouchableOpacity
              className="bg-blue-500 py-3 px-6 rounded-lg mt-6"
              onPress={handleCreatePackage}
            >
              <Text className="text-white font-bold">Create Package</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={packages}
            renderItem={renderPackageCard}
            keyExtractor={(item) => item.id}
            contentContainerClassName="pb-4"
            showsVerticalScrollIndicator={false}
            refreshing={refreshing}
            onRefresh={onRefresh}
          />
        )}

        {/* Bottom Sheet */}
        {renderBottomSheet()}
        
        {/* Enrolled Users Modal */}
        {renderEnrolledUsersModal()}

        {/* Bottom Navigation */}
        <BottomNavigation />
      </View>
    </GestureHandlerRootView>
  );
};

export default GuidePackage;
