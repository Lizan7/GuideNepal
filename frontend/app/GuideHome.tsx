import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import API_BASE_URL from "@/config";
import BottomNavigation from "@/components/BottomNavigation";

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
  package?: {
    title: string;
    price: number;
  };
}

const { width } = Dimensions.get("window");

const GuideHome = () => {
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);

  const handleViewBooking = (booking: Booking) => {
    setSelectedBooking(booking);
    setModalVisible(true);
  };

  const updateBookingStatus = (bookingId: string, newStatus: string) => {
    try {
      // Update the local state only
      setBookings((prevBookings) =>
        prevBookings.map((booking) =>
          booking.id === bookingId
            ? { ...booking, status: newStatus }
            : booking
        )
      );
      
      // Also update filtered bookings if needed
      setFilteredBookings((prevFiltered) =>
        prevFiltered.map((booking) =>
          booking.id === bookingId
            ? { ...booking, status: newStatus }
            : booking
        )
      );
      
      console.log(`Updated booking ${bookingId} status to ${newStatus} in frontend`);
    } catch (error) {
      console.error("Error updating booking status in frontend:", error);
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

        console.log("Fetching guide bookings...");
        const response = await axios.get(`${API_BASE_URL}/booking/guide`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        console.log("Bookings response:", response.data);

        if (response.data && response.data.success) {
          const updatedBookings = response.data.bookings.map((booking: Booking) => {
            const status = determineBookingStatus(booking);
            // Always update the status based on dates, regardless of what's in the backend
            return { ...booking, status };
          });
          setBookings(updatedBookings);
          setFilteredBookings(updatedBookings);
        } else {
          console.log("No bookings found or invalid response format");
          setBookings([]);
          setFilteredBookings([]);
        }
      } catch (error: any) {
        console.error("Error fetching guide bookings:", error.response?.data || error.message);
        Alert.alert("Error", "Failed to fetch booking details. Please try again later.");
        setBookings([]);
        setFilteredBookings([]);
      } finally {
        setLoading(false);
      }
    };

    fetchGuideBookings();
  }, []);

  const filterBookings = (status: string) => {
    setActiveFilter(status);
    setShowFilterDropdown(false);
    if (status === "all") {
      setFilteredBookings(bookings);
    } else {
      setFilteredBookings(bookings.filter(booking => booking.status === status));
    }
  };

  const totalBookings = bookings.length;
  const pendingBookings = bookings.filter((b) => b.status === "Pending").length;
  const ongoingBookings = bookings.filter((b) => b.status === "Ongoing").length;
  const completedBookings = bookings.filter((b) => b.status === "Completed").length;

  const renderBookingItem = ({ item }: { item: Booking }) => (
    <TouchableOpacity
      onPress={() => handleViewBooking(item)}
      className="bg-white rounded-lg shadow-sm mb-3 mx-4 p-4"
    >
      <View className="flex-row justify-between items-center">
        <View className="flex-1">
          <Text className="text-lg font-semibold text-gray-800">
            {item.user.name}
          </Text>
          <Text className="text-gray-500 text-sm mt-1">
            {new Date(item.startDate).toLocaleDateString()} -{" "}
            {new Date(item.endDate).toLocaleDateString()}
          </Text>
          <Text
            className={`text-sm font-medium mt-1 text-gray-500 ${
              item.status === "Completed",
              item.status === "Ongoing"
            }`}
          >
            Status: {item.status}
          </Text>
        </View>
        <View className="items-end">
          <TouchableOpacity
            onPress={() => handleViewBooking(item)}
            className="mt-2 bg-blue-500 px-4 py-2 rounded-lg"
          >
            <Text className="text-white text-sm font-medium">View</Text>
          </TouchableOpacity>
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
                  Start Date: {new Date(selectedBooking.startDate).toLocaleDateString()}
                </Text>
                <Text className="text-gray-700">
                  End Date: {new Date(selectedBooking.endDate).toLocaleDateString()}
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

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-blue-600 px-4 pt-6 pb-6 rounded-b-3xl shadow-md">
        <View className="flex-row items-center justify-between mb-2">
          <View className="flex-row items-center">
            <Image
              source={require("../assets/images/Logo.png")}
              style={{ width: 40, height: 40 }}
            />
            <Text className="text-2xl font-bold text-white ml-2">GuideNepal</Text>
          </View>
          <TouchableOpacity
            onPress={() => router.push("/GuideProfile")}
            className="bg-white/20 p-2 rounded-full"
          >
            <Ionicons name="person-outline" size={24} color="white" />
          </TouchableOpacity>
        </View>
        <Text className="text-white text-xl font-bold pl-2">
          Welcome back, Guide!
        </Text>
        <Text className="text-white/80 text-lg pl-2">
          Manage your bookings and packages
        </Text>
      </View>

      {/* Stats Cards */}
      <View className="flex-row justify-between px-4 mt-2">
        <View className="bg-white p-4 rounded-xl shadow-sm flex-1 mr-2">
          <View className="flex-row items-center justify-between">
            <Text className="text-2xl font-bold text-blue-600">
              {totalBookings}
            </Text>
            <View className="bg-blue-100 p-2 rounded-full">
              <Ionicons name="calendar" size={20} color="#3B82F6" />
            </View>
          </View>
          <Text className="text-gray-600 mt-2">Total Bookings</Text>
        </View>
        <View className="bg-white p-4 rounded-xl shadow-sm flex-1 mx-2">
          <View className="flex-row items-center justify-between">
            <Text className="text-2xl font-bold text-yellow-600">
              {pendingBookings}
            </Text>
            <View className="bg-yellow-100 p-2 rounded-full">
              <Ionicons name="time" size={20} color="#EAB308" />
            </View>
          </View>
          <Text className="text-gray-600 mt-2">Pending</Text>
        </View>
        <View className="bg-white p-4 rounded-xl shadow-sm flex-1 ml-2">
          <View className="flex-row items-center justify-between">
            <Text className="text-2xl font-bold text-green-600">
              {completedBookings}
            </Text>
            <View className="bg-green-100 p-2 rounded-full">
              <Ionicons name="checkmark-circle" size={20} color="#22C55E" />
            </View>
          </View>
          <Text className="text-gray-600 mt-2">Completed</Text>
        </View>
      </View>

      {/* Bookings List */}
      <View className="flex-1 mt-4">
        <View className="flex-row justify-between items-center px-4 mb-2">
          <Text className="text-xl font-bold text-gray-800">
            Recent Bookings
          </Text>
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

        {loading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color="#3B82F6" />
          </View>
        ) : filteredBookings.length === 0 ? (
          <View className="flex-1 items-center justify-center">
            <Ionicons name="calendar-outline" size={64} color="#CBD5E1" />
            <Text className="text-xl font-bold text-gray-400 mt-4">
              No bookings found
            </Text>
            <Text className="text-gray-500 text-center px-8 mt-2">
              {activeFilter === "all" 
                ? "When you receive bookings, they will appear here" 
                : `No ${activeFilter.toLowerCase()} bookings found`}
            </Text>
          </View>
        ) : (
          <FlatList
            data={filteredBookings}
            renderItem={renderBookingItem}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={{ paddingVertical: 8 }}
          />
        )}
      </View>

      {renderBookingDetails()}
      
      {/* Bottom Navigation */}
      <BottomNavigation />
    </View>
  );
};

export default GuideHome;
