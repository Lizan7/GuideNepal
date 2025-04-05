import React, { useState, useCallback, useMemo, useRef } from 'react';
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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import BottomSheet, { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import * as ImagePicker from 'expo-image-picker';

interface Package {
  id: string;
  title: string;
  description: string;
  price: number;
  duration: string;
  maxPeople: number;
  image: string;
  locations: string[];
  difficulty: 'Easy' | 'Moderate' | 'Challenging';
}

// Static data for packages
const DUMMY_PACKAGES: Package[] = [
  {
    id: '1',
    title: 'Annapurna Base Camp Trek',
    description: '14-day trek to ABC with experienced guide',
    price: 1200,
    duration: '14 days',
    maxPeople: 8,
    image: 'https://images.unsplash.com/photo-1585409677983-0f6c41ca9c3b?w=500',
    locations: ['Pokhara', 'Ghandruk', 'ABC'],
    difficulty: 'Moderate',
  },
  {
    id: '2',
    title: 'Kathmandu Cultural Tour',
    description: '3-day exploration of ancient temples and culture',
    price: 300,
    duration: '3 days',
    maxPeople: 10,
    image: 'https://images.unsplash.com/photo-1605640840605-14ac1855827b?w=500',
    locations: ['Kathmandu', 'Bhaktapur', 'Patan'],
    difficulty: 'Easy',
  },
  {
    id: '3',
    title: 'Everest View Trek',
    description: '7-day trek with stunning mountain views',
    price: 800,
    duration: '7 days',
    maxPeople: 6,
    image: 'https://images.unsplash.com/photo-1585409677983-0f6c41ca9c3b?w=500',
    locations: ['Lukla', 'Namche', 'Tengboche'],
    difficulty: 'Challenging',
  },
];

const GuidePackage = () => {
  const router = useRouter();
  const bottomSheetRef = useRef<BottomSheet>(null);
  const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false);
  const [newPackage, setNewPackage] = useState({
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
    // Validate form
    if (!newPackage.title || !newPackage.description || !newPackage.duration || 
        !newPackage.maxPeople || !newPackage.locations || !newPackage.price) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    // Here you would typically make an API call to create the package
    console.log('Creating package:', newPackage);
    bottomSheetRef.current?.close();
    // Reset form
    setNewPackage({
      title: '',
      description: '',
      duration: '',
      maxPeople: '',
      locations: '',
      price: '',
      image: null,
    });
  };

  const renderPackageCard = ({ item }: { item: Package }) => (
    <View className="bg-white rounded-lg shadow-md m-2 overflow-hidden">
      <Image
        source={{ uri: item.image }}
        className="w-full h-48"
        resizeMode="cover"
      />
      <View className="p-4">
        <Text className="text-xl font-bold text-gray-800">{item.title}</Text>
        <Text className="text-gray-600 mt-1">{item.description}</Text>
        
        <View className="flex-row items-center mt-2">
          <Ionicons name="time-outline" size={16} color="#4B5563" />
          <Text className="text-gray-600 ml-1">{item.duration}</Text>
          
          <Ionicons name="people-outline" size={16} color="#4B5563" className="ml-4" />
          <Text className="text-gray-600 ml-1">Max {item.maxPeople} people</Text>
        </View>

        <View className="flex-row items-center mt-2">
          <Ionicons name="location-outline" size={16} color="#4B5563" />
          <Text className="text-gray-600 ml-1">{item.locations.join(' → ')}</Text>
        </View>

        <View className="flex-row justify-between items-center mt-4">
          <Text className="text-lg font-bold text-blue-600">
            Rs. {item.price.toLocaleString()}
          </Text>
          <View className="flex-row">
            <TouchableOpacity 
              className="bg-blue-500 px-4 py-2 rounded-lg mr-2"
              onPress={() => console.log('Edit package:', item.id)}
            >
              <Text className="text-white">Edit</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              className="bg-red-500 px-4 py-2 rounded-lg"
              onPress={() => console.log('Delete package:', item.id)}
            >
              <Text className="text-white">Delete</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View className="mt-2">
          <Text className={`text-sm ${
            item.difficulty === 'Easy' ? 'text-green-600' :
            item.difficulty === 'Moderate' ? 'text-yellow-600' :
            'text-red-600'
          }`}>
            Difficulty: {item.difficulty}
          </Text>
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
      <View className="flex-1">
        <View className="px-4 py-2 border-b border-gray-200">
          <View className="flex-row justify-between items-center">
            <Text className="text-xl font-bold">Create New Package</Text>
            <TouchableOpacity onPress={() => bottomSheetRef.current?.close()}>
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
                {newPackage.image ? (
                  <View className="w-full">
                    <Image
                      source={{ uri: newPackage.image }}
                      className="w-full h-48 rounded-lg"
                      resizeMode="cover"
                    />
                    <TouchableOpacity 
                      className="absolute top-2 right-2 bg-black/50 rounded-full p-1"
                      onPress={() => setNewPackage({ ...newPackage, image: null })}
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
                value={newPackage.title}
                onChangeText={(text) => setNewPackage({...newPackage, title: text})}
                placeholder="Enter package name"
                placeholderTextColor="gray"
              />
            </View>

            <View className="gap-2">
              <Text className="text-gray-600 mb-1">Description</Text>
              <TextInput
                className="border border-gray-300 rounded-lg p-2"
                value={newPackage.description}
                onChangeText={(text) => setNewPackage({...newPackage, description: text})}
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
                value={newPackage.duration}
                onChangeText={(text) => setNewPackage({...newPackage, duration: text})}
                placeholder="Enter duration"
                placeholderTextColor="gray"
                keyboardType="numeric"
              />
            </View>

            <View className="gap-2">
              <Text className="text-gray-600 mb-1">Maximum People</Text>
              <TextInput
                className="border border-gray-300 rounded-lg p-2"
                value={newPackage.maxPeople}
                onChangeText={(text) => setNewPackage({...newPackage, maxPeople: text})}
                placeholder="Enter maximum number of people"
                placeholderTextColor="gray"
                keyboardType="numeric"
              />
            </View>

            <View className="gap-2">
              <Text className="text-gray-600 mb-1">Places to Visit (comma-separated)</Text>
              <TextInput
                className="border border-gray-300 rounded-lg p-2"
                value={newPackage.locations}
                onChangeText={(text) => setNewPackage({...newPackage, locations: text})}
                placeholder="e.g., Kathmandu, Pokhara, Chitwan"
                placeholderTextColor="gray"
              />
            </View>

            <View className="gap-2">
              <Text className="text-gray-600 mb-1">Price (in Rs.)</Text>
              <TextInput
                className="border border-gray-300 rounded-lg p-2"
                value={newPackage.price}
                onChangeText={(text) => setNewPackage({...newPackage, price: text})}
                placeholder="Enter price"
                placeholderTextColor="gray"
                keyboardType="numeric"
              />
            </View>

            <TouchableOpacity
              className="bg-blue-500 py-3 rounded-lg mt-6 mb-8"
              onPress={handleCreatePackage}
            >
              <Text className="text-white text-center font-bold">Create Package</Text>
            </TouchableOpacity>
          </View>
        </BottomSheetScrollView>
      </View>
    </BottomSheet>
  );

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View className="flex-1 bg-gray-100">
        {/* Header */}
        <View className="bg-white p-4 flex-row gap-2 items-center shadow-sm">
          <TouchableOpacity onPress={() => router.replace("/UserHome")}>
            <Ionicons name="arrow-back" size={24} color="black" />
          </TouchableOpacity>
          <Text className="text-xl font-bold">My Packages</Text>
          <TouchableOpacity 
            className="bg-blue-500 px-4 py-2 rounded-lg absolute right-4"
            onPress={() => bottomSheetRef.current?.snapToIndex(2)}
          >
            <Text className="text-white">Create</Text>
          </TouchableOpacity>
        </View>

        {/* Package List */}
        <FlatList
          data={DUMMY_PACKAGES}
          renderItem={renderPackageCard}
          keyExtractor={(item) => item.id}
          contentContainerClassName="pb-4"
          showsVerticalScrollIndicator={false}
        />

        {/* Bottom Sheet */}
        {renderBottomSheet()}

        {/* Bottom Navigation */}
        <View className="bg-white flex-row justify-around border-t p-4 border-gray-200">
          <View className="items-center">
            <TouchableOpacity onPress={() => router.replace("/GuideHome")}>
              <Ionicons name="home" size={20} color="purple" />
            </TouchableOpacity>
            <Text className="text-purple-700">Dashboard</Text>
          </View>

          <View className="items-center">
            <TouchableOpacity onPress={() => router.replace("/GuideChat")}>
              <Ionicons
                name="chatbubble-ellipses-outline"
                size={20}
                color="gray"
              />
            </TouchableOpacity>
            <Text className="text-gray-500">Chat</Text>
          </View>

          <View className="items-center">
            <TouchableOpacity onPress={() => router.replace("/GuidePackage")}>
              <Ionicons name="person-outline" size={20} color="gray" />
            </TouchableOpacity>
            <Text className="text-gray-500">Package</Text>
          </View>

          <View className="items-center">
            <TouchableOpacity onPress={() => router.replace("/GuideProfile")}>
              <Ionicons name="person-outline" size={20} color="gray" />
            </TouchableOpacity>
            <Text className="text-gray-500">Profile</Text>
          </View>
        </View>
      </View>
    </GestureHandlerRootView>
  );
};

export default GuidePackage;
