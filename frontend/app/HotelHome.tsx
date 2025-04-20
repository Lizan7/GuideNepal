import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  StatusBar,
  SafeAreaView,
  RefreshControl,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import API_BASE_URL from "@/config";

const HotelHome = () => {
  const router = useRouter();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [hotelName, setHotelName] = useState("Hotel");

  useEffect(() => {
    fetchHotelDetails();
    fetchBookings();
  }, []);

  const fetchHotelDetails = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        console.log("No token found");
        return;
      }

      const response = await axios.get(`${API_BASE_URL}/hotels/profile/details`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data && response.data.name) {
        setHotelName(response.data.name);
      }
    } catch (error) {
      console.error("Error fetching hotel details:", error);
    }
  };

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        console.log("No token found");
        return;
      }

      // This is a placeholder - replace with your actual API endpoint
      // const response = await axios.get(`${API_BASE_URL}/hotels/bookings`, {
      //   headers: { Authorization: `Bearer ${token}` },
      // });
      
      // For now, using mock data
      const mockBookings = [
        { id: "1", guestName: "John Doe", status: "Pending", date: "2023-06-15", roomType: "Deluxe" },
        { id: "2", guestName: "Alice Smith", status: "Completed", date: "2023-06-10", roomType: "Standard" },
        { id: "3", guestName: "Michael Brown", status: "Pending", date: "2023-06-20", roomType: "Suite" },
        { id: "4", guestName: "Emma Johnson", status: "Completed", date: "2023-06-05", roomType: "Deluxe" },
      ];
      
      // setBookings(response.data.bookings);
      setBookings(mockBookings);
    } catch (error) {
      console.error("Error fetching bookings:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchBookings();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Pending":
        return "#F59E0B"; // Amber
      case "Completed":
        return "#10B981"; // Green
      case "Cancelled":
        return "#EF4444"; // Red
      default:
        return "#6B7280"; // Gray
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "Pending":
        return "time-outline";
      case "Completed":
        return "checkmark-circle-outline";
      case "Cancelled":
        return "close-circle-outline";
      default:
        return "help-circle-outline";
    }
  };

  const totalBookings = bookings.length;
  const pendingBookings = bookings.filter((b) => b.status === "Pending").length;
  const completedBookings = bookings.filter((b) => b.status === "Completed").length;

  const renderBookingItem = ({ item }) => (
    <TouchableOpacity 
      className="bg-white p-4 rounded-xl mb-3 shadow-sm"
      onPress={() => router.push(`/BookingDetails?id=${item.id}`)}
    >
      <View className="flex-row justify-between items-center">
        <View>
          <Text className="text-lg font-semibold text-gray-800">{item.guestName}</Text>
          <Text className="text-sm text-gray-500 mt-1">{item.roomType} Room</Text>
          <Text className="text-xs text-gray-400 mt-1">{item.date}</Text>
        </View>
        <View className="flex-row items-center">
          <Ionicons 
            name={getStatusIcon(item.status)} 
            size={24} 
            color={getStatusColor(item.status)} 
          />
          <Text 
            className="ml-2 text-sm font-medium" 
            style={{ color: getStatusColor(item.status) }}
          >
            {item.status}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (loading && !refreshing) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <StatusBar barStyle="dark-content" backgroundColor="#F9FAFB" />
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text className="text-gray-600 mt-4">Loading bookings...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <StatusBar barStyle="dark-content" backgroundColor="#F9FAFB" />
      
      {/* Header */}
      <View className="bg-white px-4 py-4 border-b border-gray-100 flex-row items-center justify-between">
        <View className="flex-row items-center">
          <Image
            source={require("../assets/images/Logo.png")}
            style={{ width: 40, height: 40 }}
            className="mr-3"
          />
          <Text className="text-xl font-bold text-gray-800">GuideNepal</Text>
        </View>
        <TouchableOpacity 
          onPress={() => router.push("/HotelProfile")}
          className="p-2"
        >
          <Ionicons name="person-circle-outline" size={28} color="#3B82F6" />
        </TouchableOpacity>
      </View>

      <View className="px-4 py-4">
        <Text className="text-2xl font-bold text-gray-800">Welcome, {hotelName}</Text>
        <Text className="text-gray-500 mt-1">Manage your bookings and hotel details</Text>
      </View>

      {/* Stats Cards */}
      <View className="flex-row justify-between px-4 mb-4">
        <View className="bg-blue-50 p-4 rounded-xl w-[30%] items-center">
          <Text className="text-2xl font-bold text-blue-600">{totalBookings}</Text>
          <Text className="text-xs text-blue-500 mt-1">Total</Text>
        </View>
        <View className="bg-amber-50 p-4 rounded-xl w-[30%] items-center">
          <Text className="text-2xl font-bold text-amber-600">{pendingBookings}</Text>
          <Text className="text-xs text-amber-500 mt-1">Pending</Text>
        </View>
        <View className="bg-green-50 p-4 rounded-xl w-[30%] items-center">
          <Text className="text-2xl font-bold text-green-600">{completedBookings}</Text>
          <Text className="text-xs text-green-500 mt-1">Completed</Text>
        </View>
      </View>

      {/* Bookings Section */}
      <View className="flex-1 px-4">
        <View className="flex-row justify-between items-center mb-3">
          <Text className="text-lg font-semibold text-gray-800">Recent Bookings</Text>
          <TouchableOpacity onPress={() => router.push("/AllBookings")}>
            <Text className="text-blue-500 font-medium">View All</Text>
          </TouchableOpacity>
        </View>

        <FlatList
          data={bookings}
          keyExtractor={(item) => item.id}
          renderItem={renderBookingItem}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={["#3B82F6"]}
              tintColor="#3B82F6"
            />
          }
          ListEmptyComponent={
            <View className="py-8 items-center">
              <Ionicons name="calendar-outline" size={48} color="#9CA3AF" />
              <Text className="text-gray-500 mt-2 text-center">No bookings found</Text>
            </View>
          }
        />
      </View>

      {/* Bottom Navigation */}
      <View className="flex-row justify-around py-3 border-t border-gray-100">
        <TouchableOpacity
          onPress={() => router.replace("/HotelHome")}
          className="items-center"
        >
          <Ionicons name="home" size={24} color="#000000" />
          <Text className="text-xs text-black mt-1">Home</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => router.replace("/HotelProfile")}
          className="items-center"
        >
          <Ionicons name="person-outline" size={24} color="#6B7280" />
          <Text className="text-xs text-gray-500 mt-1">Profile</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default HotelHome;