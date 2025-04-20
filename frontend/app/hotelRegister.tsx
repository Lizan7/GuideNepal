import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  ScrollView,
  Alert,
  StatusBar,
  SafeAreaView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import API_BASE_URL from "@/config";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

interface HotelFormData {
  name: string;
  email: string;
  phoneNumber: string;
  location: string;
  itineraries: string;
  roomsAvailable: string;
  price: string;
  profileImage: string | null;
  certificate: string | null;
}

const HotelRegister = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<HotelFormData>({
    name: "",
    email: "",
    phoneNumber: "",
    location: "",
    itineraries: "",
    roomsAvailable: "",
    price: "",
    profileImage: null,
    certificate: null,
  });

  useEffect(() => {
    fetchHotelDetails();
  }, []);

  const fetchHotelDetails = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        Alert.alert("Error", "No authentication token found");
        return;
      }

      const response = await axios.get(`${API_BASE_URL}/hotels/profile/details`, {
        headers: { Authorization: `Bearer ${token.trim()}` },
      });

      if (response.data.hotels && response.data.hotels.length > 0) {
        const hotel = response.data.hotels[0];
        setFormData({
          name: hotel.name || "",
          email: hotel.email || "",
          phoneNumber: hotel.phoneNumber || "",
          location: hotel.location || "",
          itineraries: hotel.itineraries || "",
          roomsAvailable: hotel.roomsAvailable?.toString() || "",
          price: hotel.price?.toString() || "",
          profileImage: hotel.profileImage || null,
          certificate: hotel.certificate || null,
        });
      }
    } catch (error) {
      console.error("Error fetching hotel details:", error);
    }
  };

  const pickImage = async (type: "profile" | "certificate") => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });

      if (!result.canceled) {
        if (type === "profile") {
          setFormData({ ...formData, profileImage: result.assets[0].uri });
        } else {
          setFormData({ ...formData, certificate: result.assets[0].uri });
        }
      }
    } catch (error) {
      console.error("Error picking image:", error);
      Alert.alert("Error", "Failed to pick image. Please try again.");
    }
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      Alert.alert("Error", "Please enter hotel name");
      return false;
    }
    if (!formData.email.trim()) {
      Alert.alert("Error", "Please enter email");
      return false;
    }
    if (!formData.phoneNumber.trim()) {
      Alert.alert("Error", "Please enter phone number");
      return false;
    }
    if (!formData.location.trim()) {
      Alert.alert("Error", "Please enter location");
      return false;
    }
    if (!formData.itineraries.trim()) {
      Alert.alert("Error", "Please enter itineraries");
      return false;
    }
    if (!formData.roomsAvailable.trim()) {
      Alert.alert("Error", "Please enter number of rooms available");
      return false;
    }
    if (!formData.price.trim()) {
      Alert.alert("Error", "Please enter price per room");
      return false;
    }
    if (!formData.profileImage) {
      Alert.alert("Error", "Please select a profile image");
      return false;
    }
    if (!formData.certificate) {
      Alert.alert("Error", "Please select a certificate image");
      return false;
    }
    return true;
  };

  const sendRequest = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        Alert.alert("Error", "No authentication token found");
        return;
      }

      const formDataToSend = new FormData();
      formDataToSend.append("name", formData.name);
      formDataToSend.append("email", formData.email);
      formDataToSend.append("phoneNumber", formData.phoneNumber);
      formDataToSend.append("location", formData.location);
      formDataToSend.append("itineraries", formData.itineraries);
      formDataToSend.append("roomsAvailable", formData.roomsAvailable);
      formDataToSend.append("price", formData.price);

      if (formData.profileImage) {
        const profileImageUri = formData.profileImage;
        const profileImageName = profileImageUri.split("/").pop() || "profile.jpg";
        const profileImageType = "image/jpeg";

        formDataToSend.append("profileImage", {
          uri: profileImageUri,
          name: profileImageName,
          type: profileImageType,
        } as any);
      }

      if (formData.certificate) {
        const certificateUri = formData.certificate;
        const certificateName = certificateUri.split("/").pop() || "certificate.jpg";
        const certificateType = "image/jpeg";

        formDataToSend.append("certificate", {
          uri: certificateUri,
          name: certificateName,
          type: certificateType,
        } as any);
      }

      const response = await axios.post(
        `${API_BASE_URL}/hotels/verifyHotel`,
        formDataToSend,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token.trim()}`,
          },
        }
      );

      if (response.status === 201) {
        Alert.alert("Success", "Hotel registration successful!", [
          {
            text: "OK",
            onPress: () => router.replace("/HotelProfile"),
          },
        ]);
      }
    } catch (error: any) {
      console.error("Registration error:", error);
      Alert.alert(
        "Error",
        error.response?.data?.message || "Failed to register hotel. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text className="text-gray-600 mt-4">Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      {/* Header */}
      <View className="flex-row items-center justify-between p-4 border-b border-gray-100">
        <TouchableOpacity 
          onPress={() => router.back()}
          className="p-2"
        >
          <Ionicons name="arrow-back" size={24} color="#000000" />
        </TouchableOpacity>
        <Text className="text-xl font-bold">Hotel Registration</Text>
        <View className="w-10" />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView className="flex-1 p-4">
          {/* Profile Image */}
          <View className="items-center mb-6">
            <TouchableOpacity
              onPress={() => pickImage("profile")}
              className="relative"
            >
              <Image
                source={{
                  uri: formData.profileImage || "https://via.placeholder.com/100",
                }}
                className="w-32 h-32 rounded-full"
              />
              <View className="absolute bottom-0 right-0 bg-black rounded-full p-2">
                <Ionicons name="camera" size={20} color="#ffffff" />
              </View>
            </TouchableOpacity>
            <Text className="text-gray-500 mt-2">Profile Image</Text>
          </View>

          {/* Form Fields */}
          <View className="space-y-4">
            <View>
              <Text className="text-gray-500 mb-2">Hotel Name</Text>
              <TextInput
                className="bg-gray-50 p-3 rounded-lg"
                value={formData.name}
                onChangeText={(text) => setFormData({ ...formData, name: text })}
                placeholder="Enter hotel name"
              />
            </View>

            <View>
              <Text className="text-gray-500 mb-2">Email</Text>
              <TextInput
                className="bg-gray-50 p-3 rounded-lg"
                value={formData.email}
                onChangeText={(text) => setFormData({ ...formData, email: text })}
                placeholder="Enter email"
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View>
              <Text className="text-gray-500 mb-2">Phone Number</Text>
              <TextInput
                className="bg-gray-50 p-3 rounded-lg"
                value={formData.phoneNumber}
                onChangeText={(text) => setFormData({ ...formData, phoneNumber: text })}
                placeholder="Enter phone number"
                keyboardType="phone-pad"
              />
            </View>

            <View>
              <Text className="text-gray-500 mb-2">Location</Text>
              <TextInput
                className="bg-gray-50 p-3 rounded-lg"
                value={formData.location}
                onChangeText={(text) => setFormData({ ...formData, location: text })}
                placeholder="Enter location"
              />
            </View>

            <View>
              <Text className="text-gray-500 mb-2">Itineraries</Text>
              <TextInput
                className="bg-gray-50 p-3 rounded-lg"
                value={formData.itineraries}
                onChangeText={(text) => setFormData({ ...formData, itineraries: text })}
                placeholder="Enter itineraries"
                multiline
                numberOfLines={3}
              />
            </View>

            <View>
              <Text className="text-gray-500 mb-2">Rooms Available</Text>
              <TextInput
                className="bg-gray-50 p-3 rounded-lg"
                value={formData.roomsAvailable}
                onChangeText={(text) => setFormData({ ...formData, roomsAvailable: text })}
                placeholder="Enter number of rooms"
                keyboardType="number-pad"
              />
            </View>

            <View>
              <Text className="text-gray-500 mb-2">Price per Room (Rs.)</Text>
              <TextInput
                className="bg-gray-50 p-3 rounded-lg"
                value={formData.price}
                onChangeText={(text) => setFormData({ ...formData, price: text })}
                placeholder="Enter price per room"
                keyboardType="number-pad"
              />
            </View>

            {/* Certificate Image */}
            <View>
              <Text className="text-gray-500 mb-2">Certificate</Text>
              <TouchableOpacity
                onPress={() => pickImage("certificate")}
                className="border-2 border-dashed border-gray-300 rounded-lg p-4 items-center"
              >
                {formData.certificate ? (
                  <Image
                    source={{ uri: formData.certificate }}
                    className="w-full h-40 rounded-lg"
                    resizeMode="cover"
                  />
                ) : (
                  <View className="items-center">
                    <Ionicons name="document-outline" size={40} color="#6B7280" />
                    <Text className="text-gray-500 mt-2">Tap to select certificate</Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            className={`mt-6 py-4 rounded-lg ${loading ? "bg-gray-400" : "bg-black"}`}
            onPress={sendRequest}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text className="text-white text-center font-medium">Submit Registration</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default HotelRegister;
