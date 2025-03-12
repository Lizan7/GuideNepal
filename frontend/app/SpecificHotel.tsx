import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Modal,
  TouchableWithoutFeedback,
  FlatList,
  TextInput,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import DateTimePicker from "@react-native-community/datetimepicker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import API_BASE_URL from "@/config";

const HotelBooking = () => {
  const router = useRouter();
  const { hotelId, hotelName, hotelLocation, hotelPrice, hotelImage } =
    useLocalSearchParams();

  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [rooms, setRooms] = useState("1");
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedTab, setSelectedTab] = useState("About");
  const [hotelDetails, setHotelDetails] = useState(null);

  useEffect(() => {
    const fetchUserId = async () => {
      const storedUserId = await AsyncStorage.getItem("userId");
      setUserId(storedUserId);
    };
    fetchUserId();
  }, []);

  // ✅ Fetch Hotel Details from API
  useEffect(() => {
    const fetchHotelDetails = async () => {
      try {
        const token = await AsyncStorage.getItem("token");
        const response = await axios.get(`${API_BASE_URL}/hotels/${hotelId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setHotelDetails(response.data.hotel);
      } catch (error) {
        console.error("Error fetching hotel details:", error);
      }
    };

    fetchHotelDetails();
  }, [hotelId]);

  // ✅ Function to confirm hotel booking
  const confirmHotelBooking = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem("token");

      if (!token || !userId) {
        Alert.alert("Error", "User authentication failed. Please log in.");
        setLoading(false);
        return;
      }

      if (startDate > endDate) {
        Alert.alert("Invalid Dates ❌", "Start date must be before end date.");
        setLoading(false);
        return;
      }

      const bookingData = {
        userId: parseInt(userId),
        hotelId: parseInt(hotelId),
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        rooms: parseInt(rooms),
        paymentStatus: false,
      };

      console.log("🔹 Sending Booking Data:", bookingData);

      const response = await axios.post(
        `${API_BASE_URL}/hotelbooking/hotel/create`,
        bookingData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("✅ Booking Success:", response.data);

      Alert.alert(
        "Booking Confirmed ✅",
        `Your stay at ${
          hotelDetails?.name
        } from ${startDate.toDateString()} to ${endDate.toDateString()} has been booked!`
      );

      setModalVisible(false);
      router.push("/UserHome");
    } catch (error) {
      console.error("❌ Booking Error:", error.response?.data || error.message);
      Alert.alert(
        "Booking Failed ❌",
        error.response?.data?.message || "An error occurred while booking."
      );
    } finally {
      setLoading(false);
    }
  };

  // ✅ Static Reviews Data
  const reviews = [
    {
      id: "1",
      name: "John Doe",
      rating: "⭐⭐⭐⭐⭐",
      comment: "Excellent hotel! Very clean and well managed.",
    },
    {
      id: "2",
      name: "Jane Smith",
      rating: "⭐⭐⭐⭐",
      comment: "Great location and friendly staff!",
    },
    {
      id: "3",
      name: "Michael Lee",
      rating: "⭐⭐⭐⭐⭐",
      comment: "Best experience ever! Highly recommend.",
    },
  ];

  return (
    <View className="flex-1 bg-white p-4">
      {/* Header */}
      <View className="flex-row items-center justify-between">
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text className="text-xl font-bold">Hotel Details</Text>
        <View />
      </View>

      {/* Hotel Info */}
      <View className="items-center mt-6">
        <Image
          source={{ uri: hotelImage }}
          style={{ width: 200, height: 150, borderRadius: 10 }}
        />
        <Text className="text-lg font-semibold mt-2">{hotelName}</Text>
        <Text className="text-gray-500">{hotelLocation}</Text>
        <Text className="text-lg font-bold mt-2">Rs. {hotelPrice} / night</Text>
      </View>

      {/* Action Buttons */}
      <View className="mt-6 flex-row justify-around">
        <TouchableOpacity
          className="bg-gray-200 px-12 py-6 rounded-2xl"
          onPress={() => router.push(`/Chat?hotelId=${hotelId}`)}
        >
          <Ionicons
            name="chatbubble-ellipses-outline"
            size={30}
            color="black"
          />
        </TouchableOpacity>

        <TouchableOpacity
          className="bg-blue-400 px-12 py-6 rounded-3xl"
          onPress={() => setModalVisible(true)}
        >
          <Ionicons name="calendar-outline" size={30} color="black" />
        </TouchableOpacity>
      </View>

      {/* ✅ About & Reviews Section */}
      <View className="mt-6">
        <View className="flex-row justify-around border-b border-gray-300">
          <TouchableOpacity
            className={`pb-2 ${
              selectedTab === "About" ? "border-b-2 border-blue-500" : ""
            }`}
            onPress={() => setSelectedTab("About")}
          >
            <Text className="text-lg font-semibold">About</Text>
          </TouchableOpacity>
          <TouchableOpacity
            className={`pb-2 ${
              selectedTab === "Reviews" ? "border-b-2 border-blue-500" : ""
            }`}
            onPress={() => setSelectedTab("Reviews")}
          >
            <Text className="text-lg font-semibold">Reviews</Text>
          </TouchableOpacity>
        </View>

        {selectedTab === "About" && (
          <ScrollView className="mt-4 p-3">
            <Text className="text-gray-600">
              {hotelDetails?.description ||
                "This hotel provides luxurious and comfortable stays with breathtaking views, world-class amenities, and top-notch service. Perfect for travelers looking for relaxation and adventure."}
            </Text>
          </ScrollView>
        )}

        {selectedTab === "Reviews" && (
          <FlatList
            data={reviews}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View className="mt-4 bg-gray-100 p-3 rounded-lg">
                <Text className="font-semibold">{item.name}</Text>
                <Text className="text-yellow-500">{item.rating}</Text>
                <Text className="text-gray-600">{item.comment}</Text>
              </View>
            )}
          />
        )}
      </View>
      {/* ✅ Booking Modal */}
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
          <View className="flex-1 justify-center items-center bg-blue-300 bg-opacity-50">
            <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
              <View className="bg-white p-6 rounded-lg w-11/12">
                <Text className="text-xl font-bold text-center">
                  Book Hotel
                </Text>

                {/* Start & End Date Picker */}
                <View className="mt-4">
                  <Text className="text-lg font-semibold">Start Date</Text>
                  <TouchableOpacity
                    onPress={() => setShowStartPicker(true)}
                    className="p-3 border border-gray-300 rounded-md mt-2"
                  >
                    <Text className="text-gray-700">
                      {startDate.toDateString()}
                    </Text>
                  </TouchableOpacity>
                  {showStartPicker && (
                    <DateTimePicker
                      value={startDate}
                      mode="date"
                      onChange={(event, selectedDate) => {
                        setShowStartPicker(false);
                        if (selectedDate) setStartDate(selectedDate);
                      }}
                    />
                  )}
                </View>

                <View className="mt-4">
                  <Text className="text-lg font-semibold">End Date</Text>
                  <TouchableOpacity
                    onPress={() => setShowEndPicker(true)}
                    className="p-3 border border-gray-300 rounded-md mt-2"
                  >
                    <Text className="text-gray-700">
                      {endDate.toDateString()}
                    </Text>
                  </TouchableOpacity>
                  {showEndPicker && (
                    <DateTimePicker
                      value={endDate}
                      mode="date"
                      onChange={(event, selectedDate) => {
                        setShowEndPicker(false);
                        if (selectedDate) setEndDate(selectedDate);
                      }}
                    />
                  )}
                </View>

                {/* Rooms Input */}
                <View className="mt-4">
                  <Text className="text-lg font-semibold">Rooms</Text>
                  <TextInput
                    className="p-3 border border-gray-300 rounded-md mt-2"
                    keyboardType="numeric"
                    value={rooms}
                    onChangeText={setRooms}
                  />
                </View>

                {/* Submit Booking Button */}
                <TouchableOpacity
                  className="mt-6 bg-green-600 p-3 rounded-lg items-center"
                  onPress={confirmHotelBooking}
                >
                  {loading ? (
                    <ActivityIndicator color="white" />
                  ) : (
                    <Text className="text-white font-bold">Submit Booking</Text>
                  )}
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
};

export default HotelBooking;
