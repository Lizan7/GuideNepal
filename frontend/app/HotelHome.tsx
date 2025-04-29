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
  Alert,
  Modal,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import API_BASE_URL from "@/config";

// Define types for our data
interface Booking {
  id: string;
  userId: string;
  hotelId: string;
  startDate: string;
  endDate: string;
  rooms: number;
  paymentStatus: boolean;
  status: string;
  user: {
    id: string;
    email: string;
    name: string;
  };
}

const HotelHome = () => {
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [hotelName, setHotelName] = useState("Hotel");
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);

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

      const response = await axios.get(`${API_BASE_URL}/hotels/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data && response.data.hotel && response.data.hotel.name) {
        setHotelName(response.data.hotel.name);
      }
    } catch (error) {
      console.error("Error fetching hotel details:", error);
    }
  };

  const determineBookingStatus = (booking: Booking) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const startDate = new Date(booking.startDate);
    startDate.setHours(0, 0, 0, 0);
    
    const endDate = new Date(booking.endDate);
    endDate.setHours(0, 0, 0, 0);
    
    if (endDate < today) {
      return "Completed";
    } else if (startDate <= today && today <= endDate) {
      return "Ongoing";
    } else {
      return "Pending";
    }
  };

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        Alert.alert("Error", "User authentication failed. Please log in.");
        setLoading(false);
        return;
      }

      console.log("Fetching hotel bookings...");
      const response = await axios.get(`${API_BASE_URL}/booking/hotel`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      console.log("Bookings API response:", JSON.stringify(response.data, null, 2));
      
      if (response.data && response.data.success) {
        // Check if bookings is an array or if it's nested in the response
        const bookingsData = Array.isArray(response.data.bookings) 
          ? response.data.bookings 
          : response.data.bookings?.bookings || [];
        
        // Update status based on dates
        const updatedBookings = bookingsData.map((booking: Booking) => {
          const status = determineBookingStatus(booking);
          return { ...booking, status };
        });
        
        console.log("Processed bookings data:", JSON.stringify(updatedBookings, null, 2));
        setBookings(updatedBookings);
        setFilteredBookings(updatedBookings);
      } else {
        console.log("No bookings data found in response or response format is unexpected");
        setBookings([]);
        setFilteredBookings([]);
      }
    } catch (error: any) {
      // Handle 404 error gracefully (no bookings found)
      if (axios.isAxiosError(error) && error.response && error.response.status === 404) {
        console.log("No bookings found for this hotel");
        setBookings([]);
        setFilteredBookings([]);
      } else {
        console.error("Error fetching bookings:", error.response?.data || error.message);
        Alert.alert("Error", "Failed to fetch booking details. Please try again later.");
        setBookings([]);
        setFilteredBookings([]);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchBookings();
  };

  const handleViewBooking = (booking: Booking) => {
    setSelectedBooking(booking);
    setModalVisible(true);
  };

  const filterBookings = (status: string) => {
    setActiveFilter(status);
    setShowFilterDropdown(false);
    if (status === "all") {
      setFilteredBookings(bookings);
    } else {
      setFilteredBookings(bookings.filter(booking => booking.status === status));
    }
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case "Pending":
        return "#F59E0B"; // Amber
      case "Ongoing":
        return "#3B82F6"; // Blue
      case "Completed":
        return "#10B981"; // Green
      case "Cancelled":
        return "#EF4444"; // Red
      default:
        return "#6B7280"; // Gray
    }
  };

  const getStatusIcon = (status: string): "time-outline" | "checkmark-circle-outline" | "close-circle-outline" | "help-circle-outline" | "calendar-outline" => {
    switch (status) {
      case "Pending":
        return "time-outline";
      case "Ongoing":
        return "calendar-outline";
      case "Completed":
        return "checkmark-circle-outline";
      case "Cancelled":
        return "close-circle-outline";
      default:
        return "help-circle-outline";
    }
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const totalBookings = bookings.length;
  const pendingBookings = bookings.filter((b) => b.status === "Pending").length;
  const ongoingBookings = bookings.filter((b) => b.status === "Ongoing").length;
  const completedBookings = bookings.filter((b) => b.status === "Completed").length;

  const renderBookingItem = ({ item }: { item: Booking }) => (
    <TouchableOpacity 
      className="bg-white p-4 rounded-xl mb-3 shadow-sm"
      onPress={() => handleViewBooking(item)}
    >
      <View className="flex-row justify-between items-center">
        <View>
          <Text className="text-lg font-semibold text-gray-800">{item.user.name}</Text>
          <Text className="text-sm text-gray-500 mt-1">{item.rooms} Room{item.rooms > 1 ? 's' : ''}</Text>
          <Text className="text-xs text-gray-400 mt-1">
            {formatDate(item.startDate)} - {formatDate(item.endDate)}
          </Text>
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

  const renderBookingDetails = () => {
    if (!selectedBooking) return null;

    return (
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View className="flex-1 bg-black/50">
          <View className="flex-1 mt-20 bg-white rounded-t-3xl">
            <View className="p-4 border-b border-gray-200">
              <View className="flex-row justify-between items-center">
                <Text className="text-2xl font-bold text-gray-800">Booking Details</Text>
                <TouchableOpacity onPress={() => setModalVisible(false)}>
                  <Ionicons name="close" size={24} color="gray" />
                </TouchableOpacity>
              </View>
            </View>

            <ScrollView className="flex-1 p-4">
              <View className="bg-blue-50 rounded-lg p-4 mb-4">
                <Text className="text-lg font-semibold text-blue-800 mb-2">
                  Customer Information
                </Text>
                <Text className="text-gray-700">Name: {selectedBooking.user.name}</Text>
                <Text className="text-gray-700">Email: {selectedBooking.user.email}</Text>
              </View>

              <View className="bg-purple-50 rounded-lg p-4 mb-4">
                <Text className="text-lg font-semibold text-purple-800 mb-2">
                  Booking Period
                </Text>
                <Text className="text-gray-700">
                  Start Date: {formatDate(selectedBooking.startDate)}
                </Text>
                <Text className="text-gray-700">
                  End Date: {formatDate(selectedBooking.endDate)}
                </Text>
                <Text className="text-gray-700 mt-2">
                  Rooms: {selectedBooking.rooms} Room{selectedBooking.rooms > 1 ? 's' : ''}
                </Text>
              </View>

              <View className="bg-gray-50 rounded-lg p-4">
                <Text className="text-lg font-semibold text-gray-800 mb-2">Status</Text>
                <View className={`px-4 py-2 rounded-full self-start ${
                  selectedBooking.status === "Completed" 
                    ? "bg-green-100" 
                    : selectedBooking.status === "Ongoing"
                    ? "bg-blue-100"
                    : "bg-yellow-100"
                }`}>
                  <Text
                    className={`text-base font-medium ${
                      selectedBooking.status === "Completed"
                        ? "text-green-600"
                        : selectedBooking.status === "Ongoing"
                        ? "text-blue-600"
                        : "text-yellow-600"
                    }`}
                  >
                    {selectedBooking.status}
                  </Text>
                </View>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    );
  };

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
          <View className="relative">
            <TouchableOpacity 
              onPress={() => setShowFilterDropdown(!showFilterDropdown)}
              className="bg-blue-100 px-4 py-2 rounded-full flex-row items-center"
            >
              <Text className="text-blue-600 text-sm font-medium mr-1">
                {activeFilter === "all" ? "All Bookings" : activeFilter}
              </Text>
              <Ionicons 
                name={showFilterDropdown ? "chevron-up" : "chevron-down"} 
                size={16} 
                color="#3B82F6" 
              />
            </TouchableOpacity>
            
            {showFilterDropdown && (
              <View className="absolute top-12 right-0 bg-white rounded-lg shadow-lg z-10 w-40">
                <TouchableOpacity 
                  onPress={() => filterBookings("all")}
                  className="px-4 py-3 border-b border-gray-100"
                >
                  <Text className="text-gray-700">All Bookings</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  onPress={() => filterBookings("Pending")}
                  className="px-4 py-3 border-b border-gray-100"
                >
                  <Text className="text-yellow-600">Pending</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  onPress={() => filterBookings("Ongoing")}
                  className="px-4 py-3 border-b border-gray-100"
                >
                  <Text className="text-blue-600">Ongoing</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  onPress={() => filterBookings("Completed")}
                  className="px-4 py-3"
                >
                  <Text className="text-green-600">Completed</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>

        <FlatList
          data={filteredBookings}
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

      {renderBookingDetails()}

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