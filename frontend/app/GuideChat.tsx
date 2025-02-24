import React from "react";
import { View, Text, Image, FlatList, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

const GuideChat = () => {
  const router = useRouter();

  const chatData = [
    {
      id: "1",
      name: "Anna Bella",
      message: "Great! Thank you so much",
      time: "11:54 PM",
      unread: 5,
      avatar: require("../assets/images/profile.jpg"),
    },
    {
      id: "2",
      name: "Marc Stegen",
      message: "Hey wassup.. what's going on",
      time: "10:30 PM",
      unread: 5,
      avatar: require("../assets/images/profile1.png"),
    },
    {
      id: "3",
      name: "The Kop Fans",
      message: "Stevie: 📷 Image",
      time: "08:30 PM",
      unread: 220,
      avatar: require("../assets/images/profile.jpg"),
    },
    {
      id: "4",
      name: "Philipe Louis",
      message: "You: I shall do that!",
      time: "Yesterday",
      unread: 0,
      avatar: require("../assets/images/profile2.jpg"),
    },
    {
      id: "5",
      name: "Zhen Zou",
      message: "You: hey wassup.. what's going on",
      time: "Yesterday",
      unread: 0,
      avatar: require("../assets/images/profile1.png"),
    },
    {
      id: "6",
      name: "Ji Sung",
      message: "You: David... I'm working from h...",
      time: "Yesterday",
      unread: 0,
      avatar: require("../assets/images/profile2.jpg"),
    },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: "white" }}>
      {/* Header */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          padding: 16,
          backgroundColor: "#3B82F6",
        }}
      >
        <TouchableOpacity onPress={() => router.replace("/GuideHome")}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={{ color: "white", fontSize: 18, fontWeight: "bold" }}>
          Messages
        </Text>
        <TouchableOpacity>
          <Ionicons name="search-outline" size={24} color="white" />
        </TouchableOpacity>
      </View>

      {/* Chat List */}
      <FlatList
        data={chatData}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={{
              flexDirection: "row",
              alignItems: "center",
              padding: 12,
              borderBottomWidth: 1,
              borderBottomColor: "#E5E7EB",
            }}
          >
            <Image
              source={item.avatar} // ✅ Corrected here: No { uri: ... } for require()
              style={{ width: 48, height: 48, borderRadius: 24 }}
            />
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={{ fontSize: 16, fontWeight: "bold" }}>
                {item.name}
              </Text>
              <Text style={{ color: "#6B7280", fontSize: 14 }}>
                {item.message}
              </Text>
            </View>
            <View style={{ alignItems: "flex-end" }}>
              <Text style={{ color: "#9CA3AF", fontSize: 12 }}>
                {item.time}
              </Text>
              {item.unread > 0 && (
                <View
                  style={{
                    backgroundColor: "#A855F7",
                    width: 24,
                    height: 24,
                    borderRadius: 12,
                    alignItems: "center",
                    justifyContent: "center",
                    marginTop: 4,
                  }}
                >
                  <Text
                    style={{ color: "white", fontSize: 12, fontWeight: "bold" }}
                  >
                    {item.unread}
                  </Text>
                </View>
              )}
            </View>
          </TouchableOpacity>
        )}
      />

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
          <TouchableOpacity onPress={() => router.replace("/GuideChat")}>
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
