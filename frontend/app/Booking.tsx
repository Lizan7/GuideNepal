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
  response?: {
    data?: any;
  };
  message?: string;
}

// Add type for the route params
type RouteParams = {
  guideId: string;
  guideName: string;
  guideSpecialization: string;
  guideImage: string;
  hotelId?: string; // Optional hotel ID
};

// Types for the data
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

// Add new interface for hotel booking
interface HotelBookingData {
  hotelId: string;
  startDate: string;
  endDate: string;
  numberOfRooms: number;
  paymentStatus: boolean;
}

// Add interface for Rating
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

interface RatingData {
  rating: number;
  review: string;
  guideId?: string;
  hotelId?: string;
}

const Booking = () => {
  const router = useRouter();
  const params = useLocalSearchParams<RouteParams>();
  const { guideId, guideName, guideSpecialization, guideImage, hotelId } =
    params;

  // Remove static reviews data
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [paymentModalVisible, setPaymentModalVisible] = useState(false);
  const [paymentUrl, setPaymentUrl] = useState("");
  const [selectedTab, setSelectedTab] = useState("About");
  const [guideBookings, setGuideBookings] = useState<Booking[]>([]);
  const [hotelBookings, setHotelBookings] = useState<Booking[]>([]);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [bookingType, setBookingType] = useState<string | null>(null);
  const [filterType, setFilterType] = useState("all");
  const [showDropdown, setShowDropdown] = useState(false);
  const [showBookingDetails, setShowBookingDetails] = useState(false);
  const [numberOfRooms, setNumberOfRooms] = useState(1);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [userRating, setUserRating] = useState<number>(0);
  const [userReview, setUserReview] = useState<string>("");
  const [allReviews, setAllReviews] = useState<Rating[]>([]);
  const [reviewModalVisible, setReviewModalVisible] = useState(false);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [averageRating, setAverageRating] = useState<number>(0);
  const [totalRatings, setTotalRatings] = useState<number>(0);

  // Add new state for guide details
  const [guideDetails, setGuideDetails] = useState<any>(null);
  const [loadingGuideDetails, setLoadingGuideDetails] = useState(false);

  const [pidx, setPidx] = useState<string>("");
  const [bookingConfirmed, setBookingConfirmed] = useState<boolean>(false);
  const [isCheckingAvailability, setIsCheckingAvailability] = useState<boolean>(false);

  useEffect(() => {
    const fetchUserId = async () => {
      const storedUserId = await AsyncStorage.getItem("userId");
      if (storedUserId) {
      setUserId(storedUserId);
      }
    };
    fetchUserId();
  }, []);

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

  // Add function to fetch guide details
  const fetchGuideDetails = async () => {
    if (!guideId) return;
    
    try {
      setLoadingGuideDetails(true);
      const token = await AsyncStorage.getItem("token");
      
      if (!token) {
        Alert.alert("Error", "Authentication failed. Please log in again.");
        return;
      }

      console.log("Fetching guide details for ID:", guideId);
      const response = await axios.get(`${API_BASE_URL}/guides/details`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log("Guide details response:", response.data);

      if (response.data && response.data.guides) {
        // Find the guide with matching ID
        const guide = response.data.guides.find((g: any) => g.id === parseInt(guideId));
        if (guide) {
          console.log("Found guide with charge:", guide.charge);
          setGuideDetails(guide);
        } else {
          console.log("Guide not found in response");
          setGuideDetails(null);
        }
      } else {
        console.log("No guides data in response");
        setGuideDetails(null);
      }
    } catch (error: any) {
      console.error("Error fetching guide details:", error);
      if (error.response) {
        console.error("Error response:", error.response.data);
        Alert.alert("Error", "Failed to fetch guide details. Please try again later.");
      } else {
        Alert.alert("Error", "Network error. Please check your connection.");
      }
      setGuideDetails(null);
    } finally {
      setLoadingGuideDetails(false);
    }
  };

  // Add useEffect to fetch guide details when component mounts
  useEffect(() => {
    if (guideId) {
      fetchGuideDetails();
      fetchRatings("guide", guideId);
    } else if (hotelId) {
      fetchRatings("hotel", hotelId);
    }
  }, [guideId, hotelId]);

  // Add function to fetch ratings
  const fetchRatings = async (type: string, id: string) => {
    try {
      setLoadingReviews(true);
      const token = await AsyncStorage.getItem("token");
      
      if (!token) {
        console.error("Authentication failed. Please log in again.");
        return;
      }

      console.log(`Fetching ${type} ratings for ID:`, id);
      const response = await axios.get(`${API_BASE_URL}/rate/${type}/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log(`${type} ratings response:`, response.data);

      if (response.data && response.data.success) {
        setAllReviews(response.data.ratings || []);
        setAverageRating(response.data.averageRating || 0);
        setTotalRatings(response.data.totalRatings || 0);
      } else {
        console.log(`No ${type} ratings data in response`);
        setAllReviews([]);
        setAverageRating(0);
        setTotalRatings(0);
      }
    } catch (error: any) {
      console.error(`Error fetching ${type} ratings:`, error);
      if (error.response) {
        console.error("Error response:", error.response.data);
      }
      setAllReviews([]);
      setAverageRating(0);
      setTotalRatings(0);
    } finally {
      setLoadingReviews(false);
    }
  };

  const handleViewBooking = (booking: Booking, type: string) => {
    setSelectedBooking(booking);
    setBookingType(type);
    setShowBookingDetails(true);
  };

  const renderBookingItem = (
    { item }: { item: Booking & { type: string } },
    type: string
  ) => {
    console.log("Rendering booking item:", item);
    console.log("Booking type:", type);

    return (
      <View className="bg-gray-100 p-4 m-2 rounded-lg flex-row items-center">
        <Image
          source={{
            uri:
              type === "guide"
                ? item.guide?.profileImage
                  ? `${API_BASE_URL}/guideVerification/${item.guide.profileImage}`
                  : "https://via.placeholder.com/150"
                : item.hotel?.hotelProfile
                ? `${API_BASE_URL}/hotelUploads/${item.hotel.hotelProfile}`
                : "https://via.placeholder.com/150",
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
              ? item.guide?.name || item.guide?.user?.name || "Unknown Guide"
              : item.hotel?.name || "Unknown Hotel"}
          </Text>
          <Text className="text-sm text-gray-500">
            {type === "guide"
              ? item.guide?.specialization || "No specialization listed"
              : item.hotel?.location || "No location listed"}
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

  const calculatePaymentAmount = (startDate: Date, endDate: Date, pricePerDay: number): number => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays * pricePerDay * 100; // Convert to paisa for Khalti
  };

  // Add function to check date availability
  const checkDateAvailability = async (): Promise<boolean> => {
    console.log("🟡 checkDateAvailability started");
    if (!guideId) {
      console.log("🟡 No guide ID provided, skipping availability check");
      return true; // Skip check for hotel bookings
    }
    
    try {
      console.log("🟡 Setting isCheckingAvailability to true");
      setIsCheckingAvailability(true);
      
      console.log("🟡 Getting token from AsyncStorage");
      const token = await AsyncStorage.getItem("token");
      
      if (!token) {
        console.log("🟡 No token found, showing error alert");
        Alert.alert("Error", "Authentication failed. Please log in again.");
        return false;
      }
      
      console.log("🟡 Checking availability for guide ID:", guideId);
      console.log("🟡 Selected dates:", startDate.toISOString(), "to", endDate.toISOString());
      
      // Format dates for API request
      const formattedStartDate = startDate.toISOString().split('T')[0];
      const formattedEndDate = endDate.toISOString().split('T')[0];
      
      console.log("🟡 Formatted dates for API:", formattedStartDate, "to", formattedEndDate);
      
      const requestData = {
        guideId,
        startDate: formattedStartDate,
        endDate: formattedEndDate
      };
      
      console.log("🟡 Sending availability check request with data:", requestData);
      console.log("🟡 API URL:", `${API_BASE_URL}/booking/check-availability`);
      
      const response = await axios.post(
        `${API_BASE_URL}/booking/check-availability`,
        requestData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("🟡 Availability check response:", response.data);
      
      if (response.data && response.data.available === false) {
        const existingBooking = response.data.existingBooking;
        console.log("Guide is not available. Existing booking:", existingBooking);
        
        const startDate = new Date(existingBooking.startDate).toLocaleDateString();
        const endDate = new Date(existingBooking.endDate).toLocaleDateString();
        
        if (existingBooking.userId === parseInt(userId || "0")) {
          Alert.alert(
            "Already Booked", 
            `You have already booked this guide from ${startDate} to ${endDate}.`
          );
        } else {
          Alert.alert(
            "Guide Not Available", 
            `This guide is already booked from ${startDate} to ${endDate}.`
          );
        }
        return false;
      }
      
      console.log("Guide is available for the selected dates");
      return true;
    } catch (error: any) {
      console.error("Availability check error:", error);
      if (error.response) {
        console.error("Error response data:", error.response.data);
        console.error("Error response status:", error.response.status);
      }
      
      if (error.response && error.response.status === 400 && error.response.data.error) {
        Alert.alert("Error", error.response.data.error);
      } else {
        Alert.alert("Error", "Failed to check guide availability. Please try again.");
      }
      return false;
    } finally {
      setIsCheckingAvailability(false);
    }
  };

  const handleKhaltiPayment = async (): Promise<void> => {
    console.log("🔵 handleKhaltiPayment started");
    try {
      console.log("🔵 Setting loading state to true");
      setLoading(true);
      setBookingConfirmed(false);
      
      // Check if dates are available before proceeding
      console.log("🔵 About to check date availability...");
      console.log("🔵 Current guideId:", guideId);
      console.log("🔵 Current startDate:", startDate);
      console.log("🔵 Current endDate:", endDate);
      
      const isAvailable = await checkDateAvailability();
      console.log("🔵 Availability check result:", isAvailable);
      
      if (!isAvailable) {
        console.log("🔵 Guide is not available, stopping payment process");
        setLoading(false);
        return;
      }
      
      console.log("🔵 Guide is available, proceeding with payment");
      
      const token = await AsyncStorage.getItem("token");
      console.log("🔵 Token retrieved:", token ? "Token exists" : "No token found");

      if (!token) {
        console.log("🔵 No token found, showing error alert");
        Alert.alert("Error", "Authentication failed. Please log in again.");
        setLoading(false);
        return;
      }

      // Calculate payment amount based on number of days and guide's charge per day
      let pricePerDay = 1000; // Default price
      if (guideId && guideDetails && guideDetails.charge) {
        pricePerDay = guideDetails.charge;
        console.log("Using guide's charge per day:", pricePerDay);
      } else if (hotelId) {
        pricePerDay = 2000; // Default hotel price
        console.log("Using default hotel price per day:", pricePerDay);
      } else {
        console.log("Using default guide price per day:", pricePerDay);
        console.log("Guide details:", guideDetails);
      }
      
      const amount = calculatePaymentAmount(startDate, endDate, pricePerDay);
      console.log("Calculated payment amount:", amount, "paisa (", amount/100, "rupees)");
      
      // Create a unique order ID
      const orderId = `ORDER-${Date.now()}`;
      
      // Create a descriptive order name
      const orderName = guideId 
        ? `Guide Booking - ${guideName} (${new Date(startDate).toLocaleDateString()} to ${new Date(endDate).toLocaleDateString()})`
        : `Hotel Booking - ${hotelId} (${new Date(startDate).toLocaleDateString()} to ${new Date(endDate).toLocaleDateString()})`;

      console.log("Initiating Khalti payment with:", {
        amount,
        orderId,
        orderName
      });

      const response = await axios.post(
        `${API_BASE_URL}/payment/initiate-payment`,
        {
          amount,
          orderId,
          orderName,
          customerInfo: {
            name: userId,
            email: "user@example.com",
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
        "Khalti Payment Error:",
        khaltiError.response?.data || khaltiError.message
      );
      Alert.alert("Payment Error ❌", "Could not start Khalti payment.");
      setLoading(false);
    }
  };

  const confirmBooking = async (): Promise<void> => {
    try {
      // If booking is already confirmed, don't proceed
      if (bookingConfirmed) {
        console.log("Booking already confirmed, skipping duplicate confirmation");
        return;
      }
      
      setLoading(true);
      const token = await AsyncStorage.getItem("token");

      if (!token) {
        Alert.alert("Error", "Authentication failed. Please log in again.");
        return;
      }

      if (!pidx) {
        Alert.alert("Error", "Payment ID not found. Please try the payment again.");
        return;
      }

      // First verify the payment
      const verifyResponse = await axios.post(
        `${API_BASE_URL}/payment/verify-payment`,
        { pidx },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Payment verification response:", verifyResponse.data);

      if (!verifyResponse.data.success) {
        Alert.alert("Error", "Payment verification failed. Please try again.");
        return;
      }

      // If payment is verified, create the booking
      const bookingData = {
        guideId,
        startDate,
        endDate,
        paymentStatus: true,
        transactionId: verifyResponse.data.transaction?.transaction_id || "",
      };

      console.log("Creating booking with data:", bookingData);

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

      console.log("Booking creation response:", response.data);

      if (response.data.success) {
        Alert.alert("Success", `Payment successful and ${guideName} is booked!`);
        // Don't navigate back, stay on the current page
        // router.back();
      } else {
        Alert.alert("Error", "Failed to confirm booking.");
      }
    } catch (error: any) {
      console.error("Booking Error:", error);
      
      // Check if the error is due to overlapping bookings
      if (error.response && error.response.status === 400 && error.response.data.error) {
        const errorMessage = error.response.data.error;
        const existingBooking = error.response.data.existingBooking;
        
        if (existingBooking) {
          const startDate = new Date(existingBooking.startDate).toLocaleDateString();
          const endDate = new Date(existingBooking.endDate).toLocaleDateString();
          
          Alert.alert(
            "Booking Unavailable", 
            `${errorMessage}\n\nBooked from ${startDate} to ${endDate}.`
          );
        } else {
          Alert.alert("Error", errorMessage);
        }
      } else {
        Alert.alert("Error", "Failed to confirm booking. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const confirmHotelBooking = async (): Promise<void> => {
    try {
      // If booking is already confirmed, don't proceed
      if (bookingConfirmed) {
        console.log("Hotel booking already confirmed, skipping duplicate confirmation");
        return;
      }
      
      setLoading(true);
      const token = await AsyncStorage.getItem("token");

      if (!token) {
        Alert.alert("Error", "Authentication failed. Please log in again.");
        return;
      }

      if (!pidx) {
        Alert.alert("Error", "Payment ID not found. Please try the payment again.");
        return;
      }

      // First verify the payment
      const verifyResponse = await axios.post(
        `${API_BASE_URL}/payment/verify-payment`,
        { pidx },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Payment verification response:", verifyResponse.data);

      if (!verifyResponse.data.success) {
        Alert.alert("Error", "Payment verification failed. Please try again.");
        return;
      }

      // If payment is verified, create the hotel booking
      const bookingData = {
        hotelId,
        startDate,
        endDate,
        numberOfRooms,
        paymentStatus: true,
        transactionId: verifyResponse.data.transaction?.transaction_id || "",
      };

      console.log("Creating hotel booking with data:", bookingData);

      const response = await axios.post(
        `${API_BASE_URL}/booking/hotel/create`,
        bookingData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Hotel booking creation response:", response.data);

      if (response.data.success) {
        Alert.alert("Success", "Hotel booking confirmed successfully!");
        // Don't navigate back, stay on the current page
        // router.back();
      } else {
        Alert.alert("Error", "Failed to confirm hotel booking.");
      }
    } catch (error: any) {
      console.error("Hotel Booking Error:", error);
      
      // Check if the error is due to overlapping bookings
      if (error.response && error.response.status === 400 && error.response.data.error) {
        const errorMessage = error.response.data.error;
        const existingBooking = error.response.data.existingBooking;
        
        if (existingBooking) {
          const startDate = new Date(existingBooking.startDate).toLocaleDateString();
          const endDate = new Date(existingBooking.endDate).toLocaleDateString();
          
          Alert.alert(
            "Booking Unavailable", 
            `${errorMessage}\n\nBooked from ${startDate} to ${endDate}.`
          );
        } else {
          Alert.alert("Error", errorMessage);
        }
      } else {
        Alert.alert("Error", "Failed to confirm hotel booking. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const startChat = async (): Promise<void> => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem("token");

      const response = await axios.post(
        `${API_BASE_URL}/chat/receiver`,
        {
          guideId,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Receiver data:", response);

      if (response.data) {
        router.push({
          pathname: "/ChatRoom",
          params: {
            friendId: response.data,
            friendName: guideName,
          },
        });
      } else {
        Alert.alert("Error", "Could not start chat. User information missing.");
      }
    } catch (error) {
      console.error("Start chat error:", error);
      Alert.alert(
        "Chat Error",
        "Could not start chat with this guide. Please try again later."
      );
    } finally {
      setLoading(false);
    }
  };

  // Function to handle review submission
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
      
      // Determine if we're rating a guide or hotel
      const ratingData: RatingData = {
        rating: userRating,
        review: userReview.trim(),
      };
      
      // Add either guideId or hotelId to the request
      if (guideId) {
        ratingData.guideId = guideId;
      } else if (hotelId) {
        ratingData.hotelId = hotelId;
      } else {
        Alert.alert("Error", "No guide or hotel ID found");
        return;
      }
      
      // Submit the rating to the backend
      const response = await axios.post(
        `${API_BASE_URL}/rate/createRating`,
        ratingData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      
      if (response.data && response.data.success) {
        // Refresh the ratings after successful submission
        if (guideId) {
          fetchRatings("guide", guideId);
        } else if (hotelId) {
          fetchRatings("hotel", hotelId);
        }
        
        // Reset form and close modal
        setUserRating(0);
        setUserReview("");
        setReviewModalVisible(false);
        
        Alert.alert("Success", "Your review has been submitted successfully!");
      } else {
        Alert.alert("Error", "Failed to submit review. Please try again later.");
      }
    } catch (error) {
      console.error("Error submitting review:", error);
      Alert.alert("Error", "Failed to submit review. Please try again later.");
    } finally {
      setSubmittingReview(false);
    }
  };

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
        <Text className="text-lg font-semibold mt-2">{guideName}</Text>
        <Text className="text-gray-500">{guideSpecialization}</Text>
      </View>

      {/* Action Buttons */}
      <View className="mt-6 flex-row justify-around">
        {/* Chat Button */}
        <TouchableOpacity
          className="bg-gray-200 px-12 py-6 rounded-2xl"
          onPress={startChat}
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
                  {hotelId ? "Book Hotel Room" : "Book Guide"}
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

                {/* Room Selection for Hotels */}
                {hotelId && (
                  <View className="mt-4">
                    <Text className="text-lg font-semibold">
                      Number of Rooms
                    </Text>
                    <View className="flex-row items-center justify-between mt-2">
                      <TouchableOpacity
                        onPress={() =>
                          setNumberOfRooms(Math.max(1, numberOfRooms - 1))
                        }
                        className="bg-gray-200 p-3 rounded-l-md"
                      >
                        <Ionicons name="remove" size={24} color="black" />
                      </TouchableOpacity>
                      <Text className="text-lg font-semibold mx-4">
                        {numberOfRooms}
                      </Text>
                      <TouchableOpacity
                        onPress={() => setNumberOfRooms(numberOfRooms + 1)}
                        className="bg-gray-200 p-3 rounded-r-md"
                      >
                        <Ionicons name="add" size={24} color="black" />
                      </TouchableOpacity>
                    </View>
                  </View>
                )}

                {/* Khalti Payment Button */}
                <TouchableOpacity
                  disabled={loading || isCheckingAvailability}
                  className={`mt-6 p-3 rounded-lg items-center ${
                    loading || isCheckingAvailability ? "bg-gray-400" : "bg-green-600"
                  }`}
                  onPress={handleKhaltiPayment}
                >
                  {loading || isCheckingAvailability ? (
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
                
                // Call the appropriate confirmation function based on booking type
                if (guideId) {
                  confirmBooking();
                } else if (hotelId) {
                  confirmHotelBooking();
                }
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
          <View className="mt-4 p-4 bg-white rounded-lg shadow-sm">
            {loadingGuideDetails ? (
              <View className="items-center justify-center py-8">
                <ActivityIndicator size="large" color="#3B82F6" />
                <Text className="mt-3 text-gray-600 font-medium">Loading guide details...</Text>
              </View>
            ) : guideDetails ? (
              <View className="space-y-5 gap-4">
                <View className="bg-blue-50 p-4 rounded-lg">
                  <Text className="text-lg font-bold text-blue-800 mb-2">Guide Information</Text>
                  <View className="space-y-3">
                    <View className="flex-row justify-between border-b border-blue-100 pb-2">
                      <Text className="text-gray-700 font-semibold">Name:</Text>
                      <Text className="text-gray-800">{guideDetails.name || guideName}</Text>
                    </View>
                    <View className="flex-row justify-between border-b border-blue-100 pb-2">
                      <Text className="text-gray-700 font-semibold">Specialization:</Text>
                      <Text className="text-gray-800">{guideDetails.specialization || guideSpecialization}</Text>
                    </View>
                    <View className="flex-row justify-between border-b border-blue-100 pb-2">
                      <Text className="text-gray-700 font-semibold">Location:</Text>
                      <Text className="text-gray-800">{guideDetails.location || "Not specified"}</Text>
                    </View>
                  </View>
                </View>
                
                <View className="bg-green-50 p-4 rounded-lg">
                  <Text className="text-lg font-bold text-green-800 mb-2">Contact Details</Text>
                  <View className="space-y-3">
                    <View className="flex-row justify-between border-b border-green-100 pb-2">
                      <Text className="text-gray-700 font-semibold">Phone:</Text>
                      <Text className="text-gray-800">{guideDetails.phoneNumber || "Not specified"}</Text>
                    </View>
                    <View className="flex-row justify-between border-b border-green-100 pb-2">
                      <Text className="text-gray-700 font-semibold">Email:</Text>
                      <Text className="text-gray-800">{guideDetails.email || "Not specified"}</Text>
                    </View>
                    <View className="flex-row justify-between border-b border-green-100 pb-2">
                      <Text className="text-gray-700 font-semibold">Charge per Day:</Text>
                      <Text className="text-gray-800 font-bold">{guideDetails.charge ? `Rs. ${guideDetails.charge}` : "Not specified"}</Text>
                    </View>
                  </View>
                </View>
                
                {guideDetails.about && (
                  <View className="bg-purple-50 p-4 rounded-lg">
                    <Text className="text-lg font-bold text-purple-800 mb-2">About</Text>
                    <Text className="text-gray-700 leading-5">{guideDetails.about}</Text>
                  </View>
                )}
              </View>
            ) : (
              <View className="items-center justify-center py-8 bg-gray-50 rounded-lg">
                <Ionicons name="information-circle-outline" size={40} color="#6B7280" />
                <Text className="mt-3 text-gray-600 font-medium">No guide details available</Text>
              </View>
            )}
          </View>
        )}

        {selectedTab === "Reviews" && (
          <View className="mt-4 p-3">
            <View className="flex-row justify-between items-center mb-4">
              <View>
                <Text className="text-lg font-bold text-gray-800">Reviews</Text>
                {totalRatings > 0 && (
                  <View className="flex-row items-center mt-1">
                    <Text className="text-yellow-500 mr-1">
                      {"⭐".repeat(Math.round(averageRating))}
                    </Text>
            <Text className="text-gray-600">
                      ({averageRating.toFixed(1)} • {totalRatings} reviews)
            </Text>
          </View>
        )}
              </View>
              <TouchableOpacity 
                className="bg-blue-500 px-4 py-2 rounded-full"
                onPress={() => setReviewModalVisible(true)}
              >
                <Text className="text-white font-medium">Write a Review</Text>
              </TouchableOpacity>
            </View>
            
            {loadingReviews ? (
              <View className="items-center justify-center py-8">
                <ActivityIndicator size="large" color="#3B82F6" />
                <Text className="mt-3 text-gray-600 font-medium">Loading reviews...</Text>
              </View>
            ) : allReviews.length > 0 ? (
          <FlatList
                data={allReviews}
                keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
                  <View className="bg-white p-4 rounded-lg mb-3 shadow-sm">
                    <View className="flex-row justify-between items-center mb-2">
                      <Text className="font-semibold text-gray-800">{item.userName}</Text>
                      <Text className="text-yellow-500">{"⭐".repeat(item.rating)}</Text>
                    </View>
                    <Text className="text-gray-600">{item.review}</Text>
                    <Text className="text-gray-400 text-xs mt-2">
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
                        uri:
                          bookingType === "guide"
                            ? selectedBooking.guide?.profileImage
                              ? `${API_BASE_URL}/guideVerification/${selectedBooking.guide.profileImage}`
                              : "https://via.placeholder.com/150"
                            : selectedBooking.hotel?.hotelProfile
                            ? `${API_BASE_URL}/uploads/${selectedBooking.hotel.hotelProfile}`
                            : "https://via.placeholder.com/150",
                      }}
                      className="w-20 h-20 rounded-lg"
                    />
                    <View className="ml-4">
                      <Text className="text-lg font-bold">
                        {bookingType === "guide"
                          ? selectedBooking.guide?.name ||
                            selectedBooking.guide?.user?.name ||
                            "Unknown Guide"
                          : selectedBooking.hotel?.name || "Unknown Hotel"}
                      </Text>
                      <Text className="text-sm text-gray-600">
                        {bookingType === "guide"
                          ? selectedBooking.guide?.specialization ||
                            "No specialization listed"
                          : selectedBooking.hotel?.location ||
                            "No location listed"}
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
                    <Text
                      className={`${
                        selectedBooking.status === "confirmed"
                          ? "text-green-600"
                          : selectedBooking.status === "pending"
                          ? "text-yellow-600"
                          : "text-red-600"
                      }`}
                    >
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
            <View className="flex-1 justify-end bg-blue-100 bg-opacity-70">
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
                        placeholder="Share your experience with this guide..."
                        multiline
                        textAlignVertical="top"
                        value={userReview}
                        onChangeText={setUserReview}
                      />
                    </View>
                  </ScrollView>
                  
                  <View className="flex-row space-x-3 mt-2 gap-4">
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

export default Booking;
