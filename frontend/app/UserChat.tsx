import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

const UserChat = () => {
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const [conversations, setConversations] = useState([
    {
      id: "1",
      name: "John Doe",
      lastMessage: "Hey! How are you?",
      time: "10:30 AM",
      image: require("../assets/images/profile1.png"),
    },
    {
      id: "2",
      name: "Alice Smith",
      lastMessage: "Let's catch up tomorrow!",
      time: "Yesterday",
      image: require("../assets/images/profile2.jpg"),
    },
    {
      id: "3",
      name: "Michael Johnson",
      lastMessage: "Meeting at 4 PM?",
      time: "2 days ago",
      image: require("../assets/images/profile.jpg"),
    },
  ]);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 2000);
    return () => clearTimeout(timer);
  }, []);

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
        <TouchableOpacity>
          <Ionicons name="chatbubble-ellipses-outline" size={24} color="gray" />
        </TouchableOpacity>
      </View>

      {/* Loader */}
      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#d63384" />
          <Text className="text-lg text-gray-600 mt-3">
            Loading conversations...
          </Text>
        </View>
      ) : conversations.length === 0 ? (
        <View className="flex-1 items-center mt-14">
          <Image
            source={require("../assets/images/no-booking.png")}
            className="w-64 h-60"
          />
          <Text className="text-2xl font-bold text-gray-700 mt-2">
            No conversations
          </Text>
          <Text className="text-gray-500 mt-1 text-lg">
            Start a conversation now!
          </Text>
        </View>
      ) : (
        <FlatList
          data={conversations}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              className="flex-row items-center p-4 border-b border-gray-200"
              //   onPress={() => router.push(`/UserChat/${item.id}`)}
            >
              <Image source={item.image} className="w-20 h-20 rounded-lg" />
              <View className="flex-1 ml-4">
                <Text className="text-base font-bold">{item.name}</Text>
                <Text className="text-sm text-gray-600">
                  {item.lastMessage}
                </Text>
              </View>
              <Text className="text-xs text-gray-500">{item.time}</Text>
            </TouchableOpacity>
          )}
        />
      )}

      {/* Bottom Navigation */}
      <View className="absolute bottom-0 left-0 right-0 bg-white flex-row justify-around p-4 border-t border-gray-200">
        <View className="items-center">
          <TouchableOpacity onPress={() => router.replace("/UserHome")}>
            <Ionicons name="home" size={20} color="gray" />
          </TouchableOpacity>
          <Text className="text-gray-500">Explore</Text>
        </View>
        <View className="items-center">
          <TouchableOpacity onPress={() => router.replace("/UserBooking")}>
            <Ionicons name="ticket-outline" size={20} color="gray" />
          </TouchableOpacity>
          <Text className="text-gray-500">Booking</Text>
        </View>
        <View className="items-center">
          <TouchableOpacity onPress={() => router.replace("/UserChat")}>
            <Ionicons
              name="chatbubble-ellipses-outline"
              size={20}
              color="purple"
            />
          </TouchableOpacity>
          <Text className="text-purple-700">Chat</Text>
        </View>
        <View className="items-center">
          <TouchableOpacity onPress={() => router.replace("/UserMenu")}>
            <Ionicons name="menu-outline" size={20} color="gray" />
          </TouchableOpacity>
          <Text className="text-gray-500">Menu</Text>
        </View>
      </View>
    </View>
  );
};

export default UserChat;
