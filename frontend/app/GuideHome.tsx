import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import API_BASE_URL from "@/config";

interface Booking {
  id: string;
  status: string;
  startDate: string;
  endDate: string;
  user: {
    id: string;
    email: string;
    name: string;
  };
}

const GuideHome = () => {
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGuideBookings = async () => {
      try {
        setLoading(true);
        const token = await AsyncStorage.getItem("token");
        if (!token) {
          Alert.alert("Error", "User authentication failed. Please log in.");
          setLoading(false);
          return;
        }

        const response = await axios.get(`${API_BASE_URL}/booking/guide`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.data && response.data.success) {
          setBookings(response.data.bookings);
        } else {
          setBookings([]);
        }
      } catch (error: any) {
        console.error("Error fetching guide bookings:", error.response?.data || error.message);
        Alert.alert("Error", "Failed to fetch booking details.");
        setBookings([]);
      } finally {
        setLoading(false);
      }
    };

    fetchGuideBookings();
  }, []);

  // Compute booking counts based on the fetched data
  const totalBookings = bookings.length;
  const pendingBookings = bookings.filter((b) => b.status === "Pending").length;
  const completedBookings = bookings.filter(
    (b) => b.status === "Completed"
  ).length;

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
        <Text className="text-lg font-semibold mb-2">Booking History</Text>
      </View>

      {/* Booking List */}
      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#3B82F6" />
        </View>
      ) : bookings.length === 0 ? (
        <View className="flex-1 items-center mt-10">
          <Text className="text-2xl font-bold text-gray-700 mt-2">
            No bookings found.
          </Text>
        </View>
      ) : (
        <FlatList
          data={bookings}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View className="flex-row justify-between items-center py-2 px-4 border-b border-gray-200">
              <View>
                <Text className="text-base font-semibold">
                  {item.user.name}
                </Text>
                <Text className="text-gray-500 text-sm">
                  {new Date(item.startDate).toDateString()} - {new Date(item.endDate).toDateString()}
                </Text>
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
      )}

      {/* Bottom Navigation */}
      <View className="bg-white flex-row justify-around border-t p-4 border-gray-200">
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
