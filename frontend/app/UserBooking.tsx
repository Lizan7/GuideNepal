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
  };
}

interface Hotel {
  id: string;
  name: string;
  hotelProfile?: string;
  location?: string;
}

interface Booking {
  id: string;
  startDate: string;
  endDate: string;
  status: string;
  guide?: Guide;
  hotel?: Hotel;
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

  const renderBookingItem = ({ item }, type) => {
    console.log("Rendering booking item:", item);
    console.log("Booking type:", type);
    
    return (
      <View className="bg-gray-100 p-4 m-2 rounded-lg flex-row items-center">
        <Image
          source={{
            uri: type === "guide" 
              ? (item.guide?.profileImage 
                  ? `${API_BASE_URL}/guideVerification/${item.guide.profileImage}`
                  : "https://via.placeholder.com/150")
              : (item.hotel?.hotelProfile 
                  ? `${API_BASE_URL}/hotelUploads/${item.hotel.hotelProfile}`
                  : "https://via.placeholder.com/150")
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
              ? (item.guide?.name || item.guide?.user?.name || "Unknown Guide")
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
          <View className="flex-1 justify-end">
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
                              ? `${API_BASE_URL}/guideVerification/${selectedBooking.guide.profileImage}`
                              : "https://via.placeholder.com/150")
                          : (selectedBooking.hotel?.hotelProfile
                              ? `${API_BASE_URL}/uploads/${selectedBooking.hotel.hotelProfile}`
                              : "https://via.placeholder.com/150")
                      }}
                      className="w-20 h-20 rounded-lg"
                    />
                    <View className="ml-4">
                      <Text className="text-lg font-bold">
                        {bookingType === "guide"
                          ? (selectedBooking.guide?.name || selectedBooking.guide?.user?.name || "Unknown Guide")
                          : (selectedBooking.hotel?.name || "Unknown Hotel")}
                      </Text>
                      <Text className="text-sm text-gray-600">
                        {bookingType === "guide"
                          ? (selectedBooking.guide?.specialization || "No specialization listed")
                          : (selectedBooking.hotel?.location || "No location listed")}
                      </Text>
                    </View>
                  </View>

                  <Text className="text-base mb-2">
                    <Text className="font-semibold">Booking Dates:</Text>{" "}
                    {new Date(selectedBooking.startDate).toDateString()} -{" "}
                    {new Date(selectedBooking.endDate).toDateString()}
                  </Text>
                  <Text className="text-base mb-2">
                    <Text className="font-semibold">Status:</Text>{" "}
                    <Text className={`${
                      selectedBooking.status === "confirmed" ? "text-green-600" :
                      selectedBooking.status === "pending" ? "text-yellow-600" :
                      "text-red-600"
                    }`}>
                      {capitalizeFirstLetter(selectedBooking.status)}
                    </Text>
                  </Text>
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
