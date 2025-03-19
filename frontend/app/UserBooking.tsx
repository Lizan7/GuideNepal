import React, { useState, useEffect, useRef } from "react";
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
import RBSheet from "react-native-raw-bottom-sheet";

const UserBooking = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [guideBookings, setGuideBookings] = useState([]);
  const [hotelBookings, setHotelBookings] = useState([]);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [bookingType, setBookingType] = useState(null);
  const [filterType, setFilterType] = useState("all");
  const refRBSheet = useRef();

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

      if (response.data && response.data.bookings) {
        setGuideBookings(response.data.bookings.guideBookings);
        setHotelBookings(response.data.bookings.hotelBookings);
      } else {
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

  const handleViewBooking = (booking, type) => {
    setSelectedBooking(booking);
    setBookingType(type);
    refRBSheet.current.open();
  };

  const renderBookingItem = ({ item }, type) => (
    <View className="bg-gray-100 p-4 m-2 rounded-lg flex-row items-center">
      <Image
        source={{
          uri: `${API_BASE_URL}${
            type === "guide" ? item.guide.profileImage : item.hotel.profileImage
          }`,
        }}
        className="w-20 h-20 rounded-lg"
      />
      <View className="flex-1 ml-4">
        <Text className="text-base font-bold">
          {type === "guide" ? item.guide.email : item.hotel.name}
        </Text>
        <Text className="text-sm text-gray-500">
          {type === "guide" ? item.guide.specialization : item.hotel.location}
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

  return (
    <View className="flex-1 bg-white">
      <View className="px-6 py-6 bg-gray-200 flex-row items-center justify-between">
        <TouchableOpacity onPress={() => router.replace("/UserHome")}>
          <Ionicons name="chevron-back-outline" size={24} color="black" />
        </TouchableOpacity>
        <Text className="text-lg font-bold text-gray-800">
          Upcoming Bookings
        </Text>
        <View className="flex-row gap-2">
          <TouchableOpacity onPress={() => setFilterType("all")}>
            <Text
              className={`${
                filterType === "all" ? "text-pink-600" : "text-gray-500"
              }`}
            >
              All
            </Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setFilterType("guide")}>
            <Text
              className={`${
                filterType === "guide" ? "text-pink-600" : "text-gray-500"
              }`}
            >
              Guides
            </Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setFilterType("hotel")}>
            <Text
              className={`${
                filterType === "hotel" ? "text-pink-600" : "text-gray-500"
              }`}
            >
              Hotels
            </Text>
          </TouchableOpacity>
        </View>
      </View>

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

      <RBSheet
        ref={refRBSheet}
        height={350}
        openDuration={250}
        customStyles={{
          container: {
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            padding: 20,
          },
        }}
      >
        {selectedBooking && bookingType ? (
          <View>
            <Text className="text-xl font-bold mb-4">Booking Details</Text>
            <Text className="text-base mb-2">
              <Text className="font-semibold">
                {bookingType === "guide" ? "Guide Email" : "Hotel Name"}:
              </Text>{" "}
              {bookingType === "guide"
                ? selectedBooking.guide.email
                : selectedBooking.hotel.name}
            </Text>
            <Text className="text-base mb-2">
              <Text className="font-semibold">
                {bookingType === "guide" ? "Specialization" : "Location"}:
              </Text>{" "}
              {bookingType === "guide"
                ? selectedBooking.guide.specialization
                : selectedBooking.hotel.location}
            </Text>
          </View>
        ) : (
          <Text>No booking details available.</Text>
        )}
      </RBSheet>
    </View>
  );
};

export default UserBooking;
