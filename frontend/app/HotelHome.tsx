import React, { useState, useEffect } from "react";
import { View, Text, FlatList, TouchableOpacity, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

const router = useRouter(); // Router for Navigation

const bookings = [
  { id: "1", guestName: "John Doe", status: "Pending" },
  { id: "2", guestName: "Alice Smith", status: "Completed" },
  { id: "3", guestName: "Michael Brown", status: "Pending" },
  { id: "4", guestName: "Emma Johnson", status: "Completed" },
];

const totalBookings = bookings.length;
const pendingBookings = bookings.filter((b) => b.status === "Pending").length;
const completedBookings = bookings.filter((b) => b.status === "Completed").length;

const HotelHome = () => {
  return (
    <View className="flex-1 bg-gray-100">
      {/* Header */}
      <View className="bg-green-500 px-4 shadow-sm flex-row items-center">
        <Image
          source={require("../assets/images/Logo.png")}
          style={{ width: 40, height: 40 }}
          className="m-4"
        />
        <Text className="text-xl font-bold text-white">GuideNepal</Text>
      </View>

      <View className="mt-4 p-4">
        <Text className="font-semibold text-lg">Good Morning, Sunrise</Text>
      </View>

      {/* Cards Section */}
      <View className="flex-row gap-5 justify-around mt-4 ml-4">
        <View className="bg-blue-100 p-4 rounded-lg items-center w-32">
          <Text className="text-lg font-bold text-blue-700">{totalBookings}</Text>
          <Text className="text-gray-600 text-sm">Total</Text>
        </View>
        <View className="bg-yellow-100 p-4 rounded-lg items-center w-32">
          <Text className="text-lg font-bold text-yellow-700">{pendingBookings}</Text>
          <Text className="text-gray-600 text-sm">Pending</Text>
        </View>
        <View className="bg-green-100 p-4 rounded-lg items-center w-32">
          <Text className="text-lg font-bold text-green-700">{completedBookings}</Text>
          <Text className="text-gray-600 text-sm">Completed</Text>
        </View>
      </View>

      {/* Booking History Title */}
      <Text className="text-lg font-semibold mt-4 mb-2 ml-4">Booking History</Text>

      {/* Booking List */}
      <FlatList
        data={bookings}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View className="flex-row justify-between items-center py-2 px-4 border-b border-gray-200">
            <View>
              <Text className="text-base font-semibold">{item.guestName}</Text>
            </View>
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
      <View className="bg-white flex-row justify-around p-4 border-t border-gray-200">
        <View className="items-center">
          <TouchableOpacity onPress={() => router.replace("/HotelHome")}> 
            <Ionicons name="home" size={20} color="purple" />
          </TouchableOpacity>
          <Text className="text-purple-700">Dashboard</Text>
        </View>

        <View className="items-center">
          <TouchableOpacity onPress={() => router.replace("/HotelBook")}> 
            <Ionicons name="ticket-outline" size={20} color="gray" />
          </TouchableOpacity>
          <Text className="text-gray-500">Book</Text>
        </View>
        

        <View className="items-center">
          <TouchableOpacity onPress={() => router.replace("/HotelProfile")}> 
            <Ionicons name="person-outline" size={20} color="gray" />
          </TouchableOpacity>
          <Text className="text-gray-500">Profile</Text>
        </View>
      </View>
    </View>
  );
};

export default HotelHome;