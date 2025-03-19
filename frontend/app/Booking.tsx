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
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import DateTimePicker from "@react-native-community/datetimepicker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import API_BASE_URL from "@/config";
import { WebView } from "react-native-webview";

const Booking = () => {
  const router = useRouter();
  const { guideId, guideEmail, guideSpecialization, guideImage } =
    useLocalSearchParams();

  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [paymentModalVisible, setPaymentModalVisible] = useState(false);
  const [paymentUrl, setPaymentUrl] = useState("");
  const [selectedTab, setSelectedTab] = useState("About"); // "About" or "Reviews"

  useEffect(() => {
    const fetchUserId = async () => {
      const storedUserId = await AsyncStorage.getItem("userId");
      setUserId(storedUserId);
    };
    fetchUserId();
  }, []);

  const confirmBooking = async (pidx: string) => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem("token");

      // Verify payment first before confirming booking
      const verifyResponse = await axios.post(
        `${API_BASE_URL}/khalti/verify-payment`,
        { pidx },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (verifyResponse.data.success) {
        const bookingData = {
          userId: parseInt(userId),
          guideId: parseInt(guideId),
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
          paymentStatus: true, // Payment confirmed
          transactionId: verifyResponse.data.transaction.transaction_id, // Optional but recommended
        };

        await axios.post(`${API_BASE_URL}/booking/create`, bookingData, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        Alert.alert(
          "Booking Confirmed ✅",
          `Your booking with ${guideEmail} from ${startDate.toDateString()} to ${endDate.toDateString()} has been confirmed!`
        );

        setModalVisible(false);
        router.push("/UserHome");
      } else {
        Alert.alert(
          "Payment Verification Failed ❌",
          verifyResponse.data.message
        );
      }
    } catch (error) {
      Alert.alert("Booking Failed ❌", "An error occurred while booking.");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Function to handle Khalti Payment
  const handleKhaltiPayment = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem("token");

      if (!token || !userId) {
        Alert.alert("Error", "User authentication failed. Please log in.");
        setLoading(false);
        return;
      }

      const amount = 1000 * 100;

      const response = await axios.post(
        `${API_BASE_URL}/khalti/initiate-payment`,
        {
          amount,
          orderId: `order_${new Date().getTime()}_${Math.floor(
            Math.random() * 1000
          )}`,
          orderName: `Guide Booking - ${guideEmail}`,
          customerInfo: {
            name: "User",
            email: "user@example.com",
            phone: "9800000001",
          },
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Khalti Payment Response:", response.data);

      if (response.data && response.data.payment_url) {
        setPaymentUrl(response.data.payment_url);
        setModalVisible(false);
        setPaymentModalVisible(true);
        // Payment initiated successfully; no error alert needed.
      } else {
        Alert.alert("Error", "Failed to initiate Khalti payment.");
      }
    } catch (error) {
      console.error("Khalti Payment Error:", error.response?.data);
      Alert.alert("Payment Error ❌", "Could not start Khalti payment.");
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
      comment: "Amazing guide! Very professional and knowledgeable.",
    },
    {
      id: "2",
      name: "Jane Smith",
      rating: "⭐⭐⭐⭐",
      comment: "Had a great time exploring with this guide!",
    },
    {
      id: "3",
      name: "Michael Lee",
      rating: "⭐⭐⭐⭐⭐",
      comment: "Very friendly and accommodating!",
    },
  ];

  return (
    <View className="flex-1 bg-white p-4">
      {/* Header */}
      <View className="flex-row items-center justify-between">
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text className="text-xl font-bold">Guide Details</Text>
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

      {/* Action Buttons */}
      <View className="mt-6 flex-row justify-around">
        {/* Chat Button */}
        <TouchableOpacity
          className="bg-gray-200 px-12 py-6 rounded-2xl"
          onPress={() => router.push(`/Chat?guideId=${guideId}`)}
        >
          <Ionicons
            name="chatbubble-ellipses-outline"
            size={30}
            color="black"
          />
        </TouchableOpacity>

        {/* Book Button (Opens Modal) */}
        <TouchableOpacity
          className="bg-blue-400 px-12 py-6 rounded-3xl"
          onPress={() => setModalVisible(true)}
        >
          <Ionicons name="calendar-outline" size={30} color="black" />
        </TouchableOpacity>
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
                  Book Guide
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
                      display="default"
                      onChange={(event, selectedDate) => {
                        setShowStartPicker(false);
                        if (selectedDate) setStartDate(selectedDate);
                      }}
                    />
                  )}
                </View>

                {/* End Date Picker */}
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
                      display="default"
                      onChange={(event, selectedDate) => {
                        setShowEndPicker(false);
                        if (selectedDate) {
                          setEndDate(selectedDate);
                        }
                      }}
                    />
                  )}
                </View>

                {/* Khalti Payment Button */}
                <TouchableOpacity
                  disabled={loading} // Disable button when loading is true
                  className="mt-6 bg-green-600 p-3 rounded-lg items-center"
                  onPress={handleKhaltiPayment}
                >
                  {loading ? (
                    <ActivityIndicator color="white" />
                  ) : (
                    <Text className="text-white font-bold">
                      Pay with Khalti
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* ✅ Khalti Payment Modal */}
      <Modal
        visible={paymentModalVisible}
        transparent={false}
        animationType="slide"
        onRequestClose={() => setPaymentModalVisible(false)}
      >
        <WebView
          source={{ uri: paymentUrl }}
          onNavigationStateChange={(navState) => {
            console.log("Navigating to:", navState.url);
            if (navState.url.includes("payment-success")) {
              setPaymentModalVisible(false); // ✅ Close modal after successful payment
              confirmBooking(); // ✅ Confirm booking after successful payment
            }
          }}
        />
        <TouchableOpacity
          className="absolute top-10 right-5 p-3 rounded-full"
          onPress={() => setPaymentModalVisible(false)}
        >
          <Ionicons name="close" size={24} color="black" />
        </TouchableOpacity>
      </Modal>

      {/* ✅ About & Reviews Section */}
      <View className="mt-6">
        {/* Tabs */}
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

        {/* About Section */}
        {selectedTab === "About" && (
          <View className="mt-4 p-3 gap-5">
            <Text className="text-gray-600">
              This guide is an expert in cultural and adventure tours. They have
              over 10 years of experience leading travelers through the most
              breathtaking locations, ensuring a safe and unforgettable
              experience. Lorem ipsum dolor sit amet consectetur, adipisicing
              elit. Repellendus eum omnis maiores assumenda quos a maxime
              quisquam dolorum provident velit? Iste quia animi dignissimos esse
              pariatur rerum, optio molestias sit.
            </Text>
          </View>
        )}

        {/* Reviews Section */}
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
    </View>
  );
};

export default Booking;
