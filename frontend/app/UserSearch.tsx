import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Image,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import API_BASE_URL from "@/config";

// Define interfaces for guides and hotels
interface Guide {
  id: number;
  name: string;
  specialization: string;
  location: string;
  phoneNumber: string;
  email: string;
  charge: number;
  description: string;
  guideProfile?: string;
}

interface Hotel {
  id: number;
  name: string;
  location: string;
  phoneNumber: string;
  email: string;
  price: number;
  totalRooms: number;
  description: string;
  hotelProfile?: string;
}

interface Location {
  id: number;
  name: string;
  count: number;
}

const UserSearch = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTab, setSelectedTab] = useState("Local Guides");
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  const [guides, setGuides] = useState<Guide[]>([]);
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingLocations, setLoadingLocations] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Fetch all locations with guides and hotels
  useEffect(() => {
    fetchLocations();
  }, [selectedTab]);

  const fetchLocations = async () => {
    try {
      setLoadingLocations(true);
      setError(null);
      
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        Alert.alert("Error", "Authentication failed. Please log in again.");
        return;
      }
      
      // Fetch locations based on selected tab
      if (selectedTab === "Local Guides") {
        const response = await axios.get(`${API_BASE_URL}/guides/locations`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (response.data && response.data.locations) {
          // Transform the data to include id
          const formattedLocations = response.data.locations.map((loc: any, index: number) => ({
            id: index + 1,
            name: loc.name,
            count: loc.count || 0
          }));
          setLocations(formattedLocations);
        } else {
          setLocations([]);
        }
      } else {
        const response = await axios.get(`${API_BASE_URL}/hotels/locations`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (response.data && response.data.locations) {
          // Transform the data to include id
          const formattedLocations = response.data.locations.map((loc: any, index: number) => ({
            id: index + 1,
            name: loc.name,
            count: loc.count || 0
          }));
          setLocations(formattedLocations);
        } else {
          setLocations([]);
        }
      }
    } catch (error: any) {
      console.error("Error fetching locations:", error);
      setError("Failed to fetch locations. Please try again later.");
      setLocations([]);
    } finally {
      setLoadingLocations(false);
    }
  };

  const filteredLocations = locations.filter((location) =>
    location.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Fetch guides and hotels based on selected location
  useEffect(() => {
    if (selectedLocation) {
      fetchDataByLocation(selectedLocation);
    } else {
      // Reset data when no location is selected
      setGuides([]);
      setHotels([]);
    }
  }, [selectedLocation, selectedTab]);

  const fetchDataByLocation = async (locationName: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        Alert.alert("Error", "Authentication failed. Please log in again.");
        return;
      }
      
      // Fetch guides or hotels based on selected tab
      if (selectedTab === "Local Guides") {
        const response = await axios.get(`${API_BASE_URL}/guides/details`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (response.data && response.data.guides) {
          // Filter guides by location
          const filteredGuides = response.data.guides.filter(
            (guide: Guide) => guide.location === locationName
          );
          setGuides(filteredGuides);
        } else {
          setGuides([]);
        }
      } else {
        const response = await axios.get(`${API_BASE_URL}/hotels`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (response.data && response.data.hotels) {
          // Filter hotels by location
          const filteredHotels = response.data.hotels.filter(
            (hotel: Hotel) => hotel.location === locationName
          );
          setHotels(filteredHotels);
        } else {
          setHotels([]);
        }
      }
    } catch (error: any) {
      console.error("Error fetching data:", error);
      setError("Failed to fetch data. Please try again later.");
      if (selectedTab === "Local Guides") {
        setGuides([]);
      } else {
        setHotels([]);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLocationSelect = (locationName: string) => {
    setSelectedLocation(locationName);
  };

  const handleTabChange = (tab: string) => {
    setSelectedTab(tab);
    setSelectedLocation(null);
    fetchLocations();
  };

  const navigateToGuideDetails = (guideId: number) => {
    router.push({
      pathname: "/Booking",
      params: { guideId: guideId.toString() }
    });
  };

  const navigateToHotelDetails = (hotelId: number, hotelName: string, hotelLocation: string, hotelPrice: string, hotelImage: string) => {
    router.push({
      pathname: "/SpecificHotel",
      params: { 
        hotelId: hotelId.toString(),
        hotelName,
        hotelLocation,
        hotelPrice,
        hotelImage: hotelImage || ""
      }
    });
  };

  const renderGuideItem = ({ item }: { item: Guide }) => (
    <TouchableOpacity
      className="bg-white p-4 rounded-lg mb-3 shadow-sm"
      onPress={() => navigateToGuideDetails(item.id)}
    >
      <View className="flex-row">
        <Image
          source={{ uri: item.guideProfile || "https://via.placeholder.com/100" }}
          className="w-20 h-20 rounded-full"
        />
        <View className="ml-3 flex-1">
          <Text className="text-lg font-bold text-gray-800">{item.name}</Text>
          <Text className="text-gray-600">{item.specialization}</Text>
          <View className="flex-row items-center mt-1">
            <Ionicons name="location-outline" size={16} color="#6B7280" />
            <Text className="text-gray-500 ml-1">{item.location}</Text>
          </View>
          <View className="flex-row items-center mt-1">
            <Ionicons name="cash-outline" size={16} color="#6B7280" />
            <Text className="text-gray-500 ml-1">Rs. {item.charge} / day</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderHotelItem = ({ item }: { item: Hotel }) => (
    <TouchableOpacity
      className="bg-white p-4 rounded-lg mb-3 shadow-sm"
      onPress={() => navigateToHotelDetails(
        item.id, 
        item.name, 
        item.location, 
        item.price.toString(),
        item.hotelProfile || ""
      )}
    >
      <View className="flex-row">
        <Image
          source={{ uri: item.hotelProfile || "https://via.placeholder.com/100" }}
          className="w-20 h-20 rounded-lg"
        />
        <View className="ml-3 flex-1">
          <Text className="text-lg font-bold text-gray-800">{item.name}</Text>
          <View className="flex-row items-center mt-1">
            <Ionicons name="location-outline" size={16} color="#6B7280" />
            <Text className="text-gray-500 ml-1">{item.location}</Text>
          </View>
          <View className="flex-row items-center mt-1">
            <Ionicons name="bed-outline" size={16} color="#6B7280" />
            <Text className="text-gray-500 ml-1">{item.totalRooms} rooms</Text>
          </View>
          <View className="flex-row items-center mt-1">
            <Ionicons name="cash-outline" size={16} color="#6B7280" />
            <Text className="text-gray-500 ml-1">Rs. {item.price} / night</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderLocationItem = ({ item }: { item: Location }) => (
    <TouchableOpacity
      className={`p-4 border-b flex-row items-center justify-between ${
        selectedLocation === item.name ? "bg-pink-100" : "bg-white"
      }`}
      onPress={() => handleLocationSelect(item.name)}
    >
      <View className="flex-row items-center">
        <Ionicons
          name="location-outline"
          size={24}
          color={selectedLocation === item.name ? "#E91E63" : "black"}
        />
        <View className="ml-3">
          <Text className="text-lg font-bold">{item.name}</Text>
        </View>
      </View>
      <View className="bg-pink-100 px-3 py-1 rounded-full">
        <Text className="text-pink-600 font-medium">{item.count}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View className="p-4 bg-white h-full">
      <View className="flex-row items-center gap-4">
        <TouchableOpacity onPress={() => router.replace("/UserHome")}>
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text className="text-lg font-semibold text-center py-2">
          Search for locals & hotels
        </Text>
      </View>
      <View className="flex-row items-center border rounded-md px-3 py-2 bg-gray-100 mt-7">
        <Ionicons name="search" size={20} color="gray" />
        <TextInput
          className="ml-2 flex-1"
          placeholder="Where are you going?"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <View className="flex-row justify-center mt-4 rounded-md overflow-hidden">
        <TouchableOpacity
          className={`w-1/2 py-3 ${
            selectedTab === "Local Guides" ? "bg-pink-500" : "bg-gray-200"
          }`}
          onPress={() => handleTabChange("Local Guides")}
        >
          <Text
            className={`text-center font-semibold ${
              selectedTab === "Local Guides" ? "text-white" : "text-gray-600"
            }`}
          >
            Local Guides
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          className={`w-1/2 py-3 ${
            selectedTab === "Hotels" ? "bg-pink-500" : "bg-gray-200"
          }`}
          onPress={() => handleTabChange("Hotels")}
        >
          <Text
            className={`text-center font-semibold ${
              selectedTab === "Hotels" ? "text-white" : "text-gray-600"
            }`}
          >
            Hotels
          </Text>
        </TouchableOpacity>
      </View>

      {selectedLocation ? (
        <View className="mt-4 flex-1">
          <View className="flex-row justify-between items-center mb-3">
            <Text className="text-lg font-bold">
              {selectedTab === "Local Guides" ? "Available Guides" : "Available Hotels"} in {selectedLocation}
            </Text>
            <TouchableOpacity 
              className="bg-gray-200 px-3 py-1 rounded-full"
              onPress={() => setSelectedLocation(null)}
            >
              <Text className="text-gray-700">Change Location</Text>
            </TouchableOpacity>
          </View>
          
          {loading ? (
            <View className="flex-1 justify-center items-center">
              <ActivityIndicator size="large" color="#E91E63" />
              <Text className="mt-3 text-gray-600">Loading...</Text>
            </View>
          ) : error ? (
            <View className="flex-1 justify-center items-center">
              <Ionicons name="alert-circle-outline" size={40} color="#E91E63" />
              <Text className="mt-3 text-gray-600">{error}</Text>
              <TouchableOpacity 
                className="mt-4 bg-pink-500 px-4 py-2 rounded-full"
                onPress={() => fetchDataByLocation(selectedLocation)}
              >
                <Text className="text-white font-medium">Try Again</Text>
              </TouchableOpacity>
            </View>
          ) : selectedTab === "Local Guides" ? (
            guides.length > 0 ? (
              <FlatList
                data={guides}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderGuideItem}
                showsVerticalScrollIndicator={false}
              />
            ) : (
              <View className="flex-1 justify-center items-center">
                <Ionicons name="people-outline" size={40} color="#6B7280" />
                <Text className="mt-3 text-gray-600">No guides found in this location</Text>
              </View>
            )
          ) : (
            hotels.length > 0 ? (
              <FlatList
                data={hotels}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderHotelItem}
                showsVerticalScrollIndicator={false}
              />
            ) : (
              <View className="flex-1 justify-center items-center">
                <Ionicons name="business-outline" size={40} color="#6B7280" />
                <Text className="mt-3 text-gray-600">No hotels found in this location</Text>
              </View>
            )
          )}
        </View>
      ) : (
        <View className="mt-4 flex-1">
          <Text className="text-lg font-bold mb-3">
            {selectedTab === "Local Guides" ? "Available Locations for Guides" : "Available Locations for Hotels"}
          </Text>
          
          {loadingLocations ? (
            <View className="flex-1 justify-center items-center">
              <ActivityIndicator size="large" color="#E91E63" />
              <Text className="mt-3 text-gray-600">Loading locations...</Text>
            </View>
          ) : error ? (
            <View className="flex-1 justify-center items-center">
              <Ionicons name="alert-circle-outline" size={40} color="#E91E63" />
              <Text className="mt-3 text-gray-600">{error}</Text>
              <TouchableOpacity 
                className="mt-4 bg-pink-500 px-4 py-2 rounded-full"
                onPress={fetchLocations}
              >
                <Text className="text-white font-medium">Try Again</Text>
              </TouchableOpacity>
            </View>
          ) : locations.length > 0 ? (
            <FlatList
              data={filteredLocations}
              keyExtractor={(item) => item.id.toString()}
              renderItem={renderLocationItem}
              showsVerticalScrollIndicator={false}
            />
          ) : (
            <View className="flex-1 justify-center items-center">
              <Ionicons name="location-outline" size={40} color="#6B7280" />
              <Text className="mt-3 text-gray-600">No locations found</Text>
            </View>
          )}
        </View>
      )}
    </View>
  );
};

export default UserSearch;
