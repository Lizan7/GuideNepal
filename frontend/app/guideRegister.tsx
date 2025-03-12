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
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

interface GuideRegisterProps {}

const GuideRegister: React.FC<GuideRegisterProps> = () => {
  const [phoneNumber, setPhoneNumber] = useState<string>("");
  const [location, setLocation] = useState<string>("");
  const [specialization, setSpecialization] = useState<string>("");
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [verificationImage, setVerificationImage] = useState<string | null>(
    null
  );

  const pickImage = async (
    setImage: React.Dispatch<React.SetStateAction<string | null>>
  ) => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
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
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        Alert.alert("Error", "No token found, please log in again.");
        return;
      }

      const formData = new FormData();
      formData.append("phoneNumber", phoneNumber);
      formData.append("location", location);
      formData.append("specialization", specialization);
      if (profileImage) {
        formData.append("profileImage", {
          uri: profileImage,
          name: "profile.jpg",
          type: "image/jpeg",
        } as any);
      }
      if (verificationImage) {
        formData.append("verificationImage", {
          uri: verificationImage,
          name: "verification.jpg",
          type: "image/jpeg",
        } as any);
      }

      const response = await axios.post(
        `${API_BASE_URL}/guides/verifyGuide`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      Alert.alert("Success", "Guide details stored successfully");
      router.push("./GuideProfile");
      console.log(response.data);
    } catch (error: any) {
      console.log(error.response ? error.response.data : error.message);
      Alert.alert("Error", "Failed to submit guide details.");
    }
  };

  return (
    <ScrollView
      contentContainerStyle={{ flexGrow: 1, backgroundColor: "#fff" }}
    >
      <View className="flex-row items-center p-4 bg-[#3B82F6] gap-4">
        <TouchableOpacity onPress={() => router.replace("/GuideProfile")}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text className="font-bold text-lg text-white">Guide Verification</Text>
      </View>

      <View className="p-4 mt-8">
        {/* Phone Number */}
        <Text className="text-gray-700 mb-2">Phone Number</Text>
        <TextInput
          className="w-full p-3 border border-gray-300 rounded-lg mb-4"
          placeholder="Enter your contact details"
          keyboardType="phone-pad"
          placeholderTextColor="gray"
          value={phoneNumber}
          onChangeText={setPhoneNumber}
        />

        {/* Location */}
        <Text className="text-gray-700 mb-2">Location</Text>
        <TextInput
          className="w-full p-3 border border-gray-300 rounded-lg mb-4"
          placeholder="Enter your address"
          placeholderTextColor="gray"
          value={location}
          onChangeText={setLocation}
        />

        {/* Specialization */}
        <Text className="text-gray-700 mb-2">Specialization</Text>
        <TextInput
          className="w-full p-3 border border-gray-300 rounded-lg mb-4"
          placeholder="Enter specialities"
          placeholderTextColor="gray"
          value={specialization}
          onChangeText={setSpecialization}
        />

        {/* Profile Image */}
        <Text className="text-gray-700 mb-2">Profile Image</Text>
        <TouchableOpacity
          onPress={() => pickImage(setProfileImage)}
          className="w-full p-4 border border-gray-300 rounded-lg mb-4 justify-center"
        >
          {profileImage ? (
            <Image
              source={{ uri: profileImage }}
              className="w-24 h-24 rounded-lg"
            />
          ) : (
            <Text className="text-gray-500">Upload Profile Image</Text>
          )}
        </TouchableOpacity>

        {/* Verification Image */}
        <Text className="text-gray-700 mb-2">Verification Image</Text>
        <TouchableOpacity
          onPress={() => pickImage(setVerificationImage)}
          className="w-full p-4 border border-gray-300 rounded-lg mb-4 justify-center"
        >
          {verificationImage ? (
            <Image
              source={{ uri: verificationImage }}
              className="w-24 h-24 rounded-lg"
            />
          ) : (
            <Text className="text-gray-500">Upload Verification Image</Text>
          )}
        </TouchableOpacity>

        {/* Submit Button */}
        <TouchableOpacity
          onPress={sendRequest}
          className="w-full bg-blue-500 p-4 rounded-lg items-center mt-5"
        >
          <Text className="text-white text-lg font-bold">
            Submit for Verification
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default GuideRegister;
