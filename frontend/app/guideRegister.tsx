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
  StatusBar,
  SafeAreaView,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import API_BASE_URL from "@/config";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

interface GuideRegisterProps {}

const GuideRegister: React.FC<GuideRegisterProps> = () => {
  const [phoneNumber, setPhoneNumber] = useState<string>("");
  const [location, setLocation] = useState<string>("");
  const [specialization, setSpecialization] = useState<string>("");
  const [charge, setCharge] = useState<string>("");
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
        setCharge(guideData.charge || "");
        
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
           charge !== "" &&
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
      formData.append("charge", parseFloat(charge).toString());

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
      <SafeAreaView className="flex-1 bg-white">
        <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text className="text-gray-600 mt-4">Loading guide details...</Text>
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
          onPress={() => router.replace("/GuideProfile")}
          className="p-2"
        >
          <Ionicons name="arrow-back" size={24} color="#000000" />
        </TouchableOpacity>
        <Text className="text-xl font-bold">{isEditing ? "Edit Guide Details" : "Guide Verification"}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        className="flex-1 px-4 pt-6"
        showsVerticalScrollIndicator={false}
      >
        <View className="bg-white rounded-2xl shadow-sm p-4 mb-6">
          <Text className="text-gray-700 text-base mb-4">
            {isEditing 
              ? "Update your guide profile information below" 
              : "Complete your guide profile to start accepting bookings"}
          </Text>
          
          {/* Phone Number */}
          <View className="mb-5">
            <Text className="text-gray-700 font-medium mb-2">Phone Number <Text className="text-red-500">*</Text></Text>
            <View className="flex-row items-center border border-gray-200 rounded-xl px-4 py-3 bg-gray-50">
              <Ionicons name="call-outline" size={20} color="#6B7280" />
              <TextInput
                className="flex-1 ml-3 text-gray-800"
                placeholder="Enter your contact details"
                keyboardType="phone-pad"
                placeholderTextColor="#9CA3AF"
                value={phoneNumber}
                onChangeText={setPhoneNumber}
              />
            </View>
          </View>

          {/* Location */}
          <View className="mb-5">
            <Text className="text-gray-700 font-medium mb-2">Location <Text className="text-red-500">*</Text></Text>
            <View className="flex-row items-center border border-gray-200 rounded-xl px-4 py-3 bg-gray-50">
              <Ionicons name="location-outline" size={20} color="#6B7280" />
              <TextInput
                className="flex-1 ml-3 text-gray-800"
                placeholder="Enter your address"
                placeholderTextColor="#9CA3AF"
                value={location}
                onChangeText={setLocation}
              />
            </View>
          </View>

          {/* Specialization */}
          <View className="mb-5">
            <Text className="text-gray-700 font-medium mb-2">Specialization <Text className="text-red-500">*</Text></Text>
            <View className="flex-row items-center border border-gray-200 rounded-xl px-4 py-3 bg-gray-50">
              <Ionicons name="compass-outline" size={20} color="#6B7280" />
              <TextInput
                className="flex-1 ml-3 text-gray-800"
                placeholder="Enter specialities"
                placeholderTextColor="#9CA3AF"
                value={specialization}
                onChangeText={setSpecialization}
              />
            </View>
          </View>

          {/* Charge */}
          <View className="mb-5">
            <Text className="text-gray-700 font-medium mb-2">Daily Rate (Rs.) <Text className="text-red-500">*</Text></Text>
            <View className="flex-row items-center border border-gray-200 rounded-xl px-4 py-3 bg-gray-50">
              <Ionicons name="cash-outline" size={20} color="#6B7280" />
              <TextInput
                className="flex-1 ml-3 text-gray-800"
                placeholder="Enter your daily rate"
                keyboardType="numeric"
                placeholderTextColor="#9CA3AF"
                value={charge}
                onChangeText={setCharge}
              />
            </View>
          </View>
        </View>

        {/* Image Upload Section */}
        <View className="bg-white rounded-2xl shadow-sm p-4 mb-6">
          <Text className="text-gray-700 text-base mb-4">Upload Images</Text>
          
          {/* Profile Image */}
          <View className="mb-5">
            <Text className="text-gray-700 font-medium mb-2">
              Profile Image {!isEditing && <Text className="text-red-500">*</Text>}
            </Text>
            <TouchableOpacity
              onPress={() => pickImage(setProfileImage)}
              className="border border-gray-200 rounded-xl p-4 items-center justify-center bg-gray-50"
            >
              {profileImage ? (
                <Image
                  source={{ uri: profileImage }}
                  className="w-32 h-32 rounded-full"
                />
              ) : (
                <View className="items-center">
                  <View className="bg-blue-100 p-4 rounded-full mb-2">
                    <Ionicons name="person-outline" size={32} color="#3B82F6" />
                  </View>
                  <Text className="text-gray-500">Upload Profile Image</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          {/* Verification Image */}
          <View className="mb-5">
            <Text className="text-gray-700 font-medium mb-2">
              Verification Image {!isEditing && <Text className="text-red-500">*</Text>}
            </Text>
            <TouchableOpacity
              onPress={() => pickImage(setVerificationImage)}
              className="border border-gray-200 rounded-xl p-4 items-center justify-center bg-gray-50"
            >
              {verificationImage ? (
                <Image
                  source={{ uri: verificationImage }}
                  className="w-32 h-32 rounded-lg"
                />
              ) : (
                <View className="items-center">
                  <View className="bg-blue-100 p-4 rounded-full mb-2">
                    <Ionicons name="id-card-outline" size={32} color="#3B82F6" />
                  </View>
                  <Text className="text-gray-500">Upload Verification Image</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          onPress={sendRequest}
          disabled={!isFormValid() || loading}
          className={`w-full py-4 rounded-xl items-center mb-8 ${
            isFormValid() ? 'bg-blue-500' : 'bg-gray-300'
          }`}
        >
          {loading ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <Text className="text-white text-lg font-bold">
              {isEditing ? "Update Details" : "Submit for Verification"}
            </Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

export default GuideRegister;
