import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Dimensions,
  Platform,
  KeyboardAvoidingView,
  Image,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import API_BASE_URL from "../config";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

interface User {
  id: number;
  username?: string;
  name?: string;
  avatar?: string;
}

interface Message {
  id: number;
  senderId: number;
  receiverId: number;
  message: string | null;
  createdAt: string;
  sender: User;
  receiver: User;
}

interface RouteParams {
  friendId: string;
  friendName: string;
  friendAvatar?: string;
}

const ChatRoom: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentMessage, setCurrentMessage] = useState<string>("");
  const [userId, setUserId] = useState<number | null>(null);
  const [userAvatar, setUserAvatar] = useState<string>(
    "https://via.placeholder.com/40"
  );
  const [isInitialLoad, setIsInitialLoad] = useState<boolean>(true);

  const flatListRef = useRef<FlatList>(null);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const router = useRouter();
  const params = useLocalSearchParams() as unknown as RouteParams;
  const { friendId, friendName, friendAvatar } = params;

  // Fetch current user ID and avatar
  const fetchUserId = async (): Promise<void> => {
    try {
      const userInfo = await AsyncStorage.getItem("userId");
      if (userInfo) {
        const parsedInfo = JSON.parse(userInfo);
        setUserId(parsedInfo);
        // Check if parsedInfo is an object with avatar property
        if (
          typeof parsedInfo === "object" &&
          parsedInfo !== null &&
          "avatar" in parsedInfo
        ) {
          setUserAvatar(parsedInfo.avatar || "https://via.placeholder.com/40");
        }
      }
    } catch (error) {
      console.error("Error getting user ID:", error);
    }
  };

  // Fetch message history
  const fetchMessages = useCallback(
    async (isInitial: boolean = false): Promise<void> => {
      try {
        const token = await AsyncStorage.getItem("token");

        const response = await axios.post(
          `${API_BASE_URL}/chat/getMessage`,
          { receiverId: parseInt(friendId) },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.data.success && response.data.data) {
          const newMessages = response.data.data;

          // If this is not the initial load, check if we have new messages
          if (!isInitial && messages.length > 0) {
            const lastMessageId = messages[messages.length - 1].id;
            const hasNewMessages = newMessages.some(
              (msg: Message) => msg.id > lastMessageId
            );

            if (hasNewMessages) {
              setMessages(newMessages);
              // Only scroll to bottom if new messages were added
              flatListRef.current?.scrollToEnd({ animated: true });
            }
          } else {
            // Initial load
            setMessages(newMessages);
            if (newMessages.length > 0) {
              // Use a small delay to ensure FlatList has rendered
              setTimeout(() => {
                flatListRef.current?.scrollToEnd({ animated: false });
              }, 100);
            }
          }
        }

        if (isInitial) {
          setIsInitialLoad(false);
        }
      } catch (error) {
        console.error("Error fetching messages:", error);
        if (isInitial) {
          Alert.alert(
            "Error",
            "Could not load messages. Please try again later."
          );
        }
      }
    },
    [friendId, messages]
  );

  useEffect(() => {
    pollingIntervalRef.current = setInterval(() => {
      if (!isInitialLoad) {
        fetchMessages(false);
      }
    }, 3000);
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, [fetchMessages, isInitialLoad]);

  // Send a message
  const sendMessage = async (): Promise<void> => {
    if (!currentMessage.trim()) return;

    try {
      const token = await AsyncStorage.getItem("token");

      const response = await axios.post(
        `${API_BASE_URL}/chat/sendMessage`,
        {
          receiverId: parseInt(friendId),
          message: currentMessage,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        // Add the new message to the list
        const newMessage = response.data.data;
        setMessages((prevMessages) => [...prevMessages, newMessage]);
        setCurrentMessage("");

        // Scroll to the bottom
        flatListRef.current?.scrollToEnd({ animated: true });
      }
    } catch (error) {
      console.error("Error sending message:", error);
      Alert.alert("Error", "Failed to send message. Please try again.");
    }
  };

  // Initialize data on component mount
  useEffect(() => {
    const init = async (): Promise<void> => {
      await fetchUserId();
      await fetchMessages(true);
    };

    init();
  }, [friendId]);

  // Render individual message
  const renderMessage = ({ item }: { item: Message }) => {
    const isMyMessage = item.senderId === userId;

    return (
      <View
        style={[
          styles.messageContainer,
          {
            alignSelf: isMyMessage ? "flex-end" : "flex-start",
            flexDirection: isMyMessage ? "row-reverse" : "row",
          },
        ]}
      >
        {!isMyMessage && (
          <Image
            source={{ uri: friendAvatar || "https://via.placeholder.com/40" }}
            style={styles.avatarSmall}
          />
        )}
        <View
          style={[
            styles.messageBubble,
            {
              backgroundColor: isMyMessage ? "#007AFF" : "#E5E5EA",
              borderBottomRightRadius: isMyMessage ? 0 : 16,
              borderBottomLeftRadius: !isMyMessage ? 0 : 16,
              marginRight: isMyMessage ? 8 : 0,
              marginLeft: !isMyMessage ? 8 : 0,
            },
          ]}
        >
          <Text
            style={[
              styles.messageText,
              { color: isMyMessage ? "white" : "black" },
            ]}
          >
            {item.message}
          </Text>
          <Text
            style={[
              styles.messageTime,
              {
                color: isMyMessage ? "rgba(255,255,255,0.7)" : "gray",
                alignSelf: isMyMessage ? "flex-end" : "flex-start",
              },
            ]}
          >
            {new Date(item.createdAt).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </Text>
        </View>
        {isMyMessage && (
          <Image source={{ uri: userAvatar }} style={styles.avatarSmall} />
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Chat Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>

        <View style={styles.headerUserInfo}>
          <Image
            source={{ uri: friendAvatar || "https://via.placeholder.com/40" }}
            style={styles.avatar}
          />
          <View style={styles.userNameContainer}>
            <Text style={styles.userName}>{friendName}</Text>
            <Text style={styles.userStatus}>Online</Text>
          </View>
        </View>

        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.headerActionButton}>
            <Ionicons name="call-outline" size={20} color="black" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerActionButton}>
            <Ionicons name="videocam-outline" size={20} color="black" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Messages List */}
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderMessage}
        contentContainerStyle={[
          styles.messagesList,
          messages.length === 0 && styles.emptyList,
        ]}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={() => (
          <View style={styles.emptyListContainer}>
            <Ionicons name="chatbubble-outline" size={60} color="lightgray" />
            <Text style={styles.emptyListText}>
              No messages yet. Start a conversation!
            </Text>
          </View>
        )}
      />

      {/* Message Input Area */}
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
        style={styles.inputContainer}
      >
        <TouchableOpacity style={styles.attachButton}>
          <Ionicons name="add" size={24} color="gray" />
        </TouchableOpacity>

        <TextInput
          style={styles.textInput}
          placeholder="Type a message"
          placeholderTextColor="#888"
          value={currentMessage}
          onChangeText={setCurrentMessage}
          multiline
          maxLength={500}
        />

        <TouchableOpacity
          onPress={sendMessage}
          disabled={!currentMessage.trim()}
          style={[
            styles.sendButton,
            {
              backgroundColor: currentMessage.trim() ? "#007AFF" : "#E5E5EA",
            },
          ]}
        >
          <Ionicons
            name="send"
            size={20}
            color={currentMessage.trim() ? "white" : "gray"}
          />
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F2F2F7",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    paddingHorizontal: 16,
    paddingVertical: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  backButton: {
    marginRight: 12,
  },
  headerUserInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  userNameContainer: {
    justifyContent: "center",
  },
  userName: {
    fontSize: 16,
    fontWeight: "600",
  },
  userStatus: {
    fontSize: 12,
    color: "green",
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerActionButton: {
    marginLeft: 15,
  },
  messagesList: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  emptyList: {
    flex: 1,
    justifyContent: "center",
  },
  messageContainer: {
    marginVertical: 4,
    alignItems: "flex-end",
  },
  avatarSmall: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginHorizontal: 8,
  },
  messageBubble: {
    maxWidth: SCREEN_WIDTH * 0.75,
    padding: 12,
    borderRadius: 16,
  },
  messageText: {
    fontSize: 16,
  },
  messageTime: {
    fontSize: 10,
    marginTop: 4,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: "#E5E5EA",
  },
  attachButton: {
    marginRight: 12,
  },
  textInput: {
    flex: 1,
    backgroundColor: "#F2F2F7",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginRight: 12,
    maxHeight: 100,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyListContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  emptyListText: {
    color: "gray",
    fontSize: 16,
    textAlign: "center",
    marginTop: 12,
  },
});

export default ChatRoom;
