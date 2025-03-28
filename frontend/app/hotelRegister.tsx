import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  ScrollView,
  Alert,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import API_BASE_URL from "@/config";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

const HotelRegister = () => {
  const router = useRouter();

  // Form Fields (Only needed inputs)
  const [phoneNumber, setPhoneNumber] = useState<string>("");
  const [location, setLocation] = useState<string>("");
  const [price, setPrice] = useState<string>("");
  const [itineraries, setItineraries] = useState<string>("");
  const [roomsAvailable, setRoomsAvailable] = useState<string>("");
  const [certificate, setCertificate] = useState<string | null>(null);
  const [hotelProfile, setHotelProfile] = useState<string | null>(null);

  // Function to pick an image
  const pickImage = async (
    setImage: React.Dispatch<React.SetStateAction<string | null>>
  ) => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const sendRequest = async () => {
    try {
      const token = await AsyncStorage.getItem("token"); // Retrieve token

      if (!token) {
        Alert.alert("Error", "No token found, please log in again.");
        return;
      }

      const formData = new FormData();
      formData.append("phoneNumber", phoneNumber);
      formData.append("location", location);
      formData.append("price", price);
      formData.append("itineraries", itineraries);
      formData.append("roomsAvailable", roomsAvailable);

      if (certificate) {
        formData.append("certificate", {
          uri: certificate,
          name: "certificate.jpg",
          type: "image/jpeg",
        } as any);
      }

      if (hotelProfile) {
        formData.append("hotelProfile", {
          uri: hotelProfile,
          name: "hotelProfile.jpg",
          type: "image/jpeg",
        } as any);
      }

      const response = await axios.post(
        `${API_BASE_URL}/hotels/verify`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`, // ✅ Ensure token is sent
            "Content-Type": "multipart/form-data",
          },
        }
      );

      Alert.alert("Success", "Hotel registered successfully!");
      router.push("/HotelProfile");
    } catch (error: any) {
      console.log(error.response ? error.response.data : error.message);
      Alert.alert("Error", "Failed to register hotel.");
    }
  };

  return (
    <ScrollView
      contentContainerStyle={{ flexGrow: 1, backgroundColor: "#fff" }}
    >
      {/* Header */}
      <View className="flex-row items-center p-4 bg-green-500 gap-4">
        <TouchableOpacity onPress={() => router.replace("/HotelProfile")}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text className="font-bold text-lg text-white">Hotel Registration</Text>
      </View>

      {/* Form */}
      <View className="p-4 mt-8">
        {/* Phone Number */}
        <Text className="text-gray-700 mb-2">Phone Number</Text>
        <TextInput
          className="w-full p-3 border border-gray-300 rounded-lg mb-4"
          placeholder="Enter contact number"
          placeholderTextColor="gray"
          keyboardType="phone-pad"
          value={phoneNumber}
          onChangeText={setPhoneNumber}
        />

        {/* Location */}
        <Text className="text-gray-700 mb-2">Location</Text>
        <TextInput
          className="w-full p-3 border border-gray-300 rounded-lg mb-4"
          placeholder="Enter hotel location"
          placeholderTextColor="gray"
          value={location}
          onChangeText={setLocation}
        />

        {/* Price */}
        <Text className="text-gray-700 mb-2">Price</Text>
        <TextInput
          className="w-full p-3 border border-gray-300 rounded-lg mb-4"
          placeholder="Enter hotel price/night"
          placeholderTextColor="gray"
          keyboardType="numeric"
          value={price}
          onChangeText={setPrice}
        />

        {/* Itineraries */}
        <Text className="text-gray-700 mb-2">Itineraries</Text>
        <TextInput
          className="w-full p-3 border border-gray-300 rounded-lg mb-4"
          placeholder="Enter itineraries details"
          placeholderTextColor="gray"
          value={itineraries}
          onChangeText={setItineraries}
        />

        {/* Rooms Available */}
        <Text className="text-gray-700 mb-2">Rooms Available</Text>
        <TextInput
          className="w-full p-3 border border-gray-300 rounded-lg mb-4"
          placeholder="Enter number of available rooms"
          placeholderTextColor="gray"
          keyboardType="numeric"
          value={roomsAvailable}
          onChangeText={setRoomsAvailable}
        />

        {/* Hotel Profile Image Upload */}
        <Text className="text-gray-700 mb-2">Hotel Profile Image</Text>
        <TouchableOpacity
          onPress={() => pickImage(setHotelProfile)}
          className="w-full p-4 border border-gray-300 rounded-lg mb-4"
        >
          {hotelProfile ? (
            <Image
              source={{ uri: hotelProfile }}
              className="w-24 h-24 rounded-lg"
            />
          ) : (
            <Text className="text-gray-500">Upload Hotel Profile Image</Text>
          )}
        </TouchableOpacity>

        {/* Certificate Upload */}
        <Text className="text-gray-700 mb-2">Certificate</Text>
        <TouchableOpacity
          onPress={() => pickImage(setCertificate)}
          className="w-full p-4 border border-gray-300 rounded-lg mb-4"
        >
          {certificate ? (
            <Image
              source={{ uri: certificate }}
              className="w-24 h-24 rounded-lg"
            />
          ) : (
            <Text className="text-gray-500">Upload Certificate</Text>
          )}
        </TouchableOpacity>

        {/* Submit Button */}
        <TouchableOpacity
          onPress={sendRequest}
          className="w-full bg-green-500 p-4 rounded-lg items-center mt-5"
        >
          <Text className="text-white text-lg font-bold">
            Submit for Verification
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default HotelRegister;
