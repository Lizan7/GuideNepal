import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  TextInput,
  ListRenderItem
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import API_BASE_URL from "../config";

interface User {
  id: number;
  name: string | null;
  email: string;
}

interface PendingRequests {
  [key: number]: boolean;
}

const FindFriends: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [pendingRequests, setPendingRequests] = useState<PendingRequests>({});
  const router = useRouter();

  // Fetch all users that can be added as friends
  const fetchUsers = async (): Promise<void> => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem("token");
      
      const response = await axios.get(`${API_BASE_URL}/chat/users`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.data.users) {
        setUsers(response.data.users);
        setFilteredUsers(response.data.users);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      Alert.alert(
        "Error",
        "Could not load users. Please try again later."
      );
    } finally {
      setLoading(false);
    }
  };

  // Send friend request
  const sendFriendRequest = async (receiverId: number): Promise<void> => {
    try {
      const token = await AsyncStorage.getItem("token");
      
      const response = await axios.post(
        `${API_BASE_URL}/chat/sendRequest`,
        {
          receiverId: receiverId,
          message: "I'd like to add you as a friend!"
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (response.data.request) {
        // Update UI to show pending request
        setPendingRequests({
          ...pendingRequests,
          [receiverId]: true
        });
        
        Alert.alert("Success", "Friend request sent successfully!");
      }
    } catch (error) {
      console.error("Error sending friend request:", error);
      Alert.alert(
        "Error",
        "Could not send friend request. Please try again later."
      );
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Filter users based on search query
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredUsers(users);
    } else {
      const filtered = users.filter((user) => 
        user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredUsers(filtered);
    }
  }, [searchQuery, users]);

  const renderUserItem: ListRenderItem<User> = ({ item }) => (
    <View className="flex-row items-center p-4 border-b border-gray-200">
      <Image 
        source={require("../assets/images/profile.jpg")} 
        className="w-14 h-14 rounded-full"
      />
      <View className="flex-1 ml-3">
        <Text className="text-base font-bold">{item.name || "Unknown User"}</Text>
        <Text className="text-sm text-gray-600">{item.email}</Text>
      </View>
      {pendingRequests[item.id] ? (
        <View className="bg-gray-200 py-2 px-4 rounded-full">
          <Text className="text-sm text-gray-600">Pending</Text>
        </View>
      ) : (
        <TouchableOpacity
          className="bg-purple-600 py-2 px-4 rounded-full"
          onPress={() => sendFriendRequest(item.id)}
        >
          <Text className="text-white font-medium">Add</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <View className="px-6 py-4 bg-gray-100 flex-row items-center justify-between">
        <View className="flex-row gap-3 items-center">
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="chevron-back-outline" size={24} color="black" />
          </TouchableOpacity>
          <Text className="text-xl font-bold text-gray-800">Find Friends</Text>
        </View>
      </View>

      {/* Search bar */}
      <View className="px-4 py-3">
        <View className="flex-row items-center bg-gray-100 px-3 py-2 rounded-full">
          <Ionicons name="search" size={20} color="gray" />
          <TextInput
            className="flex-1 ml-2 text-base"
            placeholder="Search by name or email"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <Ionicons name="close-circle" size={20} color="gray" />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      {/* Users list */}
      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#d63384" />
          <Text className="text-lg text-gray-600 mt-3">
            Loading users...
          </Text>
        </View>
      ) : filteredUsers.length === 0 ? (
        <View className="flex-1 items-center justify-center p-4">
          <Ionicons name="search-outline" size={60} color="lightgray" />
          <Text className="text-xl font-bold text-gray-700 mt-4">
            No users found
          </Text>
          <Text className="text-gray-500 mt-2 text-center">
            Try a different search term or check back later
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredUsers}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderUserItem}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      )}
    </View>
  );
};

export default FindFriends;