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
      contentContainerStyle={{
        flexGrow: 1,
        alignItems: "center",
        padding: 20,
        backgroundColor: "#fff",
      }}
    >
      <Text className="text-2xl font-bold mb-5">Guide Verification</Text>

      {/* Profile Image */}
      <TouchableOpacity
        onPress={() => pickImage(setProfileImage)}
        className="w-28 h-28 rounded-full bg-gray-200 items-center justify-center mb-5"
      >
        {profileImage ? (
          <Image
            source={{ uri: profileImage }}
            className="w-full h-full rounded-full"
          />
        ) : (
          <Text className="text-gray-500">Upload Profile Image</Text>
        )}
      </TouchableOpacity>

      {/* Phone Number */}
      <TextInput
        className="w-full p-3 border border-gray-300 rounded-lg mb-4"
        placeholder="Phone Number"
        keyboardType="phone-pad"
        value={phoneNumber}
        onChangeText={setPhoneNumber}
      />

      {/* Location */}
      <TextInput
        className="w-full p-3 border border-gray-300 rounded-lg mb-4"
        placeholder="Location"
        value={location}
        onChangeText={setLocation}
      />

      {/* Specialization */}
      <TextInput
        className="w-full p-3 border border-gray-300 rounded-lg mb-4"
        placeholder="Specialization"
        value={specialization}
        onChangeText={setSpecialization}
      />

      {/* Verification Image */}
      <TouchableOpacity
        onPress={() => pickImage(setVerificationImage)}
        className="w-28 h-28 rounded-full bg-gray-200 items-center justify-center mb-5"
      >
        {verificationImage ? (
          <Image
            source={{ uri: verificationImage }}
            className="w-full h-full rounded-full"
          />
        ) : (
          <Text className="text-gray-500">Upload Verification Image</Text>
        )}
      </TouchableOpacity>

      {/* Submit Button */}
      <TouchableOpacity
        onPress={sendRequest}
        className="w-full bg-blue-500 p-4 rounded-lg items-center"
      >
        <Text className="text-white text-lg font-bold">
          Submit for Verification
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default GuideRegister;
