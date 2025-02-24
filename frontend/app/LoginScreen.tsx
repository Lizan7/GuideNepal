import React, { useState } from "react";
import { useRouter } from "expo-router";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  Image,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { Ionicons } from "@expo/vector-icons";
import API_BASE_URL from "../config";

const LoginScreen = () => {
  const router = useRouter();
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please enter your email and password.");
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/login`, {
        email,
        password,
      });

      if (response.data.success) {
        const { token, user } = response.data.data || {};

        if (!token) {
          throw new Error("Token is missing from API response");
        }

        await AsyncStorage.setItem("token", token);
        await AsyncStorage.setItem("role", user.role);

        Alert.alert("Success", "Login successful!");

        if (user.role === "USER") {
          router.replace("/UserHome");
        } else if (user.role === "GUIDE") {
          router.replace("/GuideHome");
        } else if (user.role === "HOTEL") {
          router.replace("/HotelHome");
        }
      } else {
        Alert.alert("Error", response.data.error || "Login failed");
      }
    } catch (error) {
      console.log("Login Error:", error.message);
      Alert.alert("Error", error.response?.data?.error || "Login failed");
    }
    setLoading(false);
  };

  return (
    <View className="flex-1 bg-white px-6 py-8 justify-center">
      {/* Header */}
      <View className="relative items-center justify-center mb-10">
        <Image
          source={require("../assets/images/Logo.png")}
          style={{ width: 40, height: 40, borderRadius: 40 }}
        />
        <Text className="text-2xl font-bold text-pink-700 mt-3">
          Welcome back
        </Text>
        <Text className="text-gray-600">Log in to your account</Text>
      </View>

      {/* Social Login Buttons */}
      <View className="flex-row justify-between space-x-3 mb-4">
        <TouchableOpacity className="bg-black px-10 py-3 rounded-lg">
          <Ionicons name="logo-apple" size={24} color="white" />
        </TouchableOpacity>
        <TouchableOpacity className="bg-blue-600 px-10 py-3 rounded-lg">
          <Ionicons name="logo-facebook" size={24} color="white" />
        </TouchableOpacity>
        <TouchableOpacity className="bg-gray-200 px-10 py-3 rounded-lg">
          <Ionicons name="logo-google" size={24} color="black" />
        </TouchableOpacity>
      </View>

      {/* Divider */}
      <View className="flex-row items-center justify-center my-4">
        <View className="flex-1 border-t border-gray-300" />
        <Text className="text-gray-500 mx-2">or</Text>
        <View className="flex-1 border-t border-gray-300" />
      </View>

      {/* Form Container */}
      <View className="bg-white ">
        <Text className="text-gray-700 font-semibold mb-6">
          Log in with your email address
        </Text>

        {/* Email */}
        <View className="mb-3">
          <Text className="text-gray-700">Email</Text>
          <TextInput
            className="border border-gray-300 rounded-lg p-3 bg-gray-100 mt-1"
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        {/* Password */}
        <View className="mb-3">
          <Text className="text-gray-700">Password</Text>
          <View className="relative">
            <TextInput
              className="border border-gray-300 rounded-lg p-3 bg-gray-100 mt-1 pr-10"
              placeholder="Password"
              secureTextEntry={!isPasswordVisible}
              value={password}
              onChangeText={setPassword}
              autoCapitalize="none"
            />
            <TouchableOpacity
              className="absolute right-3 top-4"
              onPress={() => setIsPasswordVisible(!isPasswordVisible)}
            >
              <Ionicons
                name={isPasswordVisible ? "eye" : "eye-off"}
                size={20}
                color="gray"
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Forgot Password */}
        <TouchableOpacity className="mb-6">
          <Text className="text-pink-700 text-sm font-semibold">
            Forgot your password?
          </Text>
        </TouchableOpacity>

        {/* Login Button */}
        <TouchableOpacity
          onPress={handleLogin}
          className="bg-pink-700 py-3 rounded-lg mb-6"
          disabled={loading}
        >
          <Text className="text-white text-center font-semibold">
            {loading ? "Logging in..." : "Log in"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Sign Up Link */}
      <View className="flex-row justify-center mt-4">
        <Text className="text-gray-600">Don't have an account?</Text>
        <TouchableOpacity onPress={() => router.push("/RegisterScreen")}>
          <Text className="text-pink-700 font-semibold ml-1">Create</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default LoginScreen;
