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
import AsyncStorage from "@react-native-async-storage/async-storage";

interface Guide {
  id: string;
  name: string;
  email: string;
  specialization: string;
  profileImage: string;
  verificationImage: string;
  verified: boolean;
  user: {
    name: string;
    email: string;
  };
  isVerified: boolean;
}

interface Hotel {
  id: string;
  name: string;
  location: string;
  hotelProfile: string;
  certificate: string;
  verified: boolean;
  totalRooms: number;
  price: number;
  isVerified: boolean;
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
  const [imageModalVisible, setImageModalVisible] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Get the authentication token from AsyncStorage
      const token = await AsyncStorage.getItem("token");
      
      if (!token) {
        Alert.alert("Error", "Authentication token not found. Please log in again.");
        router.replace("/LoginScreen");
        return;
      }
      
      // Set up the authorization header
      const config = {
        headers: {
          Authorization: `Bearer ${token}`
        }
      };

      const guidesResponse = await axios.get(`${API_BASE_URL}/guides/all`, config);

      const hotelsResponse = await axios.get(`${API_BASE_URL}/hotels/all`, config);

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
      const token = await AsyncStorage.getItem("token");
      
      if (!token) {
        Alert.alert("Error", "Authentication token not found. Please log in again.");
        router.replace("/LoginScreen");
        return;
      }
      
      const config = {
        headers: {
          Authorization: `Bearer ${token}`
        }
      };
      
      const response = await axios.post(`${API_BASE_URL}/admin/verify-guide/${guideId}`, {}, config);
      
      if (response.data.success) {
        Alert.alert("Success", "Guide verified successfully");
        // Update the local state to reflect the verification
        setGuides(guides.map(guide => 
          guide.id === guideId 
            ? { ...guide, isVerified: true }
            : guide
        ));
      }
    } catch (error: any) {
      console.error("Error verifying guide:", error.response?.data || error.message);
      Alert.alert("Error", error.response?.data?.error || "Failed to verify guide");
    }
  };

  const handleVerifyHotel = async (hotelId: string) => {
    try {
      const token = await AsyncStorage.getItem("token");
      
      if (!token) {
        Alert.alert("Error", "Authentication token not found. Please log in again.");
        router.replace("/LoginScreen");
        return;
      }
      
      const config = {
        headers: {
          Authorization: `Bearer ${token}`
        }
      };
      
      const response = await axios.post(`${API_BASE_URL}/admin/verify-hotel/${hotelId}`, {}, config);
      
      if (response.data.success) {
        Alert.alert("Success", "Hotel verified successfully");
        // Update the local state to reflect the verification
        setHotels(hotels.map(hotel => 
          hotel.id === hotelId 
            ? { ...hotel, isVerified: true }
            : hotel
        ));
      }
    } catch (error: any) {
      console.error("Error verifying hotel:", error.response?.data || error.message);
      Alert.alert("Error", error.response?.data?.error || "Failed to verify hotel");
    }
  };

  const handleLogout = async () => {
    try {
      // Clear the authentication token from AsyncStorage
      await AsyncStorage.removeItem("token");
      
      // Show a success message
      Alert.alert("Success", "You have been logged out successfully");
      
      // Navigate to the login screen
      router.replace("/LoginScreen");
    } catch (error) {
      console.error("Error during logout:", error);
      Alert.alert("Error", "Failed to log out. Please try again.");
    }
  };

  const renderGuideItem = ({ item }: { item: Guide }) => (
    <View className="bg-white p-4 m-2 rounded-lg shadow-sm">
      <View className="flex-row items-center">
        <Image
          source={{
            uri: (() => {
              let imageUrl = item.profileImage;
              if (imageUrl) {
                if (!imageUrl.startsWith("http")) {
                  imageUrl = imageUrl.startsWith("/") ? imageUrl.slice(1) : imageUrl;
                  imageUrl = imageUrl.replace("uploads", "guideVerification");
                  imageUrl = `${API_BASE_URL}/${imageUrl}`;
                }
              } else {
                imageUrl = "https://via.placeholder.com/150";
              }
              return imageUrl;
            })(),
          }}
          className="w-20 h-20 rounded-lg"
        />
        <View className="ml-4 flex-1">
          <Text className="text-lg font-bold">{item.name}</Text>
          <Text className="text-gray-600">{item.email}</Text>
          <Text className="text-gray-600">{item.specialization}</Text>
          <View className="flex-row justify-between items-center mt-2">
            <Text
              className={`${
                item.isVerified ? "text-green-600" : "text-yellow-600"
              } font-semibold`}
            >
              {item.isVerified ? "Verified" : "Pending Verification"}
            </Text>
            {!item.isVerified && (
              <TouchableOpacity
                onPress={() => handleVerifyGuide(item.id)}
                className="bg-green-500 px-4 py-2 rounded-md"
              >
                <Text className="text-white font-semibold">Verify</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
      
      {item.verificationImage && (
        <TouchableOpacity
          onPress={() => {
            setSelectedImage(item.verificationImage);
            setImageModalVisible(true);
          }}
          className="mt-3 bg-blue-500 py-2 px-4 rounded-md flex-row items-center justify-center"
        >
          <Ionicons name="eye" size={20} color="white" />
          <Text className="text-white font-semibold ml-2">View Verification Image</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const renderHotelItem = ({ item }: { item: Hotel }) => {
    const imageUrl = item.profileImage 
      ? (item.profileImage.startsWith("http") 
          ? item.profileImage 
          : `${API_BASE_URL}/${item.profileImage.replace("uploads", "hotelUploads").replace(/^\//, "")}`)
      : "https://via.placeholder.com/150";

    return (
      <View className="bg-white p-4 m-2 rounded-lg shadow-sm">
        <View className="flex-row items-center">
          <Image
            source={{ uri: imageUrl }}
            className="w-20 h-20 rounded-lg"
          />
          <View className="ml-4 flex-1">
            <Text className="text-lg font-bold">{item.name}</Text>
            <Text className="text-gray-600">{item.location}</Text>
            <Text className="text-gray-600">Total Rooms: {item.totalRooms}</Text>
            <Text className="text-gray-600">Price: Rs. {item.price}</Text>
            <View className="flex-row justify-between items-center mt-2">
              <Text
                className={`${
                  item.isVerified ? "text-green-600" : "text-yellow-600"
                } font-semibold`}
              >
                {item.isVerified ? "Verified" : "Pending Verification"}
              </Text>
              {!item.isVerified && (
                <TouchableOpacity
                  onPress={() => handleVerifyHotel(item.id)}
                  className="bg-green-500 px-4 py-2 rounded-md"
                >
                  <Text className="text-white font-semibold">Verify</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
        
        {item.certificate && (
          <TouchableOpacity
            onPress={() => {
              setSelectedImage(item.certificate);
              setImageModalVisible(true);
            }}
            className="mt-3 bg-blue-500 py-2 px-4 rounded-md flex-row items-center justify-center"
          >
            <Ionicons name="eye" size={20} color="white" />
            <Text className="text-white font-semibold ml-2">View Certificate</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

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
        <Text className="text-xl font-bold">Admin Dashboard</Text>
        <TouchableOpacity 
          onPress={handleLogout}
          className="bg-red-500 px-4 py-2 rounded-lg flex-row items-center"
        >
          <Text className="text-white font-semibold ml-2">Logout</Text>
        </TouchableOpacity>
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
        visible={imageModalVisible}
        transparent={true}
        onRequestClose={() => setImageModalVisible(false)}
      >
        <TouchableOpacity
          style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.9)" }}
          onPress={() => setImageModalVisible(false)}
        >
          <View className="flex-1 justify-center items-center">
            <Image
              source={{
                uri: (() => {
                  let imageUrl = selectedImage;
                  if (imageUrl) {
                    if (!imageUrl.startsWith("http")) {
                      imageUrl = imageUrl.startsWith("/") ? imageUrl.slice(1) : imageUrl;
                      imageUrl = imageUrl.replace(
                        "uploads",
                        selectedTab === "guides" ? "guideVerification" : "hotelVerification"
                      );
                      imageUrl = `${API_BASE_URL}/${imageUrl}`;
                    }
                  }
                  return imageUrl;
                })(),
              }}
              className="w-full h-full"
              resizeMode="contain"
            />
            <TouchableOpacity
              className="absolute top-10 right-10"
              onPress={() => setImageModalVisible(false)}
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