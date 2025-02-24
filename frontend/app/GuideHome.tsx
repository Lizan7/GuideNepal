import React from "react";
import { View, Text, Image, FlatList, TouchableOpacity } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

const Tab = createBottomTabNavigator();
const router = useRouter(); // Router for Navigation

const bookingHistory = [
  { id: "1", user: "Alice Brown", date: "2024-02-15", status: "Completed" },
  { id: "2", user: "Mark Johnson", date: "2024-02-10", status: "Pending" },
  { id: "3", user: "Emily White", date: "2024-01-28", status: "Cancelled" },
  { id: "4", user: "Alice Brown", date: "2024-02-15", status: "Pending" },
  { id: "5", user: "Alice Brown", date: "2024-02-15", status: "Completed" },
];

const totalBookings = bookingHistory.length;
const pendingBookings = bookingHistory.filter(
  (b) => b.status === "Pending"
).length;
const completedBookings = bookingHistory.filter(
  (b) => b.status === "Completed"
).length;

const GuideHome = () => {
  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row items-center bg-[#3B82F6] gap-3">
        <Image
          source={require("../assets/images/Logo.png")}
          style={{ width: 40, height: 40 }}
          className="m-4"
        />
        <Text className="text-xl font-bold text-white">GuideNepal</Text>
      </View>

      <View className="mt-3 p-6">
        <Text className="font-bold text-lg">Good Morning, Guide</Text>
        <Text>Manage your bookings here.</Text>
      </View>

      {/* Cards Section */}
      <View className="flex-row justify-around mt-3">
        <View className="bg-blue-100 p-4 rounded-lg items-center w-30">
          <Text className="text-lg font-bold text-blue-700">
            {totalBookings}
          </Text>
          <Text className="text-gray-600 text-sm">Total Hirings</Text>
        </View>
        <View className="bg-orange-100 p-4 rounded-lg items-center w-30">
          <Text className="text-lg font-bold text-orange-700">
            {pendingBookings}
          </Text>
          <Text className="text-gray-600 text-sm">Pending</Text>
        </View>
        <View className="bg-green-100 p-4 rounded-lg items-center w-30">
          <Text className="text-lg font-bold text-green-700">
            {completedBookings}
          </Text>
          <Text className="text-gray-600 text-sm">Completed</Text>
        </View>
      </View>

      <View className="p-4 mt-2">
        {/* Booking History Title */}
        <Text className="text-lg font-semibold mb-2">Booking History</Text>
      </View>

      {/* Booking List - Special Styling */}
      <FlatList
        data={bookingHistory}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View className="flex-row justify-between items-center py-2 px-4 border-b border-gray-200">
            <View>
              <Text className="text-base font-semibold">{item.user}</Text>
              <Text className="text-gray-500 text-sm">{item.date}</Text>
            </View>
            {/* Icons for Status */}
            {item.status === "Completed" ? (
              <Ionicons name="checkmark-circle" size={24} color="green" />
            ) : item.status === "Pending" ? (
              <Ionicons name="time-outline" size={24} color="orange" />
            ) : (
              <Ionicons name="close-circle" size={24} color="red" />
            )}
          </View>
        )}
      />
      {/* Bottom Navigation */}
      <View className=" bg-white flex-row justify-around border-t p-4 border-gray-200">
        <View className="items-center">
          <TouchableOpacity onPress={() => router.replace("/GuideHome")}>
            <Ionicons name="home" size={20} color="purple" />
          </TouchableOpacity>
          <Text className="text-purple-700">Dashboard</Text>
        </View>

        <View className="items-center">
          <TouchableOpacity onPress={() => router.replace("/GuideChat")}>
            <Ionicons
              name="chatbubble-ellipses-outline"
              size={20}
              color="gray"
            />
          </TouchableOpacity>
          <Text className="text-gray-500">Chat</Text>
        </View>

        <View className="items-center">
          <TouchableOpacity onPress={() => router.replace("/GuideProfile")}>
            <Ionicons name="person-outline" size={20} color="gray" />
          </TouchableOpacity>
          <Text className="text-gray-500">Profile</Text>
        </View>
      </View>
    </View>
  );
};

export default GuideHome;
