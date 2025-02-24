import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

const UserBooking = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [bookings, setBookings] = useState([
    {
      id: "1",
      title: "Hotel Everest Stay",
      date: "March 5, 2025",
      location: "Kathmandu, Nepal",
      image: require("../assets/images/hotel1.jpg"),
    },
    {
      id: "2",
      title: "Pokhara Adventure Tour",
      date: "April 10, 2025",
      location: "Pokhara, Nepal",
      image: require("../assets/images/hotel2.jpg"),
    },
  ]);

  // Simulate a 2-second loading time
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 400);
    return () => clearTimeout(timer);
  }, []);

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <View className="px-6 py-6 bg-gray-200 flex-row items-center gap-4">
        <TouchableOpacity onPress={() => router.replace("/UserHome")}>
          <Ionicons name="chevron-back-outline" size={24} color="black" />
        </TouchableOpacity>
        <Text className="text-lg font-bold text-gray-800">
          Upcoming Bookings
        </Text>
      </View>

      {/* Loader */}
      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#d63384" />
          <Text className="text-lg text-gray-600 mt-3">
            Loading bookings...
          </Text>
        </View>
      ) : bookings.length === 0 ? (
        <View className="flex-1 items-center mt-10">
          <Image
            source={require("../assets/images/no-booking.png")}
            className="w-64 h-60"
          />
          <Text className="text-2xl font-bold text-gray-700 mt-2">
            No upcoming bookings
          </Text>
          <Text className="text-pink-600 mt-1 text-xl">
            Explore things to do.
          </Text>
        </View>
      ) : (
        <FlatList
          data={bookings}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View className="bg-gray-100 p-4 m-2 rounded-lg flex-row items-center">
              <Image source={item.image} className="w-20 h-20 rounded-lg" />
              <View className="flex-1 ml-4">
                <Text className="text-base font-bold">{item.title}</Text>
                <Text className="text-sm text-gray-600">{item.date}</Text>
                <Text className="text-sm text-gray-500">{item.location}</Text>
              </View>
              <TouchableOpacity className="bg-pink-600 px-4 py-1 rounded-md">
                <Text className="text-white font-medium">View</Text>
              </TouchableOpacity>
            </View>
          )}
        />
      )}

      {/* Bottom Navigation */}
      <View className="absolute bottom-0 left-0 right-0 bg-white flex-row justify-around p-4 border-t border-gray-200">
        <View className="items-center">
          <TouchableOpacity onPress={() => router.replace("/UserHome")}>
            <Ionicons name="home" size={20} color="gray" />
          </TouchableOpacity>
          <Text className="text-gray-500">Explore</Text>
        </View>
        <View className="items-center">
          <TouchableOpacity onPress={() => router.replace("/UserBooking")}>
            <Ionicons name="ticket-outline" size={20} color="purple" />
          </TouchableOpacity>
          <Text className="text-purple-700">Booking</Text>
        </View>
        <View className="items-center">
          <TouchableOpacity onPress={() => router.replace("/UserChat")}>
            <Ionicons
              name="chatbubble-ellipses-outline"
              size={20}
              color="gray"
            />
          </TouchableOpacity>
          <Text className="text-gray-500">Chat</Text>
        </View>
        <View className="items-center">
          <TouchableOpacity onPress={() => router.replace("/UserMenu")}>
            <Ionicons name="menu-outline" size={20} color="gray" />
          </TouchableOpacity>
          <Text className="text-gray-500">Menu</Text>
        </View>
      </View>
    </View>
  );
};

export default UserBooking;
