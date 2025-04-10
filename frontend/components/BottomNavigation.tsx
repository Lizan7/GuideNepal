import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from "@expo/vector-icons";
import { useRouter, usePathname } from 'expo-router';

interface BottomNavigationProps {
  currentRoute?: string;
}

const BottomNavigation: React.FC<BottomNavigationProps> = ({ currentRoute }) => {
  const router = useRouter();
  const pathname = usePathname();
  
  // Determine the current route if not explicitly provided
  const activeRoute = currentRoute || pathname;
  
  const isActive = (route: string) => {
    return activeRoute.includes(route);
  };
  
  const navigateTo = (route: string) => {
    router.replace(route);
  };
  
  return (
    <View className="flex-row justify-around py-3 border-t border-gray-100 bg-white">
      <TouchableOpacity
        onPress={() => navigateTo("/GuideHome")}
        className="items-center"
      >
        <Ionicons 
          name={isActive("GuideHome") ? "home" : "home-outline"} 
          size={24} 
          color={isActive("GuideHome") ? "#000000" : "#6B7280"} 
        />
        <Text className={`text-xs mt-1 ${isActive("GuideHome") ? "text-black" : "text-gray-500"}`}>
          Home
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        onPress={() => navigateTo("/GuideChat")}
        className="items-center"
      >
        <Ionicons 
          name={isActive("GuideChat") ? "chatbubble" : "chatbubble-outline"} 
          size={24} 
          color={isActive("GuideChat") ? "#000000" : "#6B7280"} 
        />
        <Text className={`text-xs mt-1 ${isActive("GuideChat") ? "text-black" : "text-gray-500"}`}>
          Chat
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        onPress={() => navigateTo("/GuidePackage")}
        className="items-center"
      >
        <Ionicons 
          name={isActive("GuidePackage") ? "briefcase" : "briefcase-outline"} 
          size={24} 
          color={isActive("GuidePackage") ? "#000000" : "#6B7280"} 
        />
        <Text className={`text-xs mt-1 ${isActive("GuidePackage") ? "text-black" : "text-gray-500"}`}>
          Packages
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        onPress={() => navigateTo("/GuideProfile")}
        className="items-center"
      >
        <Ionicons 
          name={isActive("GuideProfile") ? "person" : "person-outline"} 
          size={24} 
          color={isActive("GuideProfile") ? "#000000" : "#6B7280"} 
        />
        <Text className={`text-xs mt-1 ${isActive("GuideProfile") ? "text-black" : "text-gray-500"}`}>
          Profile
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default BottomNavigation; 