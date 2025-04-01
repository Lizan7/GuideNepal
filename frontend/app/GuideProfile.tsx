import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import API_BASE_URL from "@/config";

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

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text className="text-gray-500 mt-4">Loading guide details...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text className="text-red-500 text-lg">{error}</Text>
        <TouchableOpacity
          onPress={fetchGuideDetails}
          className="bg-blue-500 px-4 py-2 rounded mt-4"
        >
          <Text className="text-white">Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="flex flex-col h-full bg-gray-100">
      {/* Header */}
      <View className="bg-blue-500 p-4 shadow-sm flex-row items-center">
        <TouchableOpacity onPress={() => router.replace("/GuideHome")}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text className="text-white text-lg font-bold ml-4">My Profile</Text>
      </View>

      {/* Profile Section */}
      <View className="bg-white p-6 w-full max-w-md mx-auto rounded-lg">
        <View className="items-center">
          <TouchableOpacity onPress={handleImageChange}>
            <Image
              source={{
                uri: profileImage || "https://via.placeholder.com/100",
              }}
              className="w-24 h-24 rounded-full"
              onError={(error) => {
                console.error("Image loading error:", error.nativeEvent.error);
                console.error("Failed to load image from URL:", profileImage);
                setProfileImage("https://via.placeholder.com/100");
              }}
            />
          </TouchableOpacity>
          <Text className="text-xl font-bold mt-4">
            {safeField(guideData?.name || guideData?.user?.name) || "Not Set"}
          </Text>
        </View>

        {/* Profile Details */}
        <View className="mt-8 space-y-4 gap-10">
          <View className="flex flex-row justify-between">
            <Text className="text-xl text-gray-500">Email</Text>
            <Text className="text-gray-500 text-base">
              {safeField(guideData?.email || guideData?.user?.email) || "Not Set"}
            </Text>
          </View>
          <View className="flex flex-row justify-between">
            <Text className="text-xl text-gray-500">Contact</Text>
            <Text className="text-gray-500 text-base">
              {safeField(guideData?.phoneNumber) || "Not Set"}
            </Text>
          </View>
          <View className="flex flex-row justify-between">
            <Text className="text-xl text-gray-500">Specialization</Text>
            <Text className="text-gray-500 text-base">
              {safeField(guideData?.specialization) || "Not Set"}
            </Text>
          </View>
          <View className="flex flex-row justify-between">
            <Text className="text-xl text-gray-500">Location</Text>
            <Text className="text-gray-500 text-base">
              {safeField(guideData?.location) || "Not Set"}
            </Text>
          </View>
          <View className="flex flex-row justify-between">
            <Text className="text-xl text-gray-500">Charge per Day</Text>
            <Text className="text-gray-500 text-base">
              {safeField(guideData?.charge) ? `Rs. ${guideData.charge}` : "Not Set"}
            </Text>
          </View>
          <View className="flex flex-row justify-between">
            <Text className="text-xl text-gray-500">Status</Text>
            <Text
              className={`text-base font-bold ${
                guideData?.isVerified ? "text-green-500" : "text-yellow-500"
              }`}
            >
              {guideData?.isVerified ? "Verified" : "Pending Verification"}
            </Text>
          </View>
        </View>

        {/* Edit or Verify Button */}
        <TouchableOpacity
          className="bg-blue-500 px-6 py-3 rounded-lg mt-14 w-fit"
          onPress={() => router.push("./guideRegister")}
        >
          <Text className="text-white font-semibold text-center">
            {guideData?.name ? "Edit Profile" : "Complete Profile"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default GuideProfile;
