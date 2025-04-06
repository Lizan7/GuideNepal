import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  Alert,
  Modal,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import axios from "axios";
import API_BASE_URL from "@/config";

interface Guide {
  id: string;
  name: string;
  email: string;
  specialization: string;
  profileImage: string;
  verified: boolean;
  user: {
    name: string;
    email: string;
  };
}

interface Hotel {
  id: string;
  name: string;
  location: string;
  hotelProfile: string;
  verified: boolean;
  totalRooms: number;
  price: number;
}

// Add a union type for the list items
type ListItem = Guide | Hotel;

const Admin = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [guides, setGuides] = useState<Guide[]>([]);
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedTab, setSelectedTab] = useState("guides"); // "guides" or "hotels"

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);

      console.log("🔹 Fetching guides data...");
      const guidesResponse = await axios.get(`${API_BASE_URL}/guides/all`);
      console.log("🔹 Guides Response:", guidesResponse.data);

      console.log("🔹 Fetching hotels data...");
      const hotelsResponse = await axios.get(`${API_BASE_URL}/hotels/all`);
      console.log("🔹 Hotels Response:", hotelsResponse.data);

      // Check if the responses have the expected data structure
      if (guidesResponse.data?.success && Array.isArray(guidesResponse.data.guides)) {
        console.log("🔹 Setting guides:", guidesResponse.data.guides.length, "guides found");
        setGuides(guidesResponse.data.guides);
      } else {
        console.error("❌ Unexpected guide data structure:", guidesResponse.data);
        Alert.alert("Error", "Failed to fetch guide data");
      }

      if (hotelsResponse.data?.success && Array.isArray(hotelsResponse.data.hotels)) {
        console.log("🔹 Setting hotels:", hotelsResponse.data.hotels.length, "hotels found");
        setHotels(hotelsResponse.data.hotels);
      } else {
        console.error("❌ Unexpected hotel data structure:", hotelsResponse.data);
        Alert.alert("Error", "Failed to fetch hotel data");
      }
    } catch (error: any) {
      console.error("❌ Error fetching data:", error.response?.data || error.message);
      Alert.alert("Error", "Failed to fetch data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyGuide = async (guideId: string) => {
    try {
      await axios.post(`${API_BASE_URL}/admin/verify-guide/${guideId}`);
      Alert.alert("Success", "Guide verified successfully");
      fetchData(); // Refresh data
    } catch (error) {
      console.error("Error verifying guide:", error);
      Alert.alert("Error", "Failed to verify guide");
    }
  };

  const handleVerifyHotel = async (hotelId: string) => {
    try {
      await axios.post(`${API_BASE_URL}/admin/verify-hotel/${hotelId}`);
      Alert.alert("Success", "Hotel verified successfully");
      fetchData(); // Refresh data
    } catch (error) {
      console.error("Error verifying hotel:", error);
      Alert.alert("Error", "Failed to verify hotel");
    }
  };

  const renderGuideItem = ({ item }: { item: Guide }) => (
    <View className="bg-white p-4 m-2 rounded-lg shadow-sm">
      <TouchableOpacity
        onPress={() => setSelectedImage(item.profileImage)}
        className="items-center"
      >
        <Image
          source={{
            uri: item.profileImage
              ? `${API_BASE_URL}/guideVerification/${item.profileImage}`
              : "https://via.placeholder.com/150",
          }}
          className="w-20 h-20 rounded-lg"
        />
      </TouchableOpacity>
      <Text className="text-lg font-bold mt-2">{item.name}</Text>
      <Text className="text-gray-600">{item.email}</Text>
      <Text className="text-gray-600">{item.specialization}</Text>
      <View className="flex-row justify-between items-center mt-2">
        <Text
          className={`${
            item.verified ? "text-green-600" : "text-yellow-600"
          } font-semibold`}
        >
          {item.verified ? "Verified" : "Pending Verification"}
        </Text>
        {!item.verified && (
          <TouchableOpacity
            onPress={() => handleVerifyGuide(item.id)}
            className="bg-green-500 px-4 py-2 rounded-md"
          >
            <Text className="text-white font-semibold">Verify</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  const renderHotelItem = ({ item }: { item: Hotel }) => (
    <View className="bg-white p-4 m-2 rounded-lg shadow-sm">
      <TouchableOpacity
        onPress={() => setSelectedImage(item.hotelProfile)}
        className="items-center"
      >
        <Image
          source={{
            uri: item.hotelProfile
              ? `${API_BASE_URL}/hotelUploads/${item.hotelProfile}`
              : "https://via.placeholder.com/150",
          }}
          className="w-20 h-20 rounded-lg"
        />
      </TouchableOpacity>
      <Text className="text-lg font-bold mt-2">{item.name}</Text>
      <Text className="text-gray-600">{item.location}</Text>
      <Text className="text-gray-600">Total Rooms: {item.totalRooms}</Text>
      <Text className="text-gray-600">Price: Rs. {item.price}</Text>
      <View className="flex-row justify-between items-center mt-2">
        <Text
          className={`${
            item.verified ? "text-green-600" : "text-yellow-600"
          } font-semibold`}
        >
          {item.verified ? "Verified" : "Pending Verification"}
        </Text>
        {!item.verified && (
          <TouchableOpacity
            onPress={() => handleVerifyHotel(item.id)}
            className="bg-green-500 px-4 py-2 rounded-md"
          >
            <Text className="text-white font-semibold">Verify</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  // Update the renderItem function to handle all types
  const renderItem = ({ item }: { item: ListItem }) => {
    if ('specialization' in item) {
      return renderGuideItem({ item: item as Guide });
    } else {
      return renderHotelItem({ item: item as Hotel });
    }
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-100">
      {/* Header */}
      <View className="bg-white p-4 flex-row items-center justify-between">
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text className="text-xl font-bold">Admin Dashboard</Text>
      </View>

      {/* Tab Navigation */}
      <View className="flex-row bg-white p-2">
        <TouchableOpacity
          className={`flex-1 p-2 rounded-lg mx-2 ${
            selectedTab === "guides" ? "bg-blue-500" : "bg-gray-200"
          }`}
          onPress={() => setSelectedTab("guides")}
        >
          <Text
            className={`text-center font-semibold ${
              selectedTab === "guides" ? "text-white" : "text-gray-700"
            }`}
          >
            Guides
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          className={`flex-1 p-2 rounded-lg ${
            selectedTab === "hotels" ? "bg-blue-500" : "bg-gray-200"
          }`}
          onPress={() => setSelectedTab("hotels")}
        >
          <Text
            className={`text-center font-semibold ${
              selectedTab === "hotels" ? "text-white" : "text-gray-700"
            }`}
          >
            Hotels
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <FlatList<ListItem>
        data={selectedTab === "guides" ? guides : hotels}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        className="flex-1"
      />

      {/* Image Modal */}
      <Modal
        visible={!!selectedImage}
        transparent={true}
        onRequestClose={() => setSelectedImage(null)}
      >
        <TouchableOpacity
          style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.9)" }}
          onPress={() => setSelectedImage(null)}
        >
          <View className="flex-1 justify-center items-center">
            <Image
              source={{
                uri: selectedImage
                  ? `${API_BASE_URL}/${
                      selectedTab === "guides"
                        ? "guideVerification"
                        : "hotelUploads"
                    }/${selectedImage}`
                  : "",
              }}
              className="w-full h-full"
              resizeMode="contain"
            />
            <TouchableOpacity
              className="absolute top-10 right-10"
              onPress={() => setSelectedImage(null)}
            >
              <Ionicons name="close-circle" size={40} color="white" />
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

export default Admin;