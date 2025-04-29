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

const GuideProfile = () => {
  const router = useRouter();
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [guideData, setGuideData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Helper function to ensure we don't display NaN values
  const safeField = (field: any) => {
    if (
      field === null ||
      field === undefined ||
      field === "NaN" ||
      (typeof field === "number" && isNaN(field))
    ) {
      return "N/A";
    }
    return field;
  };

  useEffect(() => {
    fetchGuideDetails();
  }, []);

  const fetchGuideDetails = async () => {
    try {
      setLoading(true);
      setError(null); // Reset any previous errors

      const token = await AsyncStorage.getItem("token");
      if (!token) {
        Alert.alert("Error", "No authentication token found. Please log in.");
        setLoading(false);
        return;
      }

      console.log("Fetching Guide Details...");
      console.log("API Base URL:", API_BASE_URL);

      const response = await axios.get(`${API_BASE_URL}/guides/profile`, {
        headers: { Authorization: `Bearer ${token.trim()}` },
      });

      console.log("API Response:", response.data);

      if (response.data) {
        setGuideData(response.data);

        // Handle profile image URL
        if (response.data.profileImage) {
          let imageUrl = response.data.profileImage;
          console.log("Original Image URL:", imageUrl);

          // If the URL doesn't start with http, add the API base URL
          if (!imageUrl.startsWith("http")) {
            // Remove any leading slash to avoid double slashes
            imageUrl = imageUrl.startsWith("/") ? imageUrl.slice(1) : imageUrl;
            // Update the path to use guideVerification instead of uploads
            imageUrl = imageUrl.replace("uploads", "guideVerification");
            imageUrl = `${API_BASE_URL}/${imageUrl}`;
          }

          console.log("Final Image URL:", imageUrl);
          setProfileImage(imageUrl);
        } else {
          console.log("No profile image found in response");
          setProfileImage("https://via.placeholder.com/100");
        }
      } else {
        // If no data is found, set empty guide data instead of error
        setGuideData({
          name: null,
          email: null,
          phoneNumber: null,
          specialization: null,
          location: null,
          isVerified: false
        });
        setProfileImage("https://via.placeholder.com/100");
      }
    } catch (error: any) {
      console.error("Error fetching guide details:", error);
      // Only set error if it's not a 404 (not found) error
      if (error.response?.status !== 404) {
        setError("Failed to fetch guide details.");
      } else {
        // If guide not found (404), set empty guide data
        setGuideData({
          name: null,
          email: null,
          phoneNumber: null,
          specialization: null,
          location: null,
          isVerified: false
        });
        setProfileImage("https://via.placeholder.com/100");
      }
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
          text: "Logout",
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
            onPress={fetchGuideDetails}
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
          onPress={() => router.replace("/GuideHome")}
          className="p-2"
        >
          <Ionicons name="arrow-back" size={24} color="#000000" />
        </TouchableOpacity>
        <Text className="text-xl font-bold">Profile</Text>
        <TouchableOpacity 
          onPress={() => router.push("./guideRegister")}
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
            {safeField(guideData?.name || guideData?.user?.name) || "Not Set"}
          </Text>
          <View className="mt-2 flex-row items-center">
            <Ionicons 
              name={guideData?.isVerified ? "checkmark-circle" : "time"} 
              size={16} 
              color={guideData?.isVerified ? "#10B981" : "#F59E0B"} 
            />
            <Text className={`ml-1 text-sm ${guideData?.isVerified ? "text-green-600" : "text-yellow-600"}`}>
              {guideData?.isVerified ? "Verified Guide" : "Pending Verification"}
            </Text>
          </View>
        </View>

        {/* Profile Details */}
        <View className="px-4">
          <View className="mb-6">
            <Text className="text-sm text-gray-500 mb-2">Email</Text>
            <View className="flex-row items-center p-3 bg-gray-50 rounded-lg">
              <Ionicons name="mail-outline" size={20} color="#6B7280" />
              <Text className="ml-3 text-gray-800">
                {safeField(guideData?.email || guideData?.user?.email) || "Not Set"}
              </Text>
            </View>
          </View>
          
          <View className="mb-6">
            <Text className="text-sm text-gray-500 mb-2">Contact</Text>
            <View className="flex-row items-center p-3 bg-gray-50 rounded-lg">
              <Ionicons name="call-outline" size={20} color="#6B7280" />
              <Text className="ml-3 text-gray-800">
                {safeField(guideData?.phoneNumber) || "Not Set"}
              </Text>
            </View>
          </View>
          
          <View className="mb-6">
            <Text className="text-sm text-gray-500 mb-2">Specialization</Text>
            <View className="flex-row items-center p-3 bg-gray-50 rounded-lg">
              <Ionicons name="compass-outline" size={20} color="#6B7280" />
              <Text className="ml-3 text-gray-800">
                {safeField(guideData?.specialization) || "Not Set"}
              </Text>
            </View>
          </View>
          
          <View className="mb-6">
            <Text className="text-sm text-gray-500 mb-2">Location</Text>
            <View className="flex-row items-center p-3 bg-gray-50 rounded-lg">
              <Ionicons name="location-outline" size={20} color="#6B7280" />
              <Text className="ml-3 text-gray-800">
                {safeField(guideData?.location) || "Not Set"}
              </Text>
            </View>
          </View>
          
          <View className="mb-6">
            <Text className="text-sm text-gray-500 mb-2">Charge per Day</Text>
            <View className="flex-row items-center p-3 bg-gray-50 rounded-lg">
              <Ionicons name="cash-outline" size={20} color="#6B7280" />
              <Text className="ml-3 text-gray-800">
                {safeField(guideData?.charge) ? `Rs. ${guideData.charge}` : "Not Set"}
              </Text>
            </View>
          </View>
        </View>

        {/* Complete Profile Button */}
        {!guideData?.name && (
          <View className="px-4 mb-8">
            <TouchableOpacity
              className="bg-black py-4 rounded-lg"
              onPress={() => router.push("./guideRegister")}
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
          onPress={() => router.replace("/GuideHome")}
          className="items-center"
        >
          <Ionicons name="home-outline" size={24} color="#6B7280" />
          <Text className="text-xs text-gray-500 mt-1">Home</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => router.replace("/GuideChat")}
          className="items-center"
        >
          <Ionicons name="chatbubble-outline" size={24} color="#6B7280" />
          <Text className="text-xs text-gray-500 mt-1">Chat</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => router.replace("/GuidePackage")}
          className="items-center"
        >
          <Ionicons name="briefcase-outline" size={24} color="#6B7280" />
          <Text className="text-xs text-gray-500 mt-1">Packages</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => router.replace("/GuideProfile")}
          className="items-center"
        >
          <Ionicons name="person" size={24} color="#000000" />
          <Text className="text-xs text-black mt-1">Profile</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default GuideProfile;
