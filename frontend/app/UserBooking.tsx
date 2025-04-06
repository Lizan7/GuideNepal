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

  const renderBookingItem = ({ item }: { item: Booking & { type: string } }, type: string) => {
    console.log("Rendering booking item:", item);
    console.log("Booking type:", type);
    
    // Extract the filename from the path for both guide and hotel images
    const getImagePath = (path: string | undefined, type: string) => {
      if (!path) return "https://via.placeholder.com/150";
      
      // Remove any leading slashes and 'uploads/' prefix
      const cleanPath = path.replace(/^\/+/, '');
      
      if (type === "guide") {
        return `${API_BASE_URL}/guideVerification/${cleanPath.replace(/^uploads\//, '')}`;
      } else {
        // For hotel images, keep the hotelUploads prefix
        return `${API_BASE_URL}${cleanPath}`;
      }
    };
    
    return (
      <View className="bg-gray-100 p-4 m-2 rounded-lg flex-row items-center">
        <Image
          source={{
            uri: type === "guide" 
              ? getImagePath(item.guide?.profileImage, "guide")
              : getImagePath(item.hotel?.profileImage, "hotel")
          }}
          className="w-20 h-20 rounded-lg"
          onError={(e) => {
            console.log("Image Load Error:", e.nativeEvent.error);
            console.log("Failed to load image for:", type);
            console.log("Full item data:", JSON.stringify(item, null, 2));
            console.log("Guide data:", item.guide);
            console.log("Hotel data:", item.hotel);
          }}
        />
        <View className="flex-1 ml-4">
          <Text className="text-base font-bold">
            {type === "guide" 
              ? (item.guide?.user?.name || "Unknown Guide")
              : (item.hotel?.name || "Unknown Hotel")}
          </Text>
          <Text className="text-sm text-gray-500">
            {type === "guide" 
              ? (item.guide?.specialization || "No specialization listed")
              : (item.hotel?.location || "No location listed")}
          </Text>
          <Text className="text-sm text-gray-600">
            {new Date(item.startDate).toDateString()} -{" "}
            {new Date(item.endDate).toDateString()}
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => handleViewBooking(item, type)}
          className="bg-pink-600 px-4 py-1 rounded-md"
        >
          <Text className="text-white font-medium">View</Text>
        </TouchableOpacity>
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

  // Add a function to get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "text-green-600";
      case "ongoing":
        return "text-blue-600";
      case "pending":
        return "text-yellow-600";
      default:
        return "text-gray-600";
    }
  };

  return (
    <View className="flex-1 bg-white">
      <View className="px-6 py-6 bg-gray-200 flex-row justify-between">
        <TouchableOpacity onPress={() => router.replace("/UserHome")}>
          <Ionicons name="chevron-back-outline" size={24} color="black" />
        </TouchableOpacity>
        <Text className="text-lg font-bold text-gray-800">
          Upcoming Bookings
        </Text>
        <TouchableOpacity 
          onPress={() => setShowDropdown(!showDropdown)}
          className="flex-row items-center"
        >
          <Text className="text-gray-700 mr-2">
            {capitalizeFirstLetter(filterType)}
          </Text>
          <Ionicons 
            name={showDropdown ? "chevron-up" : "chevron-down"} 
            size={20} 
            color="black" 
          />
        </TouchableOpacity>
      </View>

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
        >
          <View className="absolute right-6 top-20 bg-white rounded-lg shadow-lg w-32">
            <TouchableOpacity 
              className="p-3 border-b border-gray-200"
              onPress={() => {
                setFilterType("all");
                setShowDropdown(false);
              }}
            >
              <Text className={`${filterType === "all" ? "text-pink-600" : "text-gray-700"}`}>
                All
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              className="p-3 border-b border-gray-200"
              onPress={() => {
                setFilterType("guide");
                setShowDropdown(false);
              }}
            >
              <Text className={`${filterType === "guide" ? "text-pink-600" : "text-gray-700"}`}>
                Guides
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              className="p-3"
              onPress={() => {
                setFilterType("hotel");
                setShowDropdown(false);
              }}
            >
              <Text className={`${filterType === "hotel" ? "text-pink-600" : "text-gray-700"}`}>
                Hotels
              </Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#d63384" />
          <Text className="text-lg text-gray-600 mt-3">
            Loading bookings...
          </Text>
        </View>
      ) : filteredBookings().length === 0 ? (
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
          data={filteredBookings()}
          keyExtractor={(item) => `${item.type}-${item.id}`}
          renderItem={(item) => renderBookingItem(item, item.item.type)}
        />
      )}

      {/* Booking Details Modal */}
      <Modal
        visible={showBookingDetails}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowBookingDetails(false)}
      >
        <TouchableOpacity 
          style={{ flex: 1 }} 
          activeOpacity={1} 
          onPress={() => setShowBookingDetails(false)}
        >
          <View className="flex-1 justify-end bg-black/50">
            <View className="bg-white rounded-t-3xl p-6">
              <View className="items-center mb-6">
                <View className="w-16 h-1 bg-gray-300 rounded-full mb-4" />
                <Text className="text-xl font-bold">Booking Details</Text>
              </View>

              {selectedBooking && bookingType ? (
                <View>
                  <View className="flex-row items-center mb-4">
                    <Image
                      source={{
                        uri: bookingType === "guide"
                          ? (selectedBooking.guide?.profileImage
                              ? `${API_BASE_URL}/guideVerification/${selectedBooking.guide.profileImage.replace(/^\/+/, '').replace(/^uploads\//, '')}`
                              : "https://via.placeholder.com/150")
                          : (selectedBooking.hotel?.profileImage
                              ? `${API_BASE_URL}${selectedBooking.hotel.profileImage.replace(/^\/+/, '')}`
                              : "https://via.placeholder.com/150")
                      }}
                      className="w-20 h-20 rounded-lg"
                      onError={(e) => {
                        console.log("Image Load Error in modal:", e.nativeEvent.error);
                        console.log("Failed to load image for:", bookingType);
                        console.log("Selected booking data:", JSON.stringify(selectedBooking, null, 2));
                      }}
                    />
                    <View className="ml-4">
                      <Text className="text-lg font-bold">
                        {bookingType === "guide"
                          ? (selectedBooking.guide?.user?.name || "Unknown Guide")
                          : (selectedBooking.hotel?.name || "Unknown Hotel")}
                      </Text>
                      <Text className="text-sm text-gray-600">
                        {bookingType === "guide"
                          ? (selectedBooking.guide?.specialization || "No specialization listed")
                          : (selectedBooking.hotel?.location || "No location listed")}
                      </Text>
                    </View>
                  </View>

                  <View className="bg-gray-100 p-3 rounded-lg mb-4">
                    <Text className="text-base mb-2">
                      <Text className="font-semibold">Booking ID:</Text>{" "}
                      {selectedBooking.id}
                    </Text>
                    <Text className="text-base mb-2">
                      <Text className="font-semibold">Booking Dates:</Text>{" "}
                      {new Date(selectedBooking.startDate).toDateString()} -{" "}
                      {new Date(selectedBooking.endDate).toDateString()}
                    </Text>
                    <Text className="text-base mb-2">
                      <Text className="font-semibold">Status:</Text>{" "}
                      <Text className={getStatusColor(getBookingStatus(selectedBooking.startDate, selectedBooking.endDate))}>
                        {getBookingStatus(selectedBooking.startDate, selectedBooking.endDate).charAt(0).toUpperCase() + 
                         getBookingStatus(selectedBooking.startDate, selectedBooking.endDate).slice(1)}
                      </Text>
                    </Text>
                    <Text className="text-base mb-2">
                      <Text className="font-semibold">Payment Status:</Text>{" "}
                      <Text className={selectedBooking.paymentStatus ? "text-green-600" : "text-red-600"}>
                        {selectedBooking.paymentStatus ? "Paid" : "Unpaid"}
                      </Text>
                    </Text>
                  </View>

                  {bookingType === "hotel" && (
                    <View className="bg-gray-100 p-3 rounded-lg mb-4">
                      <Text className="text-base mb-2">
                        <Text className="font-semibold">Rooms Booked:</Text>{" "}
                        {selectedBooking.rooms || "N/A"}
                      </Text>
                      
                    </View>
                  )}

                  {bookingType === "guide" && (
                    <View className="bg-gray-100 p-3 rounded-lg mb-4">
                      <Text className="text-base mb-2">
                        <Text className="font-semibold">Guide Specialization:</Text>{" "}
                        {selectedBooking.guide?.specialization || "Not specified"}
                      </Text>
                      <Text className="text-base mb-2">
                        <Text className="font-semibold">Guide Contact:</Text>{" "}
                        {selectedBooking.guide?.email || "Not available"}
                      </Text>
                    </View>
                  )}
                </View>
              ) : (
                <Text>No booking details available.</Text>
              )}
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

export default UserBooking;
