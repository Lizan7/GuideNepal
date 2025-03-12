import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import API_BASE_URL from "@/config";

const UserBooking = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [bookings, setBookings] = useState([]);

  // Function to fetch user bookings from the backend
  const fetchBookings = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem("token");
      const userId = await AsyncStorage.getItem("userId");

      if (!token || !userId) {
        Alert.alert(
          "Error",
          "User authentication failed. Please log in again."
        );
        setLoading(false);
        return;
      }

      // Fetch bookings from the backend
      const response = await axios.get(
        `${API_BASE_URL}/booking/user/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("Fetched Bookings:", response.data);

      if (response.data && response.data.bookings) {
        setBookings(response.data.bookings);
      } else {
        setBookings([]);
      }
    } catch (error) {
      console.error(
        "Fetch Booking Error:",
        error.response?.data || error.message
      );
      Alert.alert("Error", "Failed to fetch bookings.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
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
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View className="bg-gray-100 p-4 m-2 rounded-lg flex-row items-center">
              <Image
                source={{ uri: `${API_BASE_URL}${item.guide.profileImage}` }}
                className="w-20 h-20 rounded-lg"
              />
              <View className="flex-1 ml-4">
                <Text className="text-base font-bold">{item.guide.email}</Text>
                <Text className="text-sm text-gray-500">
                  {item.guide.specialization}
                </Text>
                <Text className="text-sm text-gray-600">
                  {new Date(item.startDate).toDateString()} -{" "}
                  {new Date(item.endDate).toDateString()}
                </Text>
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
