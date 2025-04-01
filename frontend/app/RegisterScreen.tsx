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

const roles = ["USER", "HOTEL", "GUIDE"];

const SignUpScreen = () => {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("USER");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!name || !email || !password) {
      Alert.alert("Error", "All fields are required.");
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/register`, {
        name,
        email,
        password,
        role,
      });

      if (response.data.token) {
        await AsyncStorage.setItem("token", response.data.token);
        Alert.alert("Success", "Registration successful!");
        router.replace("/LoginScreen");
      } else {
        Alert.alert("Error", "Registration failed. Please try again.");
      }
    } catch (error: any) {
      console.error("Registration error:", error);
      if (error.response?.data?.error) {
        Alert.alert("Error", error.response.data.error);
      } else {
        Alert.alert("Error", "Registration failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-white px-6 py-8">
      {/* Header */}
      <View className="items-center mb-7 mt-12">
        <Image
          source={require("../assets/images/Logo.png")}
          style={{ width: 60, height: 60, borderRadius: 40 }}
        />
        <Text className="text-xl font-bold text-pink-700">
          Create an account
        </Text>
        <Text className="text-gray-500 text-center">
          Let's get you started! Please enter your details.
        </Text>
      </View>

      {/* Form Container */}
      <View className="bg-white py-2 mt-1">
        {/* Username */}
        <View className="mb-3">
          <Text className="text-gray-700">Username</Text>
          <TextInput
            className="border border-gray-300 rounded-lg p-3 bg-gray-100 mt-1"
            placeholder="Enter your username"
            placeholderTextColor="gray"
            value={name}
            onChangeText={setName}
          />
        </View>

        {/* Email */}
        <View className="mb-3">
          <Text className="text-gray-700">Email</Text>
          <TextInput
            className="border border-gray-300 rounded-lg p-3 bg-gray-100 mt-1"
            placeholder="Enter your email address"
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
              placeholder="Enter your password"
              placeholderTextColor="gray"
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

        {/* Role Selection */}
        <View className="mb-3">
          <Text className="text-gray-700">Role</Text>
          <TouchableOpacity
            onPress={() => setDropdownVisible(!dropdownVisible)}
            className="border border-gray-300 rounded-lg p-3 bg-gray-100 mt-1"
          >
            <Text className="text-black">{role}</Text>
          </TouchableOpacity>
          {dropdownVisible && (
            <View className="absolute bg-gray-100 border border-gray-300 rounded-md shadow-sm mt-2 z-10 w-full">
              {roles.map((item) => (
                <TouchableOpacity
                  key={item}
                  onPress={() => {
                    setRole(item);
                    setDropdownVisible(false);
                  }}
                  className="p-3"
                >
                  <Text className="text-black">{item}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Terms & Conditions */}
        <Text className="text-center text-gray-600 mt-5">
          By signing up, you accept our{" "}
          <Text className="text-pink-700 font-semibold">
            Terms & Conditions
          </Text>{" "}
          and{" "}
          <Text className="text-pink-700 font-semibold">Privacy Policy</Text>.
        </Text>

        {/* Sign Up Button */}
        <TouchableOpacity
          onPress={handleRegister}
          className="bg-pink-700 py-3 rounded-lg mt-5"
          disabled={loading}
        >
          <Text className="text-white text-center font-semibold">
            {loading ? "Signing up..." : "Join Us"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Back to Login */}
      <View className="mt-4 flex-row justify-center items-center">
        <Text className="text-gray-600 text-lg">Already have an account? </Text>
        <TouchableOpacity onPress={() => router.push("/LoginScreen")}>
          <Text className="text-pink-700 text-lg font-semibold">Login</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default SignUpScreen;
