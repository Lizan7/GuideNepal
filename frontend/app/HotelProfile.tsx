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

const HotelProfile = () => {
  const router = useRouter();
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [hotelData, setHotelData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

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

      const response = await axios.get(`${API_BASE_URL}/hotels/hotelDetails`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.hotels && response.data.hotels.length > 0) {
        const hotel = response.data.hotels[0];
        setHotelData(hotel);
        if (hotel.profileImage) {
          setProfileImage(`${API_BASE_URL}${hotel.profileImage}`);
        } else {
          setProfileImage("https://via.placeholder.com/100");
        }
      } else {
        // If no hotel data exists yet, set empty hotel data
        setHotelData({
          name: null,
          email: null,
          phoneNumber: null,
          location: null,
          itineraries: null,
          roomsAvailable: null,
          price: null,
          isVerified: false
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
          name: null,
          email: null,
          phoneNumber: null,
          location: null,
          itineraries: null,
          roomsAvailable: null,
          price: null,
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
        <ActivityIndicator size="large" color="#00CC66" />
        <Text className="text-gray-500 mt-4">Loading hotel details...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text className="text-red-500 text-lg">{error}</Text>
        <TouchableOpacity
          onPress={fetchHotelDetails}
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
      <View className="bg-green-500 p-4 shadow-sm flex-row items-center">
        <TouchableOpacity onPress={() => router.replace("/HotelHome")}>
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text className="text-black text-lg font-bold ml-4">My Profile</Text>
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
              onError={() => setProfileImage("https://via.placeholder.com/100")} // ✅ Fallback image if error occurs
            />
          </TouchableOpacity>
          <Text className="text-xl font-bold mt-4">
            {hotelData?.name || "Hotel Name"}
          </Text>
        </View>

        {/* Profile Details */}
        <View className="mt-8 space-y-4 gap-10">
          <View className="flex flex-row justify-between">
            <Text className="text-xl text-gray-500">Email</Text>
            <Text className="text-gray-500 text-base">
              {hotelData?.email || "N/A"}
            </Text>
          </View>
          <View className="flex flex-row justify-between">
            <Text className="text-xl text-gray-500">Contact</Text>
            <Text className="text-gray-500 text-base">
              {hotelData?.phoneNumber || "N/A"}
            </Text>
          </View>
          <View className="flex flex-row justify-between">
            <Text className="text-xl text-gray-500">Itineraries</Text>
            <Text className="text-gray-500 text-base">
              {hotelData?.itineraries || "N/A"}
            </Text>
          </View>
          <View className="flex flex-row justify-between">
            <Text className="text-xl text-gray-500">Address</Text>
            <Text className="text-gray-500 text-base">
              {hotelData?.location || "N/A"}
            </Text>
          </View>
          <View className="flex flex-row justify-between">
            <Text className="text-xl text-gray-500">Rooms Available</Text>
            <Text className="text-gray-500 text-base">
              {hotelData?.roomsAvailable || "N/A"}
            </Text>
          </View>
          <View className="flex flex-row justify-between">
            <Text className="text-xl text-gray-500">Price</Text>
            <Text className="text-gray-500 text-base">
              {hotelData?.price ? `Rs. ${hotelData.price}` : "N/A"}
            </Text>
          </View>
          <View className="flex flex-row justify-between">
            <Text className="text-xl text-gray-500">Status</Text>
            <Text
              className={`text-base font-bold ${
                hotelData?.isVerified ? "text-green-500" : "text-red-500"
              }`}
            >
              {hotelData?.isVerified ? "Verified" : "Pending Verification"}
            </Text>
          </View>
        </View>

        {/* Edit or Verify Button */}
        <TouchableOpacity
          className="bg-green-500 px-6 py-3 rounded-lg mt-14 ml-12"
          onPress={() => router.push("./hotelRegister")}
        >
          <Text className="text-white font-semibold text-center">
            {hotelData ? "Edit" : "Verify"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default HotelProfile;
