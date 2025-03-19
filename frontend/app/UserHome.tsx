import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import API_BASE_URL from "@/config";

interface Guide {
  id: number;
  email: string;
  location: string;
  phoneNumber: string;
  specialization: string;
  profileImage: string;
  verificationImage: string;
  isVerified: boolean;
}

interface Hotel {
  id: number;
  name: string;
  location: string;
  hotelProfile: string;
  price: number;
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

      console.log("Response Status:", response.status);
      console.log("Response Data:", response.data);
      console.log("Response Headers:", response.headers);

      if (response.data && response.data.guides) {
        setGuides(response.data.guides);
      } else {
        console.warn("No guides found in response.");
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error("Axios Error:", error.response?.data || error.message);
        Alert.alert(
          "Error",
          error.response?.data?.message || "Failed to fetch guide details."
        );
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

      const response = await axios.get(`${API_BASE_URL}/hotels/hotelDetails`, {
        headers: { Authorization: `Bearer ${token.trim()}` },
      });

      if (response.data && response.data.hotels) {
        setHotels(response.data.hotels);
      } else {
        console.warn("No hotels found in response.");
      }
    } catch (error) {
      console.error("Error fetching hotel details:", error);
      Alert.alert("Error", "Failed to fetch hotel details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGuideDetails();
    fetchHotelDetails();
  }, []);

  // Pull-to-refresh
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchGuideDetails();
    await fetchHotelDetails();
    setRefreshing(false);
  }, []);

  return (
    <View className="flex-1 bg-white">
      {/* Main container */}
      <View className="flex-1">
        {/* Header */}
        <View className="flex-row items-center gap-2 bg-gray-200 h-16">
          <Image
            source={require("../assets/images/Logo.png")}
            style={{ width: 40, height: 40 }}
            className="m-4"
          />
          <Text className="font-bold text-gray-800 text-xl">GuideNepal</Text>
        </View>

        <ScrollView
          vertical
          showsVerticalScrollIndicator={false}
          className="mb-16"
        >
          {/* Main section */}
          <View className="bg-lime-200 w-full px-4 h-60">
            <View className="items-center mt-5">
              <Text className="text-3xl font-extrabold text-slate-700 text-center">
                Enchanting experiences,{" "}
                <Text className="text-3xl text-pink-700">
                  incredible guides
                </Text>
              </Text>
            </View>
            <View className="items-center mt-3">
              <Text className="text-lg font-semibold text-center text-slate-700 px-8">
                Hire guides and book hotels to make your experience worthy
              </Text>
            </View>
            <View className="w-[300px] h-18 bg-white rounded-full mt-5 ml-8 flex-row items-center justify-center">
              <Text className="px-6 py-3 text-lg font-medium text-zinc-500">
                Where are you going?
              </Text>
              <TouchableOpacity
                className="bg-pink-700 py-3 px-3 rounded-full justify-center"
                onPress={() => router.replace("/UserSearch")}
              >
                <View className="flex-row items-center gap-3">
                  <Ionicons name="search" size={15} color="white" />
                  <Text className="text-white text-center font-semibold">
                    Search
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>

          {/* Featured Guides */}
          <View className="px-4 mt-1">
            <Text className="text-2xl font-semibold text-gray-900 mt-6">
              Popular Guides
            </Text>
            <Text className="text-lg font-semibold text-green-900">
              Take a tour of the hidden places of Nepal with our experienced
              guides
            </Text>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="mt-3"
          >
            {guides.map((guide, index) => {
              const imageUrl =
                `${API_BASE_URL}/guideVerification/${guide.profileImage}`.replace(
                  /([^:]\/)\/+/g,
                  "$1"
                );

              console.log("✅ Final Image URL:", imageUrl);

              return (
                <TouchableOpacity
                  key={index}
                  className="ml-4"
                  onPress={() =>
                    router.push({
                      pathname: "/Booking",
                      params: {
                        guideId: guide.id,
                        guideEmail: guide.email,
                        guideSpecialization: guide.specialization,
                        guideImage: imageUrl,
                      },
                    })
                  }
                >
                  <Image
                    source={{ uri: imageUrl }}
                    style={{ width: 150, height: 150, borderRadius: 10 }}
                    onError={(e) =>
                      console.log("Image Load Error:", e.nativeEvent.error)
                    }
                  />
                  <Text className="font-semibold mt-2">{guide.email}</Text>
                  <Text className="text-gray-500 text-sm">
                    {guide.specialization}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          <ScrollView
            vertical
            showsVerticalScrollIndicator={false}
            className="mb-16"
          >
            {/* Popular Hotels Section */}
            <View className="px-4 mt-3">
              <Text className="text-2xl font-semibold text-gray-900 mt-6">
                Popular Hotels
              </Text>
              <Text className="text-lg font-semibold text-green-900">
                Make your travel smooth by booking rooms
              </Text>
              {loading ? (
                <ActivityIndicator
                  size="large"
                  color="#00CC66"
                  className="mt-4"
                />
              ) : hotels.length === 0 ? (
                <Text className="text-gray-500 mt-4">No hotels available.</Text>
              ) : (
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  className="mt-3"
                >
                  {hotels.map((hotel, index) => {
                    const imageUrl = `${API_BASE_URL}/hotelUploads/${hotel.hotelProfile}`;
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
                        <Image
                          source={{ uri: imageUrl }}
                          className="w-60 h-64 rounded-xl mr-4"
                          onError={(e) =>
                            console.log(
                              "Image Load Error:",
                              e.nativeEvent.error
                            )
                          }
                        />
                        <View>
                          <Text className="font-semibold mt-3">
                            {hotel.name}
                          </Text>
                          <Text className="text-gray-500 text-sm">
                            {hotel.location}
                          </Text>
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              )}
            </View>
          </ScrollView>

          {/* Experiences */}
          <View className="flex-1 bg-white p-4 mt-3">
            <Text className="text-2xl font-bold text-gray-900">
              Find your{" "}
              <Text className="text-pink-700">perfect experience</Text>
            </Text>
            <Text className="text-green-700 mt-2">
              Discover experiences based on your interest
            </Text>

            {/* Experience Categories */}
            <View className="mt-6 px-10 gap-3">
              {experiences.map((exp) => (
                <TouchableOpacity
                  key={exp.id}
                  className="flex-row items-center p-4 border border-gray-200 bg-gray-200 rounded-xl"
                >
                  <Ionicons name={exp.icon} size={24} color="#d63384" />
                  <View className="ml-4">
                    <Text className="text-pink-700 font-bold">{exp.title}</Text>
                    <Text className="text-gray-700">{exp.subtitle}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Why GuideNepal? */}
          <View className="bg-pink-900 p-6 rounded-2xl mx-4 mt-6">
            {/* Header */}
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

            {/* Features */}
            <View className="mt-6 space-y-6">
              {/* Customizable */}
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

              {/* Private Guided Tours */}
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

              {/* Responsible */}
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
        </ScrollView>

        {/* Bottom Navigation */}
        <View className="absolute bottom-0 left-0 right-0 bg-white flex-row justify-around p-4 border-t border-gray-200">
          <View className="items-center">
            <TouchableOpacity onPress={() => router.replace("/UserHome")}>
              <Ionicons name="home" size={20} color="purple" />
            </TouchableOpacity>
            <Text className="text-purple-700">Explore</Text>
          </View>
          <View className="items-center">
            <TouchableOpacity onPress={() => router.replace("/UserBooking")}>
              <Ionicons name="ticket-outline" size={20} color="gray" />
            </TouchableOpacity>
            <Text className="text-gray-500">Booking</Text>
          </View>
          <View className="items-center">
            <TouchableOpacity onPress={() => router.replace("/UserChat")}>
              <Ionicons
                name="chatbubble-ellipses-outline"
                size={20}
                color="gray"
              />
            </TouchableOpacity>
            <Text className="text-gray-500">Chat</Text>
          </View>
          <View className="items-center">
            <TouchableOpacity onPress={() => router.replace("/UserMenu")}>
              <Ionicons name="menu-outline" size={20} color="gray" />
            </TouchableOpacity>
            <Text className="text-gray-500">Menu</Text>
          </View>
        </View>

        {/* Floating Gemini Chat Icon */}
        <TouchableOpacity
          className="absolute bottom-24 right-4 bg-white p-3 rounded-full shadow-lg"
          onPress={() => router.replace("/GeminiChat")}
        >
          <Ionicons
            name="chatbubble-ellipses-outline"
            size={30}
            color="#d63384"
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default UserHome;
