import React from "react";
import { View, Text, TouchableOpacity, ScrollView, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

const UserMenu = () => {
  const router = useRouter();

  return (
    <View className="flex-1 bg-white">
      {/* Header Section */}
      <View className="flex-row items-center bg-gray-200 h-20 px-6">
        <Image
          source={require("../assets/images/Logo.png")}
          className="w-10 h-10"
        />
        <Text className="font-bold text-gray-800 text-xl ml-4">GuideNepal</Text>
      </View>

      <ScrollView className="px-6 py-6 gap-14">
        {/* Home Section */}
        <TouchableOpacity
          onPress={() => router.replace("/UserHome")}
          className="mb-6"
        >
          <Text className="text-lg font-bold text-gray-800">Home</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => router.replace("/UserSearch")}
          className="mb-6"
        >
          <Text className="text-lg font-bold text-gray-800">Search</Text>
        </TouchableOpacity>

        {/* Manage Section */}
        <Text className="text-gray-500 text-lg mb-4">Manage</Text>
        <TouchableOpacity
          onPress={() => router.replace("/UserChat")}
          className="mb-6"
        >
          <Text className="text-lg font-bold text-gray-800">Chat</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => router.replace("/UserBooking")}
          className="mb-6"
        >
          <Text className="text-lg font-bold text-gray-800">Bookings</Text>
        </TouchableOpacity>

        {/* Profile Section */}
        <Text className="text-gray-500 text-lg mb-4">Profile</Text>
        <TouchableOpacity
          onPress={() => router.replace("/UserProfile")}
          className="mb-6"
        >
          <Text className="text-lg font-bold text-gray-800">Edit profile</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.replace("/ChangePassword")}>
          <Text className="text-lg font-bold text-pink-700">
            Change password
          </Text>
        </TouchableOpacity>

        {/* Logout Button (Pushed Down) */}
        <TouchableOpacity
          onPress={() => router.replace("/LoginScreen")}
          className="bg-red-500 px-4 py-3 rounded-lg mt-10 mb-16"
        >
          <Text className="text-lg font-bold text-white text-center">
            Logout
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

export default UserMenu;
