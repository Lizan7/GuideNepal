// geminichat.tsx
import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  Animated,
  Dimensions,
} from "react-native";
import axios from "axios";
import API_BASE_URL from "@/config";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface Message {
  id: number;
  text: string;
  sender: "user" | "ai";
  timestamp: Date;
  isAnimated?: boolean;
  animation?: Animated.Value;
}

const WELCOME_MESSAGE: Message = {
  id: 0,
  text: "Hello! I'm Geet, your AI travel assistant. I can help you discover amazing destinations, plan your trips, and answer any travel-related questions. How can I assist you today?",
  sender: "ai",
  timestamp: new Date(),
  isAnimated: true,
  animation: new Animated.Value(0)
};

const Chatbot: React.FC = () => {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([WELCOME_MESSAGE]);
  const [inputText, setInputText] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const flatListRef = useRef<FlatList>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const screenHeight = Dimensions.get('window').height;

  useEffect(() => {
    // Animate welcome message
    Animated.timing(WELCOME_MESSAGE.animation!, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();

    // Animate header
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, []);

  useEffect(() => {
    // Animate new messages
    const lastMessage = messages[messages.length - 1];
    if (lastMessage && lastMessage.isAnimated && lastMessage.animation) {
      Animated.timing(lastMessage.animation, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();
    }
  }, [messages]);

  const sendMessage = async () => {
    if (!inputText.trim() || loading) return;

    const userMessage: Message = {
      id: Date.now(),
      text: inputText.trim(),
      sender: "user",
      timestamp: new Date(),
      isAnimated: true,
      animation: new Animated.Value(0)
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText("");
    setLoading(true);

    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found");
      }

      console.log('Sending request to:', `${API_BASE_URL}/api/chatbot/chat`);
      console.log('Message content:', userMessage.text);

      const response = await axios.post(
        `${API_BASE_URL}/chatbot/chat`,
        { content: userMessage.text },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log('Response:', response.data);

      if (response.data.success) {
        const aiMessage: Message = {
          id: Date.now() + 1,
          text: response.data.data,
          sender: "ai",
          timestamp: new Date(),
          isAnimated: true,
          animation: new Animated.Value(0)
        };
        setMessages(prev => [...prev, aiMessage]);
      } else {
        throw new Error(response.data.message || "Failed to get response");
      }
    } catch (error: any) {
      console.error("Error details:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      const errorMessage: Message = {
        id: Date.now() + 1,
        text: "Sorry, I encountered an error. Please try again.",
        sender: "ai",
        timestamp: new Date(),
        isAnimated: true,
        animation: new Animated.Value(0)
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };


  const renderMessage = ({ item }: { item: Message }) => (
    <Animated.View
      style={{
        opacity: item.animation,
        transform: [
          {
            translateY: item.animation!.interpolate({
              inputRange: [0, 1],
              outputRange: [20, 0],
            }),
          },
        ],
      }}
    >
      <View
        className={`p-4 rounded-2xl my-1 max-w-[85%] shadow-sm ${
          item.sender === "user"
            ? "bg-purple-100 self-end mr-2 rounded-tr-sm"
            : "bg-white self-start ml-2 rounded-tl-sm"
        }`}
      >
        <Text className={`text-base ${item.sender === "user" ? "text-purple-900" : "text-gray-800"}`}>
          {item.text}
        </Text>
        <Text className="text-xs text-gray-500 mt-1">
          {item.timestamp.toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit' 
          })}
        </Text>
      </View>
    </Animated.View>
  );

  const scrollToBottom = () => {
    if (flatListRef.current) {
      flatListRef.current.scrollToEnd({ animated: true });
    }
  };

  return (
    <SafeAreaView className="flex-1 " style={{ paddingTop: 0 }}>
      {/* Header */}
      <Animated.View 
        className="h-16 flex-row items-center justify-between px-4 bg-purple-700"
        style={{ opacity: fadeAnim }}
      >
        <View className="flex-row bg-purple-700 items-center">
          <TouchableOpacity 
            onPress={() => router.replace("/UserHome")}
            className="p-2 -ml-2"
          >
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <View>
            <Text className="ml-2 text-white text-xl font-semibold">Geet - Travel Assistant</Text>
          </View>
        </View>
      </Animated.View>

      {/* Chat Container */}
      <View className="flex-1 bg-gray-50 rounded-t-3xl">
        <KeyboardAvoidingView
          className="flex-1"
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
        >
          {/* Chat Messages */}
          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderMessage}
            contentContainerStyle={{ 
              padding: 16,
              paddingBottom: 24,
            }}
            onContentSizeChange={scrollToBottom}
            onLayout={scrollToBottom}
          />

          {/* Input Field */}
          <View className="flex-row items-center justify-center border-t border-gray-200 p-3 bg-white">
            <TextInput
              className="flex-1 min-h-[40px] px-4 py-2 rounded-full bg-gray-100 text-gray-800 mt-2 "
              placeholder="Ask about destinations, travel tips..."
              placeholderTextColor="#9CA3AF"
              value={inputText}
              onChangeText={setInputText}
              editable={!loading}
              multiline
              style={{ maxHeight: 100 }}
              onSubmitEditing={sendMessage}
            />
            <TouchableOpacity
              className={`ml-2 p-3 rounded-full justify-center items-center ${
                !inputText.trim() || loading ? 'bg-purple-400' : 'bg-purple-700'
              }`}
              onPress={sendMessage}
              disabled={loading || !inputText.trim()}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Ionicons name="send" size={20} color="#fff" />
              )}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </View>
    </SafeAreaView>
  );
};

export default Chatbot;
