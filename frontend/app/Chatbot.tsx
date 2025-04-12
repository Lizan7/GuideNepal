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
        className={`p-4 rounded-2xl my-1.5 max-w-[85%] shadow-sm ${
          item.sender === "user"
            ? "bg-purple-600 self-end mr-2 rounded-tr-sm"
            : "bg-white self-start ml-2 rounded-tl-sm"
        }`}
      >
        {item.sender === "ai" && (
          <View className="flex-row items-center mb-1">
            <View className="w-6 h-6 bg-purple-100 rounded-full items-center justify-center mr-2">
              <Text className="text-purple-600 text-xs font-bold">AI</Text>
            </View>
            <Text className="text-xs text-gray-500">Geet</Text>
          </View>
        )}
        <Text 
          className={`text-base ${
            item.sender === "user" ? "text-white" : "text-gray-800"
          }`}
        >
          {item.text}
        </Text>
        <Text 
          className={`text-xs mt-1 ${
            item.sender === "user" ? "text-white/70" : "text-gray-500"
          }`}
        >
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
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Enhanced Header */}
      <Animated.View 
        className="h-16 flex-row items-center justify-between px-4 bg-gradient-to-r from-purple-600 to-purple-800 shadow-lg"
        style={{ opacity: fadeAnim }}
      >
        <View className="flex-row items-center space-x-3">
          <TouchableOpacity 
            onPress={() => router.replace("/UserHome")}
            className="p-2 bg-white/20 rounded-full"
          >
            <Ionicons name="arrow-back" size={24} color="black" />
          </TouchableOpacity>
          <View>
            <Text className="text-black text-lg font-bold">Geet AI Assistant</Text>
            <Text className="text-black/80 text-xs">Always here to help</Text>
          </View>
        </View>
      </Animated.View>

      {/* Chat Messages */}
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id.toString()}
          contentContainerClassName="px-2 py-4"
          onContentSizeChange={scrollToBottom}
          onLayout={scrollToBottom}
          className="flex-1 bg-gray-50"
          showsVerticalScrollIndicator={false}
        />

        {/*Input Area */}
        <View className="p-2 border-t border-gray-200 bg-white">
          <View className="flex-row items-center px-2 gap-2">
            <View className="flex-1 bg-gray-100 rounded-full flex-row items-center px-3 py-1">
              <TextInput
                value={inputText}
                onChangeText={setInputText}
                placeholder="Type your message..."
                placeholderTextColor="#9CA3AF"
                className="flex-1 text-base text-gray-800 min-h-[40px]"
                multiline
                maxLength={500}
                onSubmitEditing={sendMessage}
              />
              {inputText.length > 0 && (
                <TouchableOpacity
                  onPress={() => setInputText("")}
                  className="p-1 mr-2"
                >
                  <Ionicons name="close-circle" size={20} color="#9CA3AF" />
                </TouchableOpacity>
              )}
            </View>
            <TouchableOpacity
              onPress={sendMessage}
              disabled={!inputText.trim() || loading}
              className={`p-2 rounded-full ${
                !inputText.trim() || loading
                  ? "bg-gray-300"
                  : "bg-purple-600"
              }`}
            >
              {loading ? (
                <ActivityIndicator color="white" size="small" />
              ) : (
                <Ionicons name="send" size={24} color="white" />
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default Chatbot;
