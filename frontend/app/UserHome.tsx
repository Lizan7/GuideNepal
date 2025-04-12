import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  StatusBar,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import API_BASE_URL from "@/config";
import UserNavigation from "@/components/UserNavigation";

interface Guide {
  id: number;
  email: string;
  name: string;
  location: string;
  phoneNumber: string;
  specialization: string;
  profileImage: string;
  verificationImage: string;
  isVerified: boolean;
  user?: {
    name: string;
  };
}

interface Hotel {
  id: number;
  name: string;
  location: string;
  profileImage: string;
  price: number;
  isVerified: boolean;
}

const experiences = [
  { id: 1, title: "Delicious", subtitle: "Food tours", icon: "pizza" },
  { id: 2, title: "Amazing", subtitle: "Walking tour", icon: "walk" },
  { id: 3, title: "Gorgeous", subtitle: "Day trips", icon: "image" },
  { id: 4, title: "Memories", subtitle: "With the family", icon: "people" },
  { id: 5, title: "Enchanting", subtitle: "Night tour", icon: "moon" },
  { id: 6, title: "Active", subtitle: "Bike tour", icon: "bicycle" },
];

const UserHome = () => {
  const router = useRouter();
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [guides, setGuides] = useState<Guide[]>([]);
  const [hotels, setHotels] = useState<Hotel[]>([]);

  const fetchGuideDetails = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        Alert.alert("Error", "No token found, please log in again.");
        setLoading(false);
        return;
      }

      console.log("API Request URL:", `${API_BASE_URL}/guides/details`);
      console.log("Retrieved Token:", token);

      const response = await axios.get(`${API_BASE_URL}/guides/details`, {
        headers: {
          Authorization: `Bearer ${token.trim()}`,
        },
      });

      if (response.data && response.data.guides) {
        const verifiedGuides = response.data.guides.filter((guide: Guide) => guide.isVerified === true);
        setGuides(verifiedGuides);
      } else {
        setGuides([]);
        console.warn("No verified guides found in response.");
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 404) {
          setGuides([]);
          console.warn("No guides found (404).");
        } else {
          console.error("Axios Error:", error.response?.data || error.message);
          Alert.alert(
            "Error",
            error.response?.data?.message || "Failed to fetch guide details."
          );
        }
      } else {
        console.error("Unexpected Error:", error);
        Alert.alert("Error", "An unexpected error occurred.");
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchHotelDetails = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        Alert.alert("Error", "No token found, please log in again.");
        setLoading(false);
        return;
      }

      const response = await axios.get(`${API_BASE_URL}/hotels`, {
        headers: { Authorization: `Bearer ${token.trim()}` },
      });

      if (response.data && response.data.hotels) {
        const verifiedHotels = response.data.hotels.filter((hotel: Hotel) => hotel.isVerified === true);
        setHotels(verifiedHotels);
      } else {
        setHotels([]);
        console.warn("No verified hotels found in response.");
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 404) {
          setHotels([]);
          console.warn("No hotels found (404).");
        } else {
          console.error("Axios Error:", error.response?.data || error.message);
          Alert.alert(
            "Error",
            error.response?.data?.message || "Failed to fetch hotel details."
          );
        }
      } else {
        console.error("Unexpected Error:", error);
        Alert.alert("Error", "An unexpected error occurred.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGuideDetails();
    fetchHotelDetails();
  }, []);

  // Pull-to-refresh functionality
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchGuideDetails();
    await fetchHotelDetails();
    setRefreshing(false);
  }, []);

  return (
    <>
      <StatusBar backgroundColor="#f8fafc" barStyle="dark-content" />
      <View className="flex-1 bg-gray-50">
        {/* Enhanced Header */}
        <View className="bg-white shadow-sm">
          <View className="flex-row items-center justify-between px-4 h-16">
            <View className="flex-row items-center">
              <Image
                source={require("../assets/images/Logo.png")}
                style={{ width: 36, height: 36 }}
                className="rounded-full"
              />
              <Text className="font-bold text-gray-800 text-xl ml-2">GuideNepal</Text>
            </View>
            <TouchableOpacity 
              onPress={() => router.replace("/UserMenu")}
              className="p-2 bg-gray-100 rounded-full"
            >
              <Ionicons name="menu-outline" size={24} color="#374151" />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          className="flex-1"
        >
          {/* Hero Section */}
          <View className="bg-gradient-to-br from-purple-100 to-pink-100 px-4 py-8">
            <View className="items-center">
              <Text className="text-3xl font-bold text-gray-800 text-center leading-tight">
                Discover Amazing{"\n"}
                <Text className="text-purple-600">Travel Experiences</Text>
              </Text>
              <Text className="text-base text-gray-600 text-center mt-3 px-6">
                Find the perfect guide and accommodation for your Nepal adventure
              </Text>
            </View>
            <View className="bg-white rounded-2xl shadow-sm mt-6 p-2 flex-row items-center">
              <View className="flex-1 px-4">
                <Text className="text-base font-medium text-gray-800">
                  Where would you like to go?
                </Text>
              </View>
              <TouchableOpacity
                className="bg-purple-600 py-3 px-4 rounded-xl flex-row items-center"
                onPress={() => router.replace("/UserSearch")}
              >
                <Ionicons name="search" size={20} color="white" />
                <Text className="text-white font-semibold ml-2">Search</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Popular Guides Section */}
          <View className="mt-6 px-4">
            <View className="flex-row justify-between items-center mb-4">
              <View>
                <Text className="text-2xl font-bold text-gray-800">Popular Guides</Text>
                <Text className="text-sm text-gray-600 mt-1">
                  Explore Nepal with experienced local guides
                </Text>
              </View>
            </View>
            
            {guides.length === 0 ? (
              <View className="bg-white rounded-xl p-6 items-center">
                <Ionicons name="people-outline" size={40} color="#9CA3AF" />
                <Text className="text-gray-500 mt-2 text-center">
                  No verified guides available at the moment
                </Text>
              </View>
            ) : (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                className="mt-2"
              >
                {guides.map((guide, index) => {
                  let imageUrl = guide.profileImage;
                  if (imageUrl) {
                    if (!imageUrl.startsWith("http")) {
                      imageUrl = imageUrl.startsWith("/")
                        ? imageUrl.slice(1)
                        : imageUrl;
                      imageUrl = imageUrl.replace("uploads", "guideVerification");
                      imageUrl = `${API_BASE_URL}/${imageUrl}`;
                    }
                  } else {
                    imageUrl = "https://via.placeholder.com/150";
                  }
                  return (
                    <TouchableOpacity
                      key={index}
                      className="mr-4"
                      onPress={() =>
                        router.push({
                          pathname: "/Booking",
                          params: {
                            guideId: guide.id,
                            guideName: guide.name || guide.user?.name || guide.email,
                            guideSpecialization: guide.specialization,
                            guideImage: imageUrl,
                          },
                        })
                      }
                    >
                      <View className="bg-white rounded-xl shadow-sm overflow-hidden w-64">
                        <Image
                          source={{ uri: imageUrl }}
                          className="w-full h-48"
                          onError={(e) => console.log("Guide Image Load Error:", e.nativeEvent.error)}
                        />
                        <View className="p-3">
                          <Text className="text-lg font-semibold text-gray-800">
                            {guide.name || guide.user?.name || guide.email}
                          </Text>
                          <View className="flex-row items-center mt-1">
                            <Ionicons name="location-outline" size={16} color="#6B7280" />
                            <Text className="text-gray-600 text-sm ml-1">
                              {guide.location || "Location not specified"}
                            </Text>
                          </View>
                          <View className="flex-row items-center justify-between mt-2">
                            <Text className="text-purple-600 font-medium">
                              {guide.specialization || "General Guide"}
                            </Text>
                            <View className="bg-green-100 px-2 py-1 rounded-full">
                              <Text className="text-green-700 text-xs font-medium">Verified</Text>
                            </View>
                          </View>
                        </View>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            )}
          </View>

          {/* Popular Hotels Section */}
          <View className="mt-8 px-4">
            <View className="flex-row justify-between items-center mb-4">
              <View>
                <Text className="text-2xl font-bold text-gray-800">Popular Hotels</Text>
                <Text className="text-sm text-gray-600 mt-1">
                  Find comfortable stays for your journey
                </Text>
              </View>
              
            </View>

            {loading ? (
              <View className="items-center py-8">
                <ActivityIndicator size="large" color="#8B5CF6" />
                <Text className="text-gray-600 mt-4">Loading hotels...</Text>
              </View>
            ) : hotels.length === 0 ? (
              <View className="bg-white rounded-xl p-6 items-center">
                <Ionicons name="bed-outline" size={40} color="#9CA3AF" />
                <Text className="text-gray-500 mt-2 text-center">
                  No verified hotels available at the moment
                </Text>
              </View>
            ) : (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                className="mt-2"
              >
                {hotels.map((hotel, index) => {
                  let imageUrl = hotel.profileImage;
                  if (imageUrl) {
                    if (!imageUrl.startsWith("http")) {
                      imageUrl = imageUrl.startsWith("/")
                        ? imageUrl.slice(1)
                        : imageUrl;
                      imageUrl = imageUrl.replace("uploads", "hotelUploads");
                      imageUrl = `${API_BASE_URL}/${imageUrl}`;
                    }
                  } else {
                    imageUrl = "https://via.placeholder.com/300";
                  }
                  return (
                    <TouchableOpacity
                      key={index}
                      className="mr-4"
                      onPress={() =>
                        router.push({
                          pathname: "/SpecificHotel",
                          params: {
                            hotelId: hotel.id,
                            hotelName: hotel.name,
                            hotelLocation: hotel.location,
                            hotelImage: imageUrl,
                            hotelPrice: hotel.price,
                          },
                        })
                      }
                    >
                      <View className="bg-white rounded-xl shadow-sm overflow-hidden w-64">
                        <Image
                          source={{ uri: imageUrl }}
                          className="w-full h-48"
                          onError={(e) => console.log("Hotel Image Load Error:", e.nativeEvent.error)}
                        />
                        <View className="p-3">
                          <Text className="text-lg font-semibold text-gray-800">{hotel.name}</Text>
                          <View className="flex-row items-center mt-1">
                            <Ionicons name="location-outline" size={16} color="#6B7280" />
                            <Text className="text-gray-600 text-sm ml-1">{hotel.location}</Text>
                          </View>
                          <View className="flex-row items-center justify-between mt-2">
                            <Text className="text-purple-600 font-semibold">
                              Rs. {hotel.price.toLocaleString()}
                            </Text>
                            <View className="bg-green-100 px-2 py-1 rounded-full">
                              <Text className="text-green-700 text-xs font-medium">Verified</Text>
                            </View>
                          </View>
                        </View>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            )}
          </View>

          {/* Experiences */}
          <View className="flex-1 bg-white p-4">
            <Text className="text-2xl font-bold text-gray-900">
              Find your{" "}
              <Text className="text-pink-700">perfect experience</Text>
            </Text>
            <Text className="text-green-700 mt-2">
              Discover experiences based on your interest
            </Text>
            <View className="mt-2 px-10 gap-3">
              {experiences.map((exp) => (
                <TouchableOpacity
                  key={exp.id}
                  className="flex-row items-center p-4 border border-gray-200 bg-gray-200 rounded-xl"
                >
                  <Ionicons name={exp.icon as "pizza" | "walk" | "image" | "people" | "moon" | "bicycle"} size={24} color="#d63384" />
                  <View className="ml-4">
                    <Text className="text-pink-700 font-bold">{exp.title}</Text>
                    <Text className="text-gray-700">{exp.subtitle}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Why GuideNepal? */}
          <View className="bg-pink-900 p-6 rounded-2xl mx-4 mt-6 mb-4">
            <View className="flex-row items-center justify-center gap-3 px-4">
              <Image
                source={require("../assets/images/Logo.png")}
                style={{ width: 30, height: 30 }}
              />
              <Text className="font-bold text-white text-xl">GuideNepal</Text>
            </View>
            <Text className="text-center text-white text-lg font-semibold mt-2">
              Why you should book a{" "}
              <Text className="text-white font-bold">GuideNepal</Text>
            </Text>
            <View className="mt-6 space-y-6">
              <View className="flex items-center">
                <View className="bg-white rounded-full">
                  <Image
                    source={require("../assets/icons/magic.png")}
                    style={{ width: 30, height: 30 }}
                  />
                </View>
                <Text className="text-yellow-400 font-bold text-lg mt-2">
                  100% Customizable
                </Text>
                <Text className="text-white text-center px-8">
                  Let your local host tailor the tour completely to your wishes.
                </Text>
              </View>
              <View className="flex items-center mt-6">
                <Image
                  source={require("../assets/icons/guide.png")}
                  style={{ width: 30, height: 30 }}
                />
                <Text className="text-yellow-400 font-bold text-lg mt-2">
                  Private guided tours
                </Text>
                <Text className="text-white text-center px-8">
                  No strangers on your tour. It's just you and your local host.
                </Text>
              </View>
              <View className="flex items-center mt-6">
                <Image
                  source={require("../assets/icons/eco.png")}
                  style={{ width: 30, height: 30 }}
                />
                <Text className="text-yellow-400 font-bold text-lg mt-2">
                  Responsible
                </Text>
                <Text className="text-white text-center px-8">
                  Our tours are designed with people, places & the planet in
                  mind.
                </Text>
              </View>
            </View>
          </View>

          {/* Contact Section */}
          <View className="bg-white p-6 rounded-2xl mx-4 mb-4 shadow-sm">
            <Text className="text-2xl font-bold text-gray-800 text-center">
              Contact Us
            </Text>
            <Text className="text-gray-600 text-center mt-2">
              Have questions? We're here to help!
            </Text>
            
            <View className="mt-6 space-y-4">
              <TouchableOpacity className="flex-row items-center bg-gray-50 p-4 rounded-xl">
                <View className="bg-purple-100 p-3 rounded-full">
                  <Ionicons name="mail-outline" size={24} color="#8B5CF6" />
                </View>
                <View className="ml-4">
                  <Text className="text-gray-800 font-semibold">Email Us</Text>
                  <Text className="text-gray-600">support@guidenepal.com</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity className="flex-row items-center bg-gray-50 p-4 rounded-xl">
                <View className="bg-purple-100 p-3 rounded-full">
                  <Ionicons name="call-outline" size={24} color="#8B5CF6" />
                </View>
                <View className="ml-4">
                  <Text className="text-gray-800 font-semibold">Call Us</Text>
                  <Text className="text-gray-600">+977 9816358025</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity className="flex-row items-center bg-gray-50 p-4 rounded-xl">
                <View className="bg-purple-100 p-3 rounded-full">
                  <Ionicons name="location-outline" size={24} color="#8B5CF6" />
                </View>
                <View className="ml-4">
                  <Text className="text-gray-800 font-semibold">Visit Us</Text>
                  <Text className="text-gray-600">Kathmandu, Nepal</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity className="flex-row items-center bg-gray-50 p-4 rounded-xl">
                <View className="bg-purple-100 p-3 rounded-full">
                  <Ionicons name="time-outline" size={24} color="#8B5CF6" />
                </View>
                <View className="ml-4">
                  <Text className="text-gray-800 font-semibold">Working Hours</Text>
                  <Text className="text-gray-600">24/7 Customer Support</Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>

        {/* Chat Icon */}
        <TouchableOpacity
          className="absolute bottom-24 right-4 bg-white p-3 rounded-full shadow-lg"
          onPress={() => router.replace("/Chatbot")}
        >
          <Ionicons
            name="chatbubble-ellipses-outline"
            size={30}
            color="#d63384"
          />
        </TouchableOpacity>

        {/* Bottom Navigation */}
        <UserNavigation />
      </View>
    </>
  );
};

export default UserHome;
