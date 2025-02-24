import React, { useState } from "react";
import { View, Text, TouchableOpacity, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";

const router = useRouter();

const HotelProfile = () => {
  const [profileImage, setProfileImage] = useState(null);

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

  return (
    <View className="flex flex-col h-full bg-gray-100">
      {/* Header */}
      <View className="bg-white w-full flex-row items-center p-4">
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
            />
          </TouchableOpacity>
          <Text className="text-xl font-bold mt-4">Martijn Grooten</Text>
        </View>

        {/* Profile Details */}
        <View className="mt-8 space-y-4 gap-10">
          <View className="flex flex-row justify-between">
            <Text className="text-xl text-gray-500">Email</Text>
            <Text className="text-gray-500 text-base">
              martijn.grooten@gmail.com
            </Text>
          </View>
          <View className="flex flex-row justify-between">
            <Text className="text-xl text-gray-500">Contact</Text>
            <Text className="text-gray-500 text-base">+123456789</Text>
          </View>
          <View className="flex flex-row justify-between">
            <Text className="text-xl text-gray-500">Specialization</Text>
            <Text className="text-gray-500 text-base">Hotel Management</Text>
          </View>
          <View className="flex flex-row justify-between">
            <Text className="text-xl text-gray-500">Address</Text>
            <Text className="text-gray-500 text-base">Kathmandu, Nepal</Text>
          </View>
          <View className="flex flex-row justify-between">
            <Text className="text-xl text-gray-500">Status</Text>
            <Text className="text-gray-500 text-base">Verified</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

export default HotelProfile;
