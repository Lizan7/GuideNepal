import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import UserNavigation from "@/components/UserNavigation";
import API_BASE_URL from "../config";

interface Package {
  id: string;
  title: string;
  description: string;
  duration: number;
  maxPeople: number;
  currentEnrollments: number;
  locations: string[];
  price: number;
  image: string;
  guide: {
    id: string;
    name: string;
    user: {
      name: string;
      email: string;
    };
  };
  isFulfilled: boolean;
}

const UserPackage = () => {
  const router = useRouter();
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [enrolledPackages, setEnrolledPackages] = useState<string[]>([]);

  const fetchPackages = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/package`);
      if (response.data.success) {
        setPackages(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching packages:", error);
      Alert.alert("Error", "Failed to fetch packages");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchEnrolledPackages = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) return;

      const response = await axios.get(`${API_BASE_URL}/package/enrolled`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.data.success) {
        setEnrolledPackages(response.data.data.map((pkg: Package) => pkg.id));
      }
    } catch (error) {
      console.error("Error fetching enrolled packages:", error);
    }
  };

  const handleEnroll = async (packageId: string) => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        Alert.alert("Error", "Please login to enroll in packages");
        router.replace("/LoginScreen");
        return;
      }

      const selectedPackage = packages.find((pkg) => pkg.id === packageId);
      if (!selectedPackage) return;

      if (selectedPackage.isFulfilled) {
        Alert.alert("Sorry", "This package is already full");
        return;
      }

      const response = await axios.post(
        `${API_BASE_URL}/package/${packageId}/enroll`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.success) {
        Alert.alert("Success", "Successfully enrolled in the package!");
        fetchPackages();
        fetchEnrolledPackages();
      }
    } catch (error: any) {
      console.error("Error enrolling in package:", error);
      Alert.alert(
        "Error",
        error.response?.data?.message || "Failed to enroll in package"
      );
    }
  };

  useEffect(() => {
    fetchPackages();
    fetchEnrolledPackages();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchPackages();
    fetchEnrolledPackages();
  };

  const renderPackageCard = (pkg: Package) => {
    const isEnrolled = enrolledPackages.includes(pkg.id);
    
    const getImagePath = (path: string | undefined) => {
      if (!path) return "https://via.placeholder.com/150";
      
      const cleanPath = path.replace(/^\/+/, '').replace(/^uploads\//, '');
      
      return `${API_BASE_URL}/packageUploads/${cleanPath}`;
    };
    
    const imageUrl = getImagePath(pkg.image);

    return (
      <View
        key={pkg.id}
        className="bg-white rounded-lg shadow-sm mb-4 overflow-hidden"
      >
        <Image
          source={{ uri: imageUrl }}
          className="w-full h-40"
          resizeMode="cover"
        />
        <View className="p-4">
          <View className="flex-row justify-between items-center mb-2">
            <Text className="text-lg font-semibold text-gray-800">
              {pkg.title}
            </Text>
            <Text className="text-purple-600 font-bold">
              Rs. {pkg.price.toLocaleString()}
            </Text>
          </View>

          <Text className="text-gray-600 mb-2" numberOfLines={2}>
            {pkg.description}
          </Text>

          <View className="flex-row items-center mb-2">
            <Ionicons name="time-outline" size={16} color="#6B7280" />
            <Text className="text-gray-600 ml-1">{pkg.duration} days</Text>
            <View className="mx-2">
              <Text className="text-gray-600">•</Text>
            </View>
            <Ionicons name="people-outline" size={16} color="#6B7280" />
            <Text className="text-gray-600 ml-1">
              {pkg.currentEnrollments}/{pkg.maxPeople} enrolled
            </Text>
          </View>

          <View className="flex-row items-center mb-3">
            <Ionicons name="location-outline" size={16} color="#6B7280" />
            <Text className="text-gray-600 ml-1">
              {pkg.locations.join(", ")}
            </Text>
          </View>

          <View className="flex-row justify-between items-center">
            <Text className="text-sm text-gray-500">
              Guide: {pkg.guide.user.name}
            </Text>
            {pkg.isFulfilled ? (
              <View className="bg-red-100 px-3 py-1 rounded-full">
                <Text className="text-red-600 text-sm">Fully Booked</Text>
              </View>
            ) : isEnrolled ? (
              <View className="bg-green-100 px-3 py-1 rounded-full">
                <Text className="text-green-600 text-sm">Enrolled</Text>
              </View>
            ) : (
              <TouchableOpacity
                onPress={() => handleEnroll(pkg.id)}
                className="bg-purple-600 px-4 py-2 rounded-lg"
              >
                <Text className="text-white font-semibold">Enroll Now</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <ActivityIndicator size="large" color="#9333EA" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      <View className="px-4 py-4 flex-row items-center">
          <TouchableOpacity 
            onPress={() => router.replace("/UserHome")}
            className="p-2 -ml-2"
          >
            <Ionicons name="chevron-back-outline" size={24} color="#374151" />
          </TouchableOpacity>
          <Text className="text-xl font-bold text-gray-800">Group Packages</Text>
      </View>

      <ScrollView
        className="flex-1 px-4 pt-4"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {packages.length === 0 ? (
          <View className="flex-1 justify-center items-center py-8">
            <Ionicons name="cube-outline" size={48} color="#9CA3AF" />
            <Text className="text-gray-500 text-lg mt-2">
              No packages available
            </Text>
          </View>
        ) : (
          packages.map(renderPackageCard)
        )}
      </ScrollView>

      <UserNavigation />
    </View>
  );
};

export default UserPackage;
