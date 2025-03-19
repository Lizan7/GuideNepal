// geminichat.tsx
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import axios from "axios";
import API_BASE_URL from "@/config";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

interface Message {
  id: number;
  text: string;
  sender: "user" | "ai";
}

const GeminiChat: React.FC = () => {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const sendMessage = async () => {
    if (!inputText.trim()) return;

    // Append user's message to the chat
    const userMessage: Message = {
      id: Date.now(),
      text: inputText,
      sender: "user",
    };
    setMessages((prev) => [...prev, userMessage]);
    setInputText("");
    setLoading(true);

    try {
      // Call your backend API acting as a proxy to Gemini AI
      const response = await axios.post(`${API_BASE_URL}/api/gemini-chat`, {
        message: userMessage.text,
      });
      // Assume the response contains a field called "reply"
      const aiReply: Message = {
        id: Date.now() + 1,
        text: response.data.reply || "No reply received",
        sender: "ai",
      };
      setMessages((prev) => [...prev, aiReply]);
    } catch (error) {
      console.error("Error sending message:", error);
      const errorMessage: Message = {
        id: Date.now() + 2,
        text: "Error: Failed to get response from Gemini.",
        sender: "ai",
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const renderMessage = ({ item }: { item: Message }) => (
    <View
      className={`p-2 rounded-lg my-1 max-w-[80%] ${
        item.sender === "user"
          ? "bg-green-100 self-end"
          : "bg-gray-200 self-start"
      }`}
    >
      <Text className="text-base">{item.text}</Text>
    </View>
  );

  return (
    <KeyboardAvoidingView
      className="flex-1"
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View className="flex-1 bg-gray-100">
        {/* Header */}
        <View className="h-16 bg-purple-700 flex-row items-center px-4">
          <TouchableOpacity onPress={() => router.replace("/UserHome")}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text className="ml-4 text-white text-xl">Chat with AI</Text>
        </View>

        {/* Chat Messages */}
        <FlatList
          data={messages}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderMessage}
          contentContainerStyle={{ padding: 16 }}
        />

        {/* Input Field */}
        <View className="flex-row items-center border-t border-gray-300 p-2 bg-white">
          <TextInput
            className="flex-1 h-10 px-3 rounded-full bg-gray-100"
            placeholder="Type your message..."
            value={inputText}
            onChangeText={setInputText}
            editable={!loading}
          />
          <TouchableOpacity
            className="ml-2 bg-purple-700 p-2 rounded-full justify-center items-center"
            onPress={sendMessage}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Ionicons name="send" size={24} color="#fff" />
            )}
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

export default GeminiChat;
