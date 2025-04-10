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
  StatusBar,
  SafeAreaView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import API_BASE_URL from "../config";
import BottomNavigation from "@/components/BottomNavigation";

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
      <View className="w-16 h-16 rounded-full bg-blue-100 items-center justify-center border-2 border-blue-200">
        <Text className="text-blue-600 font-bold text-lg">
          {item.name ? item.name.charAt(0).toUpperCase() : "U"}
        </Text>
      </View>
      <Text className="text-sm mt-1 text-center font-medium" numberOfLines={1}>
        {item.name || "User"}
      </Text>
    </TouchableOpacity>
  );

  const renderConversationItem: ListRenderItem<Conversation> = ({ item }) => (
    <TouchableOpacity
      className="flex-row items-center p-4 border-b border-gray-100"
      onPress={() => navigateToChat(item.id, item.name)}
    >
      <View className="w-14 h-14 rounded-full bg-blue-100 items-center justify-center border-2 border-blue-200">
        <Text className="text-blue-600 font-bold text-lg">
          {item.name.charAt(0).toUpperCase()}
        </Text>
      </View>
      <View className="flex-1 ml-4">
        <Text className="text-base font-bold text-gray-800">{item.name}</Text>
        <Text className="text-sm text-gray-500 mt-1">{item.lastMessage}</Text>
      </View>
      <View className="items-end">
        <Text className="text-xs text-gray-400">{item.time}</Text>
        <View className="w-2 h-2 rounded-full bg-blue-500 mt-2"></View>
      </View>
    </TouchableOpacity>
  );

  const renderChatDetails = () => {
    if (loading) {
      return (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text className="text-lg text-gray-600 mt-3">
            Loading conversations...
          </Text>
        </View>
      );
    } else if (conversations.length === 0) {
      return (
        <View className="flex-1 items-center justify-center p-4">
          <View className="w-24 h-24 rounded-full bg-blue-100 items-center justify-center mb-4">
            <Ionicons name="chatbubble-ellipses-outline" size={48} color="#3B82F6" />
          </View>
          <Text className="text-xl font-bold text-gray-700 mt-2">
            No conversations yet
          </Text>
          <Text className="text-gray-500 mt-1 text-center px-6">
            Add friends to start chatting with them
          </Text>
          <TouchableOpacity
            className="mt-6 bg-blue-500 py-3 px-6 rounded-full flex-row items-center"
            onPress={() => router.push("/FindFriends")}
          >
            <Ionicons name="person-add-outline" size={20} color="white" />
            <Text className="text-white font-bold text-lg ml-2">Find Friends</Text>
          </TouchableOpacity>
        </View>
      );
    } else {
      return (
        <FlatList
          data={conversations}
          keyExtractor={(item) => item.id}
          renderItem={renderConversationItem}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      );
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      
      {/* Header */}
      <View className="flex-row items-center p-4 border-b border-gray-100">
        <TouchableOpacity 
          onPress={() => router.replace("/GuideHome")}
          className="p-2"
        >
          <Ionicons name="arrow-back" size={24} color="#000000" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-center">Chats</Text>
        
      </View>

      {/* Friends row */}
      <View className="py-4 border-b border-gray-100">
        <Text className="px-4 pb-2 text-gray-700 font-medium text-base">Friends</Text>
        <FlatList
          horizontal
          data={friends}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderFriendItem}
          ListEmptyComponent={() => (
            <View className="flex-row items-center px-4">
              <TouchableOpacity
                className="items-center mx-2"
                onPress={() => router.push("/FindFriends")}
              >
                <View className="w-16 h-16 rounded-full bg-blue-100 items-center justify-center border-2 border-blue-200">
                  <Ionicons name="add" size={30} color="#3B82F6" />
                </View>
                <Text className="text-sm mt-1 text-center font-medium">Add Friends</Text>
              </TouchableOpacity>
            </View>
          )}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 10 }}
        />
      </View>

      {/* Conversations */}
      <View className="flex-1">
        <Text className="px-4 py-3 text-gray-700 font-medium text-base">
          Recent Chats
        </Text>
        {renderChatDetails()}
      </View>

      {/* Bottom Navigation */}
      <BottomNavigation />
    </SafeAreaView>
  );
};

export default GuideChat;
