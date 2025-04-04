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
  KeyboardAvoidingView,
  Platform,
  Keyboard,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import DateTimePicker from "@react-native-community/datetimepicker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import API_BASE_URL from "@/config";
import { WebView } from "react-native-webview";

// Add type for the error
interface KhaltiError {
  message: string;
  response?: {
    data?: any;
    status?: number;
  };
}

// Define interface for hotel details
interface HotelDetails {
  id: number;
  name: string;
  location: string;
  phoneNumber: string;
  email: string;
  price: number;
  totalRooms: number;
  description?: string;
  hotelProfile?: string;
  roomsAvailable?: number;
  itineraries?: string;
}

// Define interface for ratings
interface Rating {
  id: number;
  userId: number;
  userName: string;
  rating: number;
  review: string;
  hotelId: number | null;
  guideId: number | null;
  createdAt: string;
  updatedAt: string;
}

const HotelBooking = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const hotelId = params.hotelId as string;
  const hotelName = params.hotelName as string;
  const hotelLocation = params.hotelLocation as string;
  const hotelPrice = params.hotelPrice as string;
  const hotelImage = params.hotelImage as string;

  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [rooms, setRooms] = useState("1");
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedTab, setSelectedTab] = useState("About");
  const [hotelDetails, setHotelDetails] = useState<HotelDetails | null>(null);
  const [reviewModalVisible, setReviewModalVisible] = useState(false);
  const [userRating, setUserRating] = useState(0);
  const [userReview, setUserReview] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [loadingRatings, setLoadingRatings] = useState(false);
  const [averageRating, setAverageRating] = useState(0);
  const [totalRatings, setTotalRatings] = useState(0);
  
  // Add new state variables for payment
  const [paymentModalVisible, setPaymentModalVisible] = useState(false);
  const [paymentUrl, setPaymentUrl] = useState("");
  const [pidx, setPidx] = useState("");
  const [bookingConfirmed, setBookingConfirmed] = useState(false);

  // Function to fetch ratings
  const fetchRatings = async () => {
    try {
      setLoadingRatings(true);
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        Alert.alert("Error", "No token found, please log in again.");
        return;
      }

      const response = await axios.get(`${API_BASE_URL}/rate/hotel/${hotelId}`, {
        headers: { Authorization: `Bearer ${token.trim()}` },
      });

      if (response.data && response.data.ratings) {
        setRatings(response.data.ratings);
        setAverageRating(response.data.averageRating || 0);
        setTotalRatings(response.data.totalRatings || 0);
      }
    } catch (error) {
      console.error("Error fetching ratings:", error);
      if (axios.isAxiosError(error)) {
        Alert.alert(
          "Error",
          error.response?.data?.message || "Failed to fetch ratings."
        );
      }
    } finally {
      setLoadingRatings(false);
    }
  };

  // Function to submit a review
  const handleSubmitReview = async () => {
    if (userRating === 0) {
      Alert.alert("Error", "Please select a rating");
      return;
    }
    
    if (!userReview.trim()) {
      Alert.alert("Error", "Please enter a review");
      return;
    }
    
    try {
      setSubmittingReview(true);
      const token = await AsyncStorage.getItem("token");
      
      if (!token) {
        Alert.alert("Error", "Authentication failed. Please log in again.");
        return;
      }
      
      const response = await axios.post(
        `${API_BASE_URL}/rate/createRating`,
        {
          hotelId: parseInt(hotelId),
          rating: userRating,
          review: userReview.trim(),
        },
        {
          headers: {
            Authorization: `Bearer ${token.trim()}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data) {
        Alert.alert("Success", "Your review has been submitted successfully!");
        setUserRating(0);
        setUserReview("");
        setReviewModalVisible(false);
        fetchRatings(); // Refresh ratings after submission
      }
    } catch (error) {
      console.error("Error submitting review:", error);
      if (axios.isAxiosError(error)) {
        Alert.alert(
          "Error",
          error.response?.data?.message || "Failed to submit review. Please try again later."
        );
      }
    } finally {
      setSubmittingReview(false);
    }
  };

  useEffect(() => {
    const fetchUserId = async () => {
      const storedUserId = await AsyncStorage.getItem("userId");
      setUserId(storedUserId);
    };
    fetchUserId();
    fetchRatings(); // Fetch ratings when component mounts
  }, [hotelId]);

  // ✅ Fetch Hotel Details from API
  useEffect(() => {
    const fetchHotelDetails = async () => {
      try {
        setLoading(true);
        const token = await AsyncStorage.getItem("token");
        
        if (!token) {
          Alert.alert("Error", "Authentication failed. Please log in again.");
          return;
        }

        console.log("Fetching hotel details for ID:", hotelId);
        const response = await axios.get(`${API_BASE_URL}/hotels/${hotelId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        console.log("Hotel details response:", response.data);

        if (response.data && response.data.hotel) {
          setHotelDetails(response.data.hotel);
        } else {
          console.log("No hotel data in response");
          setHotelDetails(null);
        }
      } catch (error: any) {
        console.error("Error fetching hotel details:", error);
        if (error.response) {
          console.error("Error response:", error.response.data);
          Alert.alert("Error", "Failed to fetch hotel details. Please try again later.");
        } else {
          Alert.alert("Error", "Network error. Please check your connection.");
        }
        setHotelDetails(null);
      } finally {
        setLoading(false);
      }
    };

    if (hotelId) {
      fetchHotelDetails();
    }
  }, [hotelId]);

  // Calculate payment amount based on number of days and hotel price
  const calculatePaymentAmount = (startDate: Date, endDate: Date, pricePerNight: number, numberOfRooms: number): number => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays * pricePerNight * numberOfRooms * 100; // Convert to paisa for Khalti
  };

  // Function to handle Khalti payment
  const handleKhaltiPayment = async (): Promise<void> => {
    console.log("🔵 handleKhaltiPayment started");
    try {
      console.log("🔵 Setting loading state to true");
      setLoading(true);
      setBookingConfirmed(false);
      
      if (startDate > endDate) {
        Alert.alert("Invalid Dates ❌", "Start date must be before end date.");
        setLoading(false);
        return;
      }
      
      const token = await AsyncStorage.getItem("token");
      console.log("🔵 Token retrieved:", token ? "Token exists" : "No token found");

      if (!token) {
        console.log("🔵 No token found, showing error alert");
        Alert.alert("Error", "Authentication failed. Please log in again.");
        setLoading(false);
        return;
      }

      // Get hotel price from details or use default
      const pricePerNight = hotelDetails?.price || parseInt(hotelPrice) || 2000;
      const numberOfRooms = parseInt(rooms);
      
      // Calculate total amount
      const amount = calculatePaymentAmount(startDate, endDate, pricePerNight, numberOfRooms);
      console.log("Calculated payment amount:", amount, "paisa (", amount/100, "rupees)");
      
      // Create a unique order ID
      const orderId = `HOTEL-ORDER-${Date.now()}`;
      
      // Create a descriptive order name
      const orderName = `Hotel Booking - ${hotelName} (${new Date(startDate).toLocaleDateString()} to ${new Date(endDate).toLocaleDateString()})`;

      console.log("Initiating Khalti payment with:", {
        amount,
        orderId,
        orderName
      });

      // Use the same endpoint as guide booking
      const response = await axios.post(
        `${API_BASE_URL}/payment/initiate-payment`,
        {
          amount,
          orderId,
          orderName,
          customerInfo: {
            name: userId,
            email: "user@example.com",
            // Remove mobile number to match guide booking implementation
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
        setPidx(response.data.pidx); // Store pidx for verification
        setModalVisible(false);
        setPaymentModalVisible(true);
      } else {
        Alert.alert("Error", "Failed to initiate Khalti payment.");
        setLoading(false);
      }
    } catch (error) {
      const khaltiError = error as KhaltiError;
      console.error(
        "Khalti Payment Error Details:",
        {
          message: khaltiError.message,
          response: khaltiError.response?.data,
          status: khaltiError.response?.status
        }
      );
      
      // Extract detailed error message if available
      const errorMessage = khaltiError.response?.data?.details || 
                          khaltiError.response?.data?.error || 
                          khaltiError.message || 
                          "Could not start Khalti payment.";
      
      Alert.alert("Payment Error ❌", errorMessage);
      setLoading(false);
    }
  };

  // Function to confirm hotel booking after payment
  const confirmHotelBooking = async (): Promise<void> => {
    try {
      if (bookingConfirmed) {
        console.log('Booking already confirmed, skipping confirmation');
        return;
      }

      setLoading(true);
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        Alert.alert('Error', 'Please login to continue');
        return;
      }

      // Get userId from AsyncStorage
      const userId = await AsyncStorage.getItem('userId');
      if (!userId) {
        Alert.alert('Error', 'User ID not found. Please login again.');
        return;
      }

      // First verify the payment
      const paymentVerification = await axios.post(
        `${API_BASE_URL}/payment/verify-payment`,
        { pidx },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        }
      );

      console.log('Payment verification response:', paymentVerification.data);

      if (!paymentVerification.data.success) {
        throw new Error(paymentVerification.data.error || 'Payment verification failed');
      }

      // Then create the hotel booking
      const bookingData = {
        hotelId: parseInt(hotelId),
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        rooms: parseInt(rooms),
        paymentStatus: true,
        // Don't send pidx to avoid backend verification
        // pidx: pidx
      };

      console.log('Creating hotel booking with data:', bookingData);

      // Use the correct endpoint for hotel booking creation
      const hotelBookingResponse = await axios.post(
        `${API_BASE_URL}/booking/hotel/create`,
        bookingData,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        }
      );

      console.log('Hotel booking response:', hotelBookingResponse.data);

      if (hotelBookingResponse.data.success) {
        setBookingConfirmed(true);
        Alert.alert(
          'Success',
          'Hotel booking confirmed successfully!',
          [{ text: 'OK', onPress: () => setPaymentModalVisible(false) }]
        );
      } else {
        throw new Error(hotelBookingResponse.data.error || 'Failed to create hotel booking');
      }
    } catch (error: any) {
      console.error('Hotel booking error:', error);
      
      // Check if the error is due to overlapping bookings
      if (error.response && error.response.status === 400 && error.response.data.error) {
        const errorMessage = error.response.data.error;
        const existingBooking = error.response.data.existingBooking;
        
        if (existingBooking) {
          const startDate = new Date(existingBooking.startDate).toLocaleDateString();
          const endDate = new Date(existingBooking.endDate).toLocaleDateString();
          
          Alert.alert(
            'Booking Conflict',
            `${errorMessage}\n\nBooked from ${startDate} to ${endDate}.`,
            [{ text: 'OK' }]
          );
        } else {
          Alert.alert('Error', errorMessage);
        }
      } else {
        Alert.alert('Error', error.message || 'Failed to confirm hotel booking');
      }
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
            
            {loading ? (
              <View className="items-center justify-center py-8">
                <ActivityIndicator size="large" color="#3B82F6" />
                <Text className="mt-3 text-gray-600 font-medium">Loading hotel details...</Text>
              </View>
            ) : hotelDetails ? (
              <View className="space-y-5">
                {/* Hotel Information Card */}
                <View className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
                  <Text className="text-lg font-bold text-blue-800 mb-3">Hotel Information</Text>
                  <View className="space-y-3">
                    <View className="flex-row justify-between border-b border-gray-100 pb-2">
                      <Text className="text-gray-700 font-medium">Name:</Text>
                      <Text className="text-gray-800">{hotelDetails.name || hotelName}</Text>
                    </View>
                    <View className="flex-row justify-between border-b border-gray-100 pb-2">
                      <Text className="text-gray-700 font-medium">Location:</Text>
                      <Text className="text-gray-800">{hotelDetails.location || hotelLocation || "Not specified"}</Text>
                    </View>
                    <View className="flex-row justify-between border-b border-gray-100 pb-2">
                      <Text className="text-gray-700 font-medium">Total Rooms:</Text>
                      <Text className="text-gray-800">{hotelDetails.roomsAvailable || "Not specified"}</Text>
                    </View>
                    <View className="flex-row justify-between border-b border-gray-100 pb-2">
                      <Text className="text-gray-700 font-medium">Price per Night:</Text>
                      <Text className="text-gray-800 font-bold text-green-600">
                        {hotelDetails.price ? `Rs. ${hotelDetails.price}` : hotelPrice ? `Rs. ${hotelPrice}` : "Not specified"}
                      </Text>
                    </View>
                    
                  </View>
                </View>

                {/* Itenaries Information Card */}
                <View className="bg-white rounded-xl shadow-sm p-4 border border-gray-100 mt-4">
                  <Text className="text-lg font-bold text-blue-800 mb-3">Itenaries Information</Text>
                  <View className="space-y-3">
                    <View className="flex-row items-center border-b border-gray-100 pb-2">
                      <Text className="text-gray-800">{hotelDetails.itineraries || "Not specified"}</Text>
                    </View>
                    
                  </View>
                </View>
                
                {/* Contact Information Card */}
                <View className="bg-white rounded-xl shadow-sm p-4 border border-gray-100 mt-4">
                  <Text className="text-lg font-bold text-blue-800 mb-3">Contact Information</Text>
                  <View className="space-y-3">
                    <View className="flex-row items-center border-b border-gray-100 pb-2">
                      <Ionicons name="call-outline" size={20} color="#4B5563" className="mr-2" />
                      <Text className="text-gray-700 font-medium flex-1">Phone:</Text>
                      <Text className="text-gray-800">{hotelDetails.phoneNumber || "Not specified"}</Text>
                    </View>
                    <View className="flex-row items-center border-b border-gray-100 pb-2">
                      <Ionicons name="mail-outline" size={20} color="#4B5563" className="mr-2" />
                      <Text className="text-gray-700 font-medium flex-1">Email:</Text>
                      <Text className="text-gray-800">{hotelDetails.email || "Not specified"}</Text>
                    </View>
                  </View>
                </View>
                
                {/* Description Card */}
                {hotelDetails.description && (
                  <View className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
                    <Text className="text-lg font-bold text-blue-800 mb-3">About</Text>
                    <Text className="text-gray-700 leading-5">{hotelDetails.description}</Text>
                  </View>
                )}
              </View>
            ) : (
              <View className="items-center justify-center py-8 bg-gray-50 rounded-lg">
                <Ionicons name="information-circle-outline" size={40} color="#6B7280" />
                <Text className="mt-3 text-gray-600 font-medium">No hotel details available</Text>
              </View>
            )}
          </ScrollView>
        )}

        {selectedTab === "Reviews" && (
          <View className="mt-4 p-3">
            <View className="flex-row justify-between items-center mb-4">
              <View>
                <Text className="text-lg font-bold text-gray-800">Reviews</Text>
                <Text className="text-gray-600">
                  {averageRating.toFixed(1)} ⭐ ({totalRatings} reviews)
                </Text>
              </View>
              <TouchableOpacity 
                className="bg-blue-500 px-4 py-2 rounded-full"
                onPress={() => setReviewModalVisible(true)}
              >
                <Text className="text-white font-medium">Write a Review</Text>
              </TouchableOpacity>
            </View>
            
            {loadingRatings ? (
              <View className="items-center justify-center py-8">
                <ActivityIndicator size="large" color="#3B82F6" />
                <Text className="mt-3 text-gray-600">Loading reviews...</Text>
              </View>
            ) : ratings.length > 0 ? (
              <FlatList
                data={ratings}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                  <View className="bg-white p-4 rounded-lg mb-3 shadow-sm">
                    <View className="flex-row justify-between items-center mb-2">
                      <Text className="font-semibold text-gray-800">{item.userName}</Text>
                      <Text className="text-yellow-500">{"⭐".repeat(item.rating)}</Text>
                    </View>
                    <Text className="text-gray-600">{item.review}</Text>
                    <Text className="text-gray-400 text-sm mt-2">
                      {new Date(item.createdAt).toLocaleDateString()}
                    </Text>
                  </View>
                )}
              />
            ) : (
              <View className="items-center justify-center py-8 bg-gray-50 rounded-lg">
                <Ionicons name="star-outline" size={40} color="#6B7280" />
                <Text className="mt-3 text-gray-600 font-medium">No reviews yet</Text>
              </View>
            )}
          </View>
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
                  onPress={handleKhaltiPayment}
                >
                  {loading ? (
                    <ActivityIndicator color="white" />
                  ) : (
                    <Text className="text-white font-bold">Pay with Khalti</Text>
                  )}
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* Payment Modal */}
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
            
            // Check if the URL contains the payment verification endpoint
            if (navState.url.includes("/payment/verify-payment") || 
                navState.url.includes("/khalti/verify-payment")) {
              
              // Extract pidx from URL if available
              const pidxMatch = navState.url.match(/[?&]pidx=([^&]+)/);
              if (pidxMatch && pidxMatch[1]) {
                setPidx(pidxMatch[1]);
              }
              
              // Extract status from URL if available
              const statusMatch = navState.url.match(/[?&]status=([^&]+)/);
              if (statusMatch && statusMatch[1] === "Completed" && !bookingConfirmed) {
                setPaymentModalVisible(false);
                setBookingConfirmed(true);
                confirmHotelBooking();
              }
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

      {/* Review Submission Bottom Sheet */}
      <Modal
        visible={reviewModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setReviewModalVisible(false)}
      >
        <KeyboardAvoidingView 
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1 }}
        >
          <TouchableWithoutFeedback onPress={() => {
            Keyboard.dismiss();
            setReviewModalVisible(false);
          }}>
            <View className="flex-1 justify-end bg-gray-200 bg-opacity-30">
              <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
                <View className="bg-white rounded-t-3xl p-6">
                  <View className="items-center mb-4">
                    <View className="w-16 h-1 bg-gray-300 rounded-full mb-4" />
                    <Text className="text-xl font-bold">Write a Review</Text>
                  </View>
                  
                  <ScrollView className="max-h-[70vh]">
                    <View className="mb-6">
                      <Text className="text-gray-700 font-medium mb-2">Your Rating</Text>
                      <View className="flex-row justify-center space-x-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <TouchableOpacity 
                            key={star} 
                            onPress={() => setUserRating(star)}
                          >
                            <Ionicons 
                              name={star <= userRating ? "star" : "star-outline"} 
                              size={32} 
                              color="#FCD34D" 
                            />
                          </TouchableOpacity>
                        ))}
                      </View>
                    </View>
                    
                    <View className="mb-6">
                      <Text className="text-gray-700 font-medium mb-2">Your Review</Text>
                      <TextInput
                        className="border border-gray-300 rounded-lg p-3 h-32 text-base"
                        placeholder="Share your experience with this hotel..."
                        multiline
                        textAlignVertical="top"
                        value={userReview}
                        onChangeText={setUserReview}
                      />
                    </View>
                  </ScrollView>
                  
                  <View className="flex-row space-x-3 mt-2">
                    <TouchableOpacity 
                      className="flex-1 bg-gray-200 p-3 rounded-lg items-center"
                      onPress={() => {
                        Keyboard.dismiss();
                        setReviewModalVisible(false);
                      }}
                    >
                      <Text className="text-gray-700 font-medium">Cancel</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                      className="flex-1 bg-blue-500 p-3 rounded-lg items-center"
                      onPress={() => {
                        Keyboard.dismiss();
                        handleSubmitReview();
                      }}
                      disabled={submittingReview}
                    >
                      {submittingReview ? (
                        <ActivityIndicator color="white" />
                      ) : (
                        <Text className="text-white font-medium">Submit</Text>
                      )}
                    </TouchableOpacity>
                  </View>
                </View>
              </TouchableWithoutFeedback>
            </View>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
};

export default HotelBooking;
