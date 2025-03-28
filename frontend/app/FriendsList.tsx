import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ListRenderItem
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import API_BASE_URL  from "../config";

interface Friend {
  id: number;
  name: string | null;
  email: string;
}

const FriendsList: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [friends, setFriends] = useState<Friend[]>([]);
  const router = useRouter();

  // Fetch friends list
  const fetchFriends = async (): Promise<void> => {
    try {
      setLoading(true);
      // Assuming you have the token stored in AsyncStorage or some state management
      const token = await AsyncStorage.getItem("token");
      
      const response = await axios.get(`${API_BASE_URL}/chat/getfriends`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.data.friends) {
        setFriends(response.data.friends);
      }
    } catch (error) {
      console.error("Error fetching friends:", error);
      Alert.alert(
        "Error",
        "Could not load your friends list. Please try again later."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFriends();
  }, []);

  // Navigate to chat with a friend
  const startChat = (friendId: number, friendName: string): void => {
    router.push({
      pathname: "/ChatRoom",
      params: { friendId, friendName }
    });
  };

  const renderFriendItem: ListRenderItem<Friend> = ({ item }) => (
    <TouchableOpacity
      className="flex-row items-center p-4 border-b border-gray-200"
      onPress={() => startChat(item.id, item.name || "Unknown User")}
    >
      {/* Use a default profile image or get image from your API if available */}
      <Image 
        source={require("../assets/images/profile.jpg")} 
        className="w-16 h-16 rounded-full"
      />
      <View className="flex-1 ml-4">
        <Text className="text-lg font-bold">{item.name || "Unknown User"}</Text>
        <Text className="text-sm text-gray-600">{item.email}</Text>
      </View>
      <TouchableOpacity className="bg-purple-100 p-2 rounded-full">
        <Ionicons name="chatbubble-outline" size={24} color="purple" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <View className="px-6 py-4 bg-gray-100 flex-row items-center justify-between">
        <View className="flex-row gap-3 items-center">
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="chevron-back-outline" size={24} color="black" />
          </TouchableOpacity>
          <Text className="text-xl font-bold text-gray-800">My Friends</Text>
        </View>
        <TouchableOpacity onPress={() => router.push("/FindFriends")}>
          <Ionicons name="person-add-outline" size={24} color="purple" />
        </TouchableOpacity>
      </View>

      {/* Loading state */}
      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#d63384" />
          <Text className="text-lg text-gray-600 mt-3">
            Loading friends...
          </Text>
        </View>
      ) : friends.length === 0 ? (
        <View className="flex-1 items-center justify-center p-4">
          <Ionicons name="people-outline" size={80} color="lightgray" />
          <Text className="text-2xl font-bold text-gray-700 mt-5">
            No friends yet
          </Text>
          <Text className="text-gray-500 mt-2 text-center text-lg">
            Connect with other users to start chatting!
          </Text>
          <TouchableOpacity 
            className="mt-6 bg-purple-600 py-3 px-6 rounded-full"
            onPress={() => router.push("/FindFriends")}
          >
            <Text className="text-white font-bold text-lg">Find Friends</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <Text className="px-6 py-3 text-gray-600">
            {friends.length} {friends.length === 1 ? 'Friend' : 'Friends'}
          </Text>
          <FlatList
            data={friends}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderFriendItem}
            contentContainerStyle={{ paddingBottom: 80 }}
          />
        </>
      )}

      {/* Pull to refresh functionality */}
      <TouchableOpacity 
        className="absolute bottom-20 right-5 bg-purple-600 p-3 rounded-full shadow-md"
        onPress={fetchFriends}
      >
        <Ionicons name="refresh-outline" size={24} color="white" />
      </TouchableOpacity>
    </View>
  );
};

export default FriendsList;