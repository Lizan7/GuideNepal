import React, {
  useState,
  useRef,
  useMemo,
  useEffect,
  useCallback,
} from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  Alert,
  RefreshControl,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import BottomSheet from "@gorhom/bottom-sheet";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import API_BASE_URL from "@/config";

const GuideProfile = () => {
  const router = useRouter();
  const bottomSheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ["50%"], []);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const [guideDetails, setGuideDetails] = useState({
    email: "",
    location: "",
    phoneNumber: "",
    specialization: "",
    profileImage: "",
    verificationImage: "",
    isVerified: false,
  });

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

      if (response.data) {
        setGuideDetails({
          email: response.data.user?.email || "N/A",
          location: response.data.location || "N/A",
          phoneNumber: response.data.phoneNumber || "N/A",
          specialization: response.data.specialization || "N/A",
          profileImage: response.data.profileImage
            ? `${API_BASE_URL}${response.data.profileImage}`
            : "",
          verificationImage: response.data.verificationImage
            ? `${API_BASE_URL}${response.data.verificationImage}`
            : "",
          isVerified: response.data.isVerified,
        });
      } else {
        console.warn("No guide details found in response.");
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

  useEffect(() => {
    fetchGuideDetails();
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchGuideDetails();
    setRefreshing(false);
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        className="flex-1 bg-gray-100"
      >
        <View className="flex-row items-center p-4 bg-[#3B82F6] gap-4">
          <TouchableOpacity onPress={() => router.replace("/GuideHome")}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text className="font-bold text-lg text-white">Profile</Text>
        </View>

        {loading ? (
          <View className="flex-1 justify-center items-center">
            <ActivityIndicator size="large" color="#3B82F6" />
          </View>
        ) : (
          <View className="bg-white py-6 rounded-lg">
            <View className="justify-center items-center">
              {guideDetails.profileImage ? (
                <Image
                  source={{ uri: guideDetails.profileImage }}
                  className="w-32 h-32 rounded-full"
                />
              ) : (
                <View className="w-24 h-24 rounded-full bg-gray-300 items-center justify-center">
                  <Ionicons name="camera-outline" size={40} color="white" />
                </View>
              )}
              <Text className="text-xl font-bold mt-4">
                {guideDetails.email}
              </Text>
            </View>

            <View className="mt-10 w-fit flex gap-16">
              <View className="flex-row gap-20 justify-around">
                <Text>Email</Text>
                <Text className="text-gray-600">{guideDetails.email}</Text>
              </View>
              <View className="flex-row gap-20 justify-around">
                <Text>Address</Text>
                <Text className="text-gray-600">{guideDetails.location}</Text>
              </View>
              <View className="flex-row gap-20 justify-around">
                <Text>Contact</Text>
                <Text className="text-gray-600">
                  {guideDetails.phoneNumber}
                </Text>
              </View>
              <View className="flex-row gap-20 justify-around">
                <Text>Speciality</Text>
                <Text className="text-gray-600">
                  {guideDetails.specialization}
                </Text>
              </View>
              <View className="flex-row gap-20 justify-around">
                <Text>Status</Text>
                <Text className="text-gray-600">
                  {guideDetails.isVerified ? "Verified" : "Unverified"}
                </Text>
              </View>
            </View>

            {/* Verify Button */}
            <TouchableOpacity
              className="bg-blue-500 px-6 py-3 rounded-lg mt-14 w-[310px] ml-12"
              onPress={() => router.push("./guideRegister")}
            >
              <Text className="text-white font-semibold text-center">
                Verify
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </GestureHandlerRootView>
  );
};

export default GuideProfile;
