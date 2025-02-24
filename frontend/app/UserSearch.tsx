import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

const locations = [
  { id: 1, name: "Dharan", district: "Sunsari" },
  { id: 2, name: "Itahari", district: "Morang" },
  { id: 3, name: "Damak", district: "Jhapa" },
  { id: 4, name: "Pashupatinath", district: "Kathmandu" },
  { id: 5, name: "Pokhara", district: "Kaski" },
  { id: 6, name: "Pathibhara", district: "Taplejung" },
  { id: 7, name: "Barcelona", district: "Saptari" },
  { id: 8, name: "Mountains", district: "Solukhumbu" },
  { id: 9, name: "Haleshi", district: "Khotang" },
  { id: 10, name: "Temple", district: "Bhojpur" },
];

const UserSearch = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTab, setSelectedTab] = useState("Local Guides");
  const [selectedLocation, setSelectedLocation] = useState<number | null>(null);
  const router = useRouter();

  const filteredLocations = locations.filter((location) =>
    location.name.toLowerCase().includes(searchQuery.toLowerCase())
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
          onPress={() => setSelectedTab("Local Guides")}
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
          onPress={() => setSelectedTab("Hotels")}
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

      <FlatList
        data={filteredLocations}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            className={`p-4 border-b flex-row items-center ${
              selectedLocation === item.id ? "bg-pink-100" : "bg-white"
            }`}
            onPress={() => setSelectedLocation(item.id)}
          >
            <Ionicons
              name="location-outline"
              size={24}
              color={selectedLocation === item.id ? "#E91E63" : "black"}
            />
            <View className="ml-3">
              <Text className="text-lg font-bold">{item.name}</Text>
              <Text className="text-gray-500">{item.district}</Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

export default UserSearch;
