import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import API_BASE_URL from "@/config";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from 'expo-status-bar';

interface GuideRegisterProps {}

const GuideRegister: React.FC<GuideRegisterProps> = () => {
  const [phoneNumber, setPhoneNumber] = useState<string>("");
  const [location, setLocation] = useState<string>("");
  const [specialization, setSpecialization] = useState<string>("");
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [verificationImage, setVerificationImage] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const params = useLocalSearchParams();

  useEffect(() => {
    fetchGuideDetails();
  }, []);

  const fetchGuideDetails = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        Alert.alert("Error", "No token found, please log in again.");
        return;
      }

      const response = await axios.get(`${API_BASE_URL}/guides/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data) {
        const guideData = response.data;
        setPhoneNumber(guideData.phoneNumber || "");
        setLocation(guideData.location || "");
        setSpecialization(guideData.specialization || "");
        
        // Set profile image if it exists
        if (guideData.profileImage) {
          const imageUrl = guideData.profileImage.startsWith('http')
            ? guideData.profileImage
            : `${API_BASE_URL}/${guideData.profileImage.replace('uploads', 'guideVerification')}`;
          setProfileImage(imageUrl);
        }

        // Set verification image if it exists
        if (guideData.verificationImage) {
          const imageUrl = guideData.verificationImage.startsWith('http')
            ? guideData.profileImage
            : `${API_BASE_URL}/${guideData.verificationImage.replace('uploads', 'guideVerification')}`;
          setVerificationImage(imageUrl);
        }

        setIsEditing(true);
      }
    } catch (error: any) {
      console.error("Error fetching guide details:", error);
      Alert.alert("Error", "Failed to fetch guide details.");
    } finally {
      setLoading(false);
    }
  };

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

  const isFormValid = () => {
    return phoneNumber.trim() !== "" && 
           location.trim() !== "" && 
           specialization.trim() !== "" &&
           (profileImage !== null || isEditing) &&
           (verificationImage !== null || isEditing);
  };

  const sendRequest = async () => {
    if (!isFormValid()) {
      Alert.alert("Error", "Please fill in all required fields");
      return;
    }

    try {
      setLoading(true);
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        Alert.alert("Error", "No token found, please log in again.");
        return;
      }

      const formData = new FormData();
      formData.append("phoneNumber", phoneNumber);
      formData.append("location", location);
      formData.append("specialization", specialization);

      // Only append images if they are new (local URI)
      if (profileImage && profileImage.startsWith('file://')) {
        formData.append("profileImage", {
          uri: profileImage,
          name: "profile.jpg",
          type: "image/jpeg",
        } as any);
      }

      if (verificationImage && verificationImage.startsWith('file://')) {
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

      Alert.alert("Success", isEditing ? "Guide details updated successfully" : "Guide details stored successfully");
      router.push("./GuideProfile");
    } catch (error: any) {
      console.log(error.response ? error.response.data : error.message);
      Alert.alert("Error", isEditing ? "Failed to update guide details." : "Failed to submit guide details.");
    } finally {
      setLoading(false);
    }
  };

  if (loading && !isEditing) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text className="text-gray-500 mt-4">Loading guide details...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1">
      <StatusBar style="light" backgroundColor="#3B82F6" />
      <View className="bg-[#3B82F6] pt-12">
        <View className="flex-row items-center p-4 gap-4">
          <TouchableOpacity onPress={() => router.replace("/GuideProfile")}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text className="font-bold text-lg text-white">
            {isEditing ? "Edit Guide Details" : "Guide Verification"}
          </Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={{ flexGrow: 1, backgroundColor: "#fff" }}
      >
        <View className="p-4 mt-8">
          {/* Phone Number */}
          <Text className="text-gray-700 mb-2">Phone Number *</Text>
          <TextInput
            className="w-full p-3 border border-gray-300 rounded-lg mb-4"
            placeholder="Enter your contact details"
            keyboardType="phone-pad"
            placeholderTextColor="gray"
            value={phoneNumber}
            onChangeText={setPhoneNumber}
          />

          {/* Location */}
          <Text className="text-gray-700 mb-2">Location *</Text>
          <TextInput
            className="w-full p-3 border border-gray-300 rounded-lg mb-4"
            placeholder="Enter your address"
            placeholderTextColor="gray"
            value={location}
            onChangeText={setLocation}
          />

          {/* Specialization */}
          <Text className="text-gray-700 mb-2">Specialization *</Text>
          <TextInput
            className="w-full p-3 border border-gray-300 rounded-lg mb-4"
            placeholder="Enter specialities"
            placeholderTextColor="gray"
            value={specialization}
            onChangeText={setSpecialization}
          />

          {/* Profile Image */}
          <Text className="text-gray-700 mb-2">Profile Image {!isEditing ? '*' : ''}</Text>
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
          <Text className="text-gray-700 mb-2">Verification Image {!isEditing ? '*' : ''}</Text>
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
            className={`w-full p-4 rounded-lg items-center mt-5 ${
              isFormValid() ? 'bg-blue-500' : 'bg-gray-400'
            }`}
            disabled={!isFormValid() || loading}
          >
            <Text className="text-white text-lg font-bold">
              {isEditing ? "Update Details" : "Submit for Verification"}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

export default GuideRegister;
