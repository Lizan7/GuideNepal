import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import API_BASE_URL from "@/config";

// Add types for the data
interface Guide {
  id: string;
  name: string;
  profileImage?: string; 
  specialization?: string;
  user?: {
    name: string;
    email?: string;
  };
}

interface Hotel {
  id: string;
  name: string;
  profileImage?: string;
  location?: string;
}

interface Booking {
  id: string;
  startDate: string;
  endDate: string;
  status: string;
  paymentStatus?: boolean;
  guide?: Guide;
  hotel?: Hotel;
  rooms?: number;
  price?: number;
}

const UserBooking = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [guideBookings, setGuideBookings] = useState<Booking[]>([]);
  const [hotelBookings, setHotelBookings] = useState<Booking[]>([]);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [bookingType, setBookingType] = useState<string | null>(null);
  const [filterType, setFilterType] = useState("all");
  const [showDropdown, setShowDropdown] = useState(false);
  const [showBookingDetails, setShowBookingDetails] = useState(false);

  // Move statusColors to component level
  const statusColors = {
    completed: "bg-green-100 text-green-800",
    ongoing: "bg-blue-100 text-blue-800",
    pending: "bg-yellow-100 text-yellow-800"
  };

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

      const response = await axios.get(
        `${API_BASE_URL}/booking/user/${userId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      console.log("API Response:", response.data);

      if (response.data && response.data.bookings) {
        console.log("Guide Bookings:", response.data.bookings.guideBookings);
        console.log("Hotel Bookings:", response.data.bookings.hotelBookings);
        setGuideBookings(response.data.bookings.guideBookings || []);
        setHotelBookings(response.data.bookings.hotelBookings || []);
      } else {
        console.log("No bookings data in response");
        setGuideBookings([]);
        setHotelBookings([]);
      }
    } catch (error) {
      console.error("Fetch Booking Error:", error);
      Alert.alert("Error", "Failed to fetch bookings.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleViewBooking = (booking: Booking, type: string) => {
    setSelectedBooking(booking);
    setBookingType(type);
    setShowBookingDetails(true);
  };

  const getImagePath = (path: string | undefined, type: string) => {
    if (!path) return "https://via.placeholder.com/150";
    
    // Remove any leading slashes and clean the path
    const cleanPath = path.replace(/^\/+/, '').replace(/^uploads\//, '');
    
    if (type === "guide") {
      return `${API_BASE_URL}/guideVerification/${cleanPath}`;
    } else {
      // For hotel images, use hotelUploads directory
      return `${API_BASE_URL}/hotelUploads/${cleanPath}`;
    }
  };

  const renderBookingItem = ({ item }: { item: Booking & { type: string } }, type: string) => {
    const status = getBookingStatus(item.startDate, item.endDate);
    
    return (
      <View className="bg-white m-3 rounded-xl shadow-md overflow-hidden border border-gray-100">
        <View className="flex-row p-4">
          <Image
            source={{
              uri: type === "guide" 
                ? getImagePath(item.guide?.profileImage, "guide")
                : getImagePath(item.hotel?.profileImage, "hotel")
            }}
            className="w-24 h-24 rounded-xl"
            onError={(e) => {
              console.log("Image Load Error:", e.nativeEvent.error);
              console.log("Image path:", type === "guide" 
                ? getImagePath(item.guide?.profileImage, "guide")
                : getImagePath(item.hotel?.profileImage, "hotel"));
            }}
          />
          <View className="flex-1 ml-4 justify-between">
            <View>
              <Text className="text-lg font-bold text-gray-800">
                {type === "guide" 
                  ? (item.guide?.user?.name || "Unknown Guide")
                  : (item.hotel?.name || "Unknown Hotel")}
              </Text>
              <Text className="text-sm text-gray-500 mt-1">
                {type === "guide" 
                  ? (item.guide?.specialization || "No specialization listed")
                  : (item.hotel?.location || "No location listed")}
              </Text>
            </View>
            <View className="flex-row items-center justify-between mt-2">
              <View className={`px-3 py-1 rounded-full ${statusColors[status as keyof typeof statusColors]}`}>
                <Text className="text-xs font-medium capitalize">{status}</Text>
              </View>
              <TouchableOpacity
                onPress={() => handleViewBooking(item, type)}
                className="bg-purple-600 px-4 py-2 rounded-lg flex-row items-center"
              >
                <Text className="text-white font-medium mr-1">Details</Text>
                <Ionicons name="chevron-forward" size={16} color="white" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
        <View className="px-4 pb-4 border-t border-gray-100 mt-2 pt-2">
          <View className="flex-row justify-between items-center">
            <View className="flex-row items-center">
              <Ionicons name="calendar-outline" size={16} color="#6B7280" />
              <Text className="text-sm text-gray-600 ml-1">
                {new Date(item.startDate).toLocaleDateString()} - {new Date(item.endDate).toLocaleDateString()}
              </Text>
            </View>
            {item.price && (
              <Text className="text-purple-600 font-semibold">
                Rs. {item.price.toLocaleString()}
              </Text>
            )}
          </View>
        </View>
      </View>
    );
  };

  const filteredBookings = () => {
    switch (filterType) {
      case "guide":
        return guideBookings.map((b) => ({ ...b, type: "guide" }));
      case "hotel":
        return hotelBookings.map((b) => ({ ...b, type: "hotel" }));
      default:
        return [
          ...guideBookings.map((b) => ({ ...b, type: "guide" })),
          ...hotelBookings.map((b) => ({ ...b, type: "hotel" })),
        ];
    }
  };

  // Add a safe string manipulation function
  const capitalizeFirstLetter = (str: string | undefined) => {
    if (!str) return "All";
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  // Add a function to determine booking status based on dates
  const getBookingStatus = (startDate: string, endDate: string) => {
    const now = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (now > end) {
      return "completed";
    } else if (now >= start && now <= end) {
      return "ongoing";
    } else {
      return "pending";
    }
  };

  // Add a function to format currency
  const formatCurrency = (amount: number | undefined) => {
    if (amount === undefined) return "N/A";
    return `Rs. ${amount.toLocaleString()}`;
  };

  // Add a function to calculate number of nights
  const calculateNights = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <View className="flex-1 bg-gray-50">
      {/* Enhanced Header */}
      <View className="bg-white shadow-sm">
        <View className="px-4 py-4 flex-row justify-between items-center">
          <TouchableOpacity 
            onPress={() => router.replace("/UserHome")}
            className="p-2 -ml-2"
          >
            <Ionicons name="chevron-back-outline" size={24} color="#374151" />
          </TouchableOpacity>
          <Text className="text-xl font-bold text-gray-800">My Bookings</Text>
          <TouchableOpacity 
            onPress={() => setShowDropdown(!showDropdown)}
            className="flex-row items-center bg-gray-100 px-3 py-1.5 rounded-full"
          >
            <Text className="text-gray-700 mr-1 font-medium">
              {capitalizeFirstLetter(filterType)}
            </Text>
            <Ionicons 
              name={showDropdown ? "chevron-up" : "chevron-down"} 
              size={16} 
              color="#374151" 
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Filter Dropdown Modal */}
      <Modal
        visible={showDropdown}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowDropdown(false)}
      >
        <TouchableOpacity 
          style={{ flex: 1 }} 
          activeOpacity={1} 
          onPress={() => setShowDropdown(false)}
          className="bg-black/20"
        >
          <View className="absolute right-4 top-20 bg-white rounded-xl shadow-xl w-36 overflow-hidden">
            {["all", "guide", "hotel"].map((type) => (
              <TouchableOpacity 
                key={type}
                className={`p-3 flex-row items-center justify-between ${
                  filterType === type ? "bg-purple-50" : ""
                }`}
                onPress={() => {
                  setFilterType(type);
                  setShowDropdown(false);
                }}
              >
                <Text className={`${
                  filterType === type ? "text-purple-600 font-medium" : "text-gray-700"
                }`}>
                  {capitalizeFirstLetter(type)}
                </Text>
                {filterType === type && (
                  <Ionicons name="checkmark" size={18} color="#7C3AED" />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#7C3AED" />
          <Text className="text-base text-gray-600 mt-4">
            Loading your bookings...
          </Text>
        </View>
      ) : filteredBookings().length === 0 ? (
        <View className="flex-1 items-center justify-center px-4">
          <Image
            source={require("../assets/images/no-booking.png")}
            className="w-64 h-60 mb-6"
          />
          <Text className="text-2xl font-bold text-gray-800 text-center">
            No Bookings Found
          </Text>
          <Text className="text-base text-gray-600 mt-2 text-center">
            Start exploring amazing destinations and book your next adventure!
          </Text>
          <TouchableOpacity
            onPress={() => router.replace("/UserHome")}
            className="mt-6 bg-purple-600 px-6 py-3 rounded-full flex-row items-center"
          >
            <Ionicons name="search" size={20} color="white" className="mr-2" />
            <Text className="text-white font-medium">Explore Now</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={filteredBookings()}
          keyExtractor={(item) => `${item.type}-${item.id}`}
          renderItem={(item) => renderBookingItem(item, item.item.type)}
          contentContainerClassName="pb-6"
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Booking Details Modal - Enhanced */}
      <Modal
        visible={showBookingDetails}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowBookingDetails(false)}
      >
        <View className="flex-1 bg-black/50">
          <View className="flex-1 justify-end">
            <View className="bg-white rounded-t-3xl">
              <View className="items-center pt-4 pb-2 border-b border-gray-100">
                <View className="w-12 h-1 bg-gray-300 rounded-full mb-4" />
                <Text className="text-xl font-bold text-gray-800">Booking Details</Text>
              </View>

              {selectedBooking && bookingType ? (
                <ScrollView className="p-4" showsVerticalScrollIndicator={false}>
                  <View className="flex-row items-center mb-6">
                    <Image
                      source={{
                        uri: bookingType === "guide"
                          ? getImagePath(selectedBooking.guide?.profileImage, "guide")
                          : getImagePath(selectedBooking.hotel?.profileImage, "hotel")
                      }}
                      className="w-24 h-24 rounded-xl"
                      onError={(e) => {
                        console.log("Modal Image Load Error:", e.nativeEvent.error);
                        console.log("Modal Image path:", bookingType === "guide"
                          ? getImagePath(selectedBooking.guide?.profileImage, "guide")
                          : getImagePath(selectedBooking.hotel?.profileImage, "hotel"));
                      }}
                    />
                    <View className="ml-4 flex-1">
                      <Text className="text-xl font-bold text-gray-800">
                        {bookingType === "guide"
                          ? (selectedBooking.guide?.user?.name || "Unknown Guide")
                          : (selectedBooking.hotel?.name || "Unknown Hotel")}
                      </Text>
                      <Text className="text-base text-gray-600 mt-1">
                        {bookingType === "guide"
                          ? (selectedBooking.guide?.specialization || "No specialization listed")
                          : (selectedBooking.hotel?.location || "No location listed")}
                      </Text>
                    </View>
                  </View>

                  <View className="bg-purple-50 p-4 rounded-xl mb-4">
                    <View className="flex-row items-center justify-between mb-3">
                      <Text className="text-gray-600">Booking Status</Text>
                      <View className={`px-3 py-1 rounded-full ${
                        statusColors[getBookingStatus(selectedBooking.startDate, selectedBooking.endDate) as keyof typeof statusColors]
                      }`}>
                        <Text className="font-medium capitalize">
                          {getBookingStatus(selectedBooking.startDate, selectedBooking.endDate)}
                        </Text>
                      </View>
                    </View>
                    <View className="flex-row items-center justify-between">
                      <Text className="text-gray-600">Payment Status</Text>
                      <View className={`px-3 py-1 rounded-full ${
                        selectedBooking.paymentStatus ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                      }`}>
                        <Text className="font-medium">
                          {selectedBooking.paymentStatus ? "Paid" : "Unpaid"}
                        </Text>
                      </View>
                    </View>
                  </View>

                  <View className="bg-gray-50 p-4 rounded-xl">
                    <Text className="font-semibold text-gray-800 mb-3">Booking Information</Text>
                    <View className="space-y-3">
                      <View className="flex-row justify-between">
                        <Text className="text-gray-600">Check-in</Text>
                        <Text className="text-gray-800">
                          {new Date(selectedBooking.startDate).toLocaleDateString()}
                        </Text>
                      </View>
                      <View className="flex-row justify-between">
                        <Text className="text-gray-600">Check-out</Text>
                        <Text className="text-gray-800">
                          {new Date(selectedBooking.endDate).toLocaleDateString()}
                        </Text>
                      </View>
                      <View className="flex-row justify-between">
                        <Text className="text-gray-600">Duration</Text>
                        <Text className="text-gray-800">
                          {calculateNights(selectedBooking.startDate, selectedBooking.endDate)} nights
                        </Text>
                      </View>
                      {bookingType === "hotel" && selectedBooking.rooms && (
                        <View className="flex-row justify-between">
                          <Text className="text-gray-600">Rooms</Text>
                          <Text className="text-gray-800">{selectedBooking.rooms}</Text>
                        </View>
                      )}
                      {selectedBooking.price && (
                        <View className="flex-row justify-between">
                          <Text className="text-gray-600">Total Amount</Text>
                          <Text className="text-purple-600 font-semibold">
                            Rs. {selectedBooking.price.toLocaleString()}
                          </Text>
                        </View>
                      )}
                    </View>
                  </View>

                  <TouchableOpacity
                    onPress={() => setShowBookingDetails(false)}
                    className="bg-gray-100 rounded-xl py-3 mt-6 mb-4"
                  >
                    <Text className="text-gray-700 font-medium text-center">Close</Text>
                  </TouchableOpacity>
                </ScrollView>
              ) : (
                <View className="p-4">
                  <Text className="text-gray-600 text-center">No booking details available</Text>
                </View>
              )}
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default UserBooking;
