import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ListRenderItem,
  ImageSourcePropType,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import API_BASE_URL from "../config";

interface Friend {
  id: number;
  name: string | null;
  email: string;
}

interface Conversation {
  id: string;
  name: string;
  lastMessage: string;
  time: string;
  image: ImageSourcePropType;
}

const GuideChat: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [requestCount, setRequestCount] = useState<number>(0);
  const router = useRouter();

  // Fetch friends
  const fetchFriends = async (): Promise<void> => {
    try {
      const token = await AsyncStorage.getItem("token");

      const response = await axios.get(`${API_BASE_URL}/chat/getfriends`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data.friends) {
        setFriends(response.data.friends);

        // Use the friends data to populate conversations
        // In a real app, you would fetch the last message for each friend
        const convos: Conversation[] = response.data.friends.map(
          (friend: Friend) => ({
            id: friend.id.toString(),
            name: friend.name || "User",
            lastMessage: "Tap to start chatting",
            time: "Now",
            image: require("../assets/images/profile.jpg"), // Default image
          })
        );

        setConversations(convos);
      }
    } catch (error) {
      console.error("Error fetching friends:", error);
    }
  };

  // Check for pending friend requests
  const checkRequests = async (): Promise<void> => {
    try {
      const token = await AsyncStorage.getItem("token");

      const response = await axios.get(`${API_BASE_URL}/chat/getRequest`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data.requests) {
        setRequestCount(response.data.requests.length);
      }
    } catch (error) {
      console.error("Error checking requests:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const loadData = async (): Promise<void> => {
      await fetchFriends();
      await checkRequests();
    };

    loadData();

    // You could set up a refresh interval here
    // const interval = setInterval(checkRequests, 60000);
    // return () => clearInterval(interval);
  }, []);

  const navigateToChat = (friendId: string, friendName: string): void => {
    router.push({
      pathname: "/ChatRoom",
      params: { friendId, friendName },
    });
  };

  const renderFriendItem: ListRenderItem<Friend> = ({ item }) => (
    <TouchableOpacity
      className="items-center mx-2 px-2"
      onPress={() => navigateToChat(item.id.toString(), item.name || "User")}
    >
      <Image
        source={require("../assets/images/profile.jpg")}
        className="w-16 h-16 rounded-full"
      />
      <Text className="text-sm mt-1 text-center" numberOfLines={1}>
        {item.name || "User"}
      </Text>
    </TouchableOpacity>
  );

  const renderConversationItem: ListRenderItem<Conversation> = ({ item }) => (
    <TouchableOpacity
      className="flex-row items-center p-4 border-b border-gray-200"
      onPress={() => navigateToChat(item.id, item.name)}
    >
      <Image source={item.image} className="w-16 h-16 rounded-full" />
      <View className="flex-1 ml-4">
        <Text className="text-base font-bold">{item.name}</Text>
        <Text className="text-sm text-gray-600">{item.lastMessage}</Text>
      </View>
      <Text className="text-xs text-gray-500">{item.time}</Text>
    </TouchableOpacity>
  );

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <View className="px-6 py-4 bg-gray-200 flex-row items-center justify-between">
        <View className="flex-row gap-3">
          <TouchableOpacity onPress={() => router.replace("/UserHome")}>
            <Ionicons name="chevron-back-outline" size={24} color="black" />
          </TouchableOpacity>
          <Text className="text-lg font-bold text-gray-800">Chats</Text>
        </View>
      </View>

      {/* Friends row */}
      <View className="py-3 border-b border-gray-200">
        <Text className="px-6 pb-2 text-gray-700 font-medium">Friends</Text>
        <FlatList
          horizontal
          data={friends}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderFriendItem}
          ListEmptyComponent={() => (
            <View className="flex-row items-center px-6">
              <TouchableOpacity
                className="items-center mx-2"
                onPress={() => router.push("/FindFriends")}
              >
                <View className="w-16 h-16 rounded-full bg-gray-200 items-center justify-center">
                  <Ionicons name="add" size={30} color="gray" />
                </View>
                <Text className="text-sm mt-1 text-center">Add Friends</Text>
              </TouchableOpacity>
            </View>
          )}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 10 }}
        />
      </View>

      {/* Conversations */}
      <View className="flex-1">
        <Text className="px-6 py-3 text-gray-700 font-medium">
          Recent Chats
        </Text>

        {loading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color="#d63384" />
            <Text className="text-lg text-gray-600 mt-3">
              Loading conversations...
            </Text>
          </View>
        ) : conversations.length === 0 ? (
          <View className="flex-1 items-center justify-center p-4">
            <Image
              source={require("../assets/images/no-booking.png")}
              className="w-64 h-60"
            />
            <Text className="text-xl font-bold text-gray-700 mt-2">
              No conversations yet
            </Text>
            <Text className="text-gray-500 mt-1 text-lg text-center">
              Add friends to start chatting!
            </Text>
            <TouchableOpacity
              className="mt-6 bg-purple-600 py-3 px-6 rounded-full"
              onPress={() => router.push("/FindFriends")}
            >
              <Text className="text-white font-bold text-lg">Find Friends</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={conversations}
            keyExtractor={(item) => item.id}
            renderItem={renderConversationItem}
          />
        )}
      </View>

      {/* Bottom Navigation */}
      <View
        style={{
          backgroundColor: "white",
          flexDirection: "row",
          justifyContent: "space-around",
          padding: 16,
          borderTopWidth: 1,
          borderTopColor: "#E5E7EB",
        }}
      >
        <View style={{ alignItems: "center" }}>
          <TouchableOpacity onPress={() => router.replace("/GuideHome")}>
            <Ionicons name="home" size={24} color="gray" />
          </TouchableOpacity>
          <Text style={{ color: "#6B7280", fontSize: 12 }}>Dashboard</Text>
        </View>

        <View style={{ alignItems: "center" }}>
          <TouchableOpacity>
            <Ionicons
              name="chatbubble-ellipses-outline"
              size={24}
              color="#A855F7"
            />
          </TouchableOpacity>
          <Text style={{ color: "#A855F7", fontSize: 12 }}>Chat</Text>
        </View>

        <View style={{ alignItems: "center" }}>
          <TouchableOpacity onPress={() => router.replace("/GuideProfile")}>
            <Ionicons name="person-outline" size={24} color="gray" />
          </TouchableOpacity>
          <Text style={{ color: "#6B7280", fontSize: 12 }}>Profile</Text>
        </View>
      </View>
    </View>
  );
};

export default GuideChat;
