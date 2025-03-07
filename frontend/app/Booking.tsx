import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import DateTimePicker from "@react-native-community/datetimepicker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import API_BASE_URL from "@/config";

const Booking = () => {
  const router = useRouter();
  const { guideId, guideEmail, guideSpecialization, guideImage } =
    useLocalSearchParams();
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState(null); // Store user ID

  // ✅ Check user ID on component mount
  useEffect(() => {
    const checkUserId = async () => {
      const storedUserId = await AsyncStorage.getItem("userId");
      console.log("🔹 Retrieved User ID:", storedUserId);
      setUserId(storedUserId); // Update state
    };

    checkUserId();
  }, []);

  // Function to handle booking
  const handleBooking = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem("token");

      console.log("🔹 Retrieved Token:", token);
      console.log("🔹 Retrieved User ID:", userId);

      if (!token || !userId) {
        Alert.alert(
          "Error",
          "User authentication failed. Please log in again."
        );
        setLoading(false);
        return;
      }

      // Booking payload
      const bookingData = {
        userId: parseInt(userId), // Ensure userId is an integer
        guideId: parseInt(guideId), // Ensure guideId is an integer
        bookingDate: date.toISOString(), // Send date in ISO format
        paymentStatus: true, // Assume payment is successful for now
      };

      console.log("🔹 Sending Booking Data:", bookingData);

      // API Call to backend
      const response = await axios.post(
        `${API_BASE_URL}/booking/create`,
        bookingData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("✅ Booking Response:", response.data);

      Alert.alert(
        "Booking Confirmed ✅",
        `Your booking with ${guideEmail} on ${date.toDateString()} has been confirmed!`
      );
      router.push("/UserHome"); // Navigate back to home
    } catch (error) {
      console.error("❌ Booking Error:", error.response?.data || error.message);
      Alert.alert("Booking Failed ❌", "An error occurred while booking.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-white p-4">
      {/* Header */}
      <View className="flex-row items-center justify-between">
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text className="text-xl font-bold">Guide Booking</Text>
        <View />
      </View>

      {/* Guide Info */}
      <View className="items-center mt-6">
        <Image
          source={{ uri: guideImage }}
          style={{ width: 150, height: 150, borderRadius: 10 }}
        />
        <Text className="text-lg font-semibold mt-2">{guideEmail}</Text>
        <Text className="text-gray-500">{guideSpecialization}</Text>
      </View>

      {/* Select Date */}
      <View className="mt-6">
        <Text className="text-lg font-semibold">Select Booking Date</Text>
        <TouchableOpacity
          onPress={() => setShowDatePicker(true)}
          className="p-3 border border-gray-300 rounded-md mt-2"
        >
          <Text className="text-gray-700">{date.toDateString()}</Text>
        </TouchableOpacity>

        {showDatePicker && (
          <DateTimePicker
            value={date}
            mode="date"
            display="default"
            onChange={(event, selectedDate) => {
              setShowDatePicker(false);
              if (selectedDate) {
                setDate(selectedDate);
              }
            }}
          />
        )}
      </View>

      {/* Confirm Booking Button */}
      <TouchableOpacity
        className="mt-6 bg-blue-600 p-3 rounded-lg items-center"
        onPress={handleBooking}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text className="text-white font-bold">Confirm Booking</Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

export default Booking;
