import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  ScrollView,
  StatusBar,
  SafeAreaView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import API_BASE_URL from "@/config";
import BottomNavigation from "@/components/BottomNavigation";

interface Hotel {
  id: string;
  name: string | null;
  email: string | null;
  phoneNumber: string | null;
  specialization: string | null;
  location: string | null;
  charge: number | null;
  roomsAvailable?: number | null;
  isVerified?: boolean;
  user?: {
    email: string | null;
    name?: string | null;
  };
}

// Add navigation path type
type NavigationPaths = {
  "/HotelChat": undefined;
  // Add other paths as needed
};

const HotelProfile = () => {
  const router = useRouter();
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [hotelData, setHotelData] = useState<Hotel | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Helper function to ensure we don't display NaN values
  const safeField = (field: any) => {
    if (field === null || field === undefined || field === "NaN" || (typeof field === "number" && isNaN(field))) {
      return "N/A";
    }
    return field;
  };

  useEffect(() => {
    fetchHotelDetails();
  }, []);

  const fetchHotelDetails = async () => {
    try {
      setLoading(true);
      setError(null); // Reset any previous errors
      
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        Alert.alert("Error", "No authentication token found. Please log in.");
        setLoading(false);
        return;
      }

      console.log("Fetching Hotel Details...");
      console.log("API Base URL:", API_BASE_URL);

      try {
        // Use the new profile endpoint to fetch hotel details
        const response = await axios.get(`${API_BASE_URL}/hotels/profile`, {
          headers: { Authorization: `Bearer ${token.trim()}` },
        });

        console.log("API Response:", response.data);

        // Check if the response has a hotel property
        if (response.data && response.data.hotel) {
          const hotel = response.data.hotel;
          setHotelData(hotel);
          
          // Handle profile image URL
          if (hotel.profileImage) {
            let imageUrl = hotel.profileImage;
            console.log("Original Image URL:", imageUrl);
            
            // If the URL doesn't start with http, add the API base URL
            if (!imageUrl.startsWith("http")) {
              // Remove any leading slash to avoid double slashes
              imageUrl = imageUrl.startsWith("/") ? imageUrl.slice(1) : imageUrl;
              // Update the path to use hotelUploads instead of uploads
              imageUrl = imageUrl.replace("uploads", "hotelUploads");
              imageUrl = `${API_BASE_URL}/${imageUrl}`;
            }
            
            console.log("Final Image URL:", imageUrl);
            setProfileImage(imageUrl);
          } else {
            console.log("No profile image found in response");
            setProfileImage("https://via.placeholder.com/100");
          }
        } else {
          // If no data is found, set empty hotel data instead of error
          setHotelData({
            id: "0",
            name: "N/A",
            email: "N/A",
            phoneNumber: "N/A",
            specialization: "N/A",
            location: "N/A",
            charge: 0,
            user: {
              email: "N/A"
            }
          });
          setProfileImage("https://via.placeholder.com/100");
        }
      } catch (error: any) {
        console.error("Error fetching hotel details:", error);
        // Only set error if it's not a 404 (not found) error
        if (error.response?.status !== 404) {
          setError("Failed to fetch hotel details.");
        } else {
          // If hotel not found (404), set empty hotel data
          setHotelData({
            id: "0",
            name: "N/A",
            email: "N/A",
            phoneNumber: "N/A",
            specialization: "N/A",
            location: "N/A",
            charge: 0,
            user: {
              email: "N/A"
            }
          });
          setProfileImage("https://via.placeholder.com/100");
        }
      }
    } catch (error: any) {
      console.error("Unexpected error:", error);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setProfileImage(result.assets[0].uri);
    }
  };

  const handleRegister = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = await AsyncStorage.getItem('userToken');
      if (!token) {
        setError('Authentication token not found');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/hotels/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          phoneNumber: hotelData?.phoneNumber || "",
          location: hotelData?.location || "",
          price: parseFloat(hotelData?.charge?.toString() || "0"),
          roomsAvailable: parseInt(hotelData?.roomsAvailable?.toString() || "0")
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to register hotel');
      }

      // Update local state with the registered hotel data
      setHotelData(data);
      Alert.alert('Success', 'Hotel registration completed successfully');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to register hotel');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Yes",
          style: "destructive",
          onPress: async () => {
            try {
              // Clear all stored data
              await AsyncStorage.clear();
              
              // Navigate to login screen
              router.replace("/");
            } catch (error) {
              console.error("Error during logout:", error);
              Alert.alert("Error", "Failed to logout. Please try again.");
            }
          }
        }
      ]
    );
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#000000" />
          <Text className="text-gray-600 mt-4">Loading profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
        <View className="flex-1 justify-center items-center p-6">
          <Ionicons name="alert-circle-outline" size={64} color="#000000" />
          <Text className="text-gray-800 text-lg mt-4 text-center">{error}</Text>
          <TouchableOpacity
            onPress={fetchHotelDetails}
            className="bg-black px-6 py-3 rounded-full mt-6"
          >
            <Text className="text-white">Try Again</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      
      {/* Header */}
      <View className="flex-row items-center justify-between p-4 border-b border-gray-100">
        <TouchableOpacity 
          onPress={() => router.replace("/HotelHome")}
          className="p-2"
        >
          <Ionicons name="arrow-back" size={24} color="#000000" />
        </TouchableOpacity>
        <Text className="text-xl font-bold">Profile</Text>
        <TouchableOpacity 
          onPress={() => router.push("./hotelRegister")}
          className="p-2"
        >
          <Ionicons name="create-outline" size={24} color="#000000" />
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1">
        {/* Profile Header */}
        <View className="items-center py-6">
          <View className="relative">
            <Image
              source={{
                uri: profileImage || "https://via.placeholder.com/100",
              }}
              className="w-32 h-32 rounded-full"
              onError={(error) => {
                console.error("Image loading error:", error.nativeEvent.error);
                console.error("Failed to load image from URL:", profileImage);
                setProfileImage("https://via.placeholder.com/100");
              }}
            />
          </View>
          <Text className="text-2xl font-bold mt-4">
            {hotelData ? safeField(hotelData.name || hotelData.user?.name) : "Hotel Name"}
          </Text>
          <View className="mt-2 flex-row items-center">
            {hotelData?.isVerified && (
              <View className="flex-row items-center">
                <Ionicons name="checkmark-circle" size={16} color="#10B981" />
                <Text className="ml-1 text-sm text-green-600">Verified</Text>
              </View>
            )}
          </View>
        </View>

        {/* Profile Details */}
        <View className="px-4">
          {hotelData && (
            <>
              <View className="mb-6">
                <Text className="text-sm text-gray-500 mb-2">Email</Text>
                <View className="flex-row items-center p-3 bg-gray-50 rounded-lg">
                  <Ionicons name="mail-outline" size={20} color="#6B7280" />
                  <Text className="ml-3 text-gray-800">
                    {hotelData.email || hotelData.user?.email || "Not Set"}
                  </Text>
                </View>
              </View>
              
              <View className="mb-6">
                <Text className="text-sm text-gray-500 mb-2">Contact</Text>
                <View className="flex-row items-center p-3 bg-gray-50 rounded-lg">
                  <Ionicons name="call-outline" size={20} color="#6B7280" />
                  <Text className="ml-3 text-gray-800">
                    {hotelData.phoneNumber || "Not Set"}
                  </Text>
                </View>
              </View>
              
              <View className="mb-6">
                <Text className="text-sm text-gray-500 mb-2">Itineraries</Text>
                <View className="flex-row items-center p-3 bg-gray-50 rounded-lg">
                  <Ionicons name="compass-outline" size={20} color="#6B7280" />
                  <Text className="ml-3 text-gray-800">
                    {hotelData.itineraries || "Not Set"}
                  </Text>
                </View>
              </View>
              
              <View className="mb-6">
                <Text className="text-sm text-gray-500 mb-2">Location</Text>
                <View className="flex-row items-center p-3 bg-gray-50 rounded-lg">
                  <Ionicons name="location-outline" size={20} color="#6B7280" />
                  <Text className="ml-3 text-gray-800">
                    {hotelData.location || "Not Set"}
                  </Text>
                </View>
              </View>
              
              <View className="mb-6">
                <Text className="text-sm text-gray-500 mb-2">Charge per Room/Night</Text>
                <View className="flex-row items-center p-3 bg-gray-50 rounded-lg">
                  <Ionicons name="cash-outline" size={20} color="#6B7280" />
                  <Text className="ml-3 text-gray-800">
                    {hotelData.price ? `Rs. ${hotelData.price.toString()}` : "Not Set"}
                  </Text>
                </View>
              </View>
            </>
          )}
        </View>

        {/* Complete Profile Button */}
        {!hotelData?.name && (
          <View className="px-4 mb-8">
            <TouchableOpacity
              className="bg-black py-4 rounded-lg"
              onPress={() => router.push("./hotelRegister")}
            >
              <Text className="text-white text-center font-medium">Complete Your Profile</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Logout Button */}
        <View className="px-4 mb-8">
          <TouchableOpacity
            className="bg-red-500 py-4 rounded-lg"
            onPress={handleLogout}
          >
            <Text className="text-white text-center font-medium">Logout</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
      
      {/* Bottom Navigation */}
      <View className="flex-row justify-around py-3 border-t border-gray-100">
        <TouchableOpacity
          onPress={() => router.replace("/HotelHome")}
          className="items-center"
        >
          <Ionicons name="home-outline" size={24} color="#6B7280" />
          <Text className="text-xs text-gray-500 mt-1">Home</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => router.replace("/HotelProfile")}
          className="items-center"
        >
          <Ionicons name="person" size={24} color="#000000" />
          <Text className="text-xs text-black mt-1">Profile</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default HotelProfile;
