import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

const UserProfile = () => {
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [interests, setInterests] = useState("");
  const [description, setDescription] = useState("");

  const router = useRouter();

  // Handle image selection
  const pickImage = async () => {
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

  // Handle profile submission
  const handleSubmit = () => {
    if (!name || !interests || !description) {
      Alert.alert("Error", "Please fill all the fields before submitting!");
      return;
    }
    Alert.alert("Success", "Profile updated successfully!");
  };

  return (
    <View className="flex-1 bg-white px-6 py-8">
      <View className="flex-row items-center gap-5">
        <TouchableOpacity onPress={() => router.replace("/UserMenu")}>
          <Ionicons name="chevron-back-outline" size={24} color="black" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-gray-800">Edit Profile</Text>
      </View>

      {/* Profile Image Upload */}
      <View className="items-center mb-6 mt-10">
        <TouchableOpacity onPress={pickImage} className="relative">
          {profileImage ? (
            <Image
              source={{ uri: profileImage }}
              className="w-32 h-32 rounded-full"
            />
          ) : (
            <View className="w-32 h-32 rounded-full bg-gray-300 items-center justify-center">
              <Ionicons name="camera-outline" size={40} color="white" />
            </View>
          )}
        </TouchableOpacity>
        <Text className="text-gray-600 mt-2">
          Tap to change profile picture
        </Text>
      </View>

      {/* Name Input */}
      <Text className="text-lg font-bold text-gray-800 mb-2">Name</Text>
      <TextInput
        className="border border-gray-300 rounded-lg px-4 py-3 mb-4"
        placeholder="Enter your name"
        value={name}
        onChangeText={setName}
      />

      {/* Interests Input */}
      <Text className="text-lg font-bold text-gray-800 mb-2">Interests</Text>
      <TextInput
        className="border border-gray-300 rounded-lg px-4 py-3 mb-4"
        placeholder="Enter your interests"
        value={interests}
        onChangeText={setInterests}
      />

      {/* Description Input */}
      <Text className="text-lg font-bold text-gray-800 mb-2">Description</Text>
      <TextInput
        className="border border-gray-300 rounded-lg px-4 py-3 mb-6"
        placeholder="Enter a short description about yourself"
        multiline
        numberOfLines={3}
        value={description}
        onChangeText={setDescription}
      />

      {/* Submit Button */}
      <TouchableOpacity
        onPress={handleSubmit}
        className="bg-pink-600 py-3 rounded-lg"
      >
        <Text className="text-lg font-bold text-white text-center">Submit</Text>
      </TouchableOpacity>
    </View>
  );
};

export default UserProfile;
