import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, usePathname } from "expo-router";

const UserNavigation = () => {
  const router = useRouter();
  const pathname = usePathname();

  const isActive = (path: string) => {
    return pathname === path;
  };

  return (
    <View className="bg-white flex-row justify-around p-4 border-t border-gray-200">
      <TouchableOpacity 
        onPress={() => router.replace("/UserHome")}
        className="items-center"
      >
        <Ionicons 
          name={isActive("/UserHome") ? "home" : "home-outline"} 
          size={24} 
          color={isActive("/UserHome") ? "#9333EA" : "#6B7280"} 
        />
        <Text className={`text-xs mt-1 ${isActive("/UserHome") ? "text-purple-700" : "text-gray-500"}`}>
          Explore
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        onPress={() => router.replace("/UserBooking")}
        className="items-center"
      >
        <Ionicons 
          name={isActive("/UserBooking") ? "ticket" : "ticket-outline"} 
          size={24} 
          color={isActive("/UserBooking") ? "#9333EA" : "#6B7280"} 
        />
        <Text className={`text-xs mt-1 ${isActive("/UserBooking") ? "text-purple-700" : "text-gray-500"}`}>
          Booking
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        onPress={() => router.replace("/UserChat")}
        className="items-center"
      >
        <Ionicons 
          name={isActive("/UserChat") ? "chatbubble-ellipses" : "chatbubble-ellipses-outline"} 
          size={24} 
          color={isActive("/UserChat") ? "#9333EA" : "#6B7280"} 
        />
        <Text className={`text-xs mt-1 ${isActive("/UserChat") ? "text-purple-700" : "text-gray-500"}`}>
          Chat
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        onPress={() => router.replace("/UserPackage")}
        className="items-center"
      >
        <Ionicons 
          name={isActive("/UserPackage") ? "cube" : "cube-outline"} 
          size={24} 
          color={isActive("/UserPackage") ? "#9333EA" : "#6B7280"} 
        />
        <Text className={`text-xs mt-1 ${isActive("/UserPackage") ? "text-purple-700" : "text-gray-500"}`}>
          Package
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default UserNavigation; 