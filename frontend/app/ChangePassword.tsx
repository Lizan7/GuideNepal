import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

const ChangePassword = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const router = useRouter();

  // Handle password change submission
  const handleChangePassword = () => {
    if (!email || !password || !confirmPassword) {
      Alert.alert("Error", "All fields are required!");
      return;
    }
    if (password.length < 6) {
      Alert.alert("Error", "Password must be at least 6 characters long!");
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match!");
      return;
    }
    Alert.alert("Success", "Password changed successfully!");
  };

  return (
    <View className="flex-1 bg-white px-6 py-8">
      <View className="flex-row items-center gap-5">
        <TouchableOpacity onPress={() => router.replace("/UserMenu")}>
          <Ionicons name="chevron-back-outline" size={24} color="black" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-gray-800">Change Password</Text>
      </View>

      <View className="mt-24">
        {/* Email Input */}
        <Text className="text-lg font-bold text-gray-800 mb-2">Email</Text>
        <TextInput
          className="border border-gray-300 rounded-lg px-4 py-3 mb-4"
          placeholder="Enter your email"
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
        />

        {/* Password Input */}
        <Text className="text-lg font-bold text-gray-800 mb-2">
          New Password
        </Text>
        <View className="border border-gray-300 rounded-lg flex-row items-center px-4 py-3 mb-4">
          <TextInput
            className="flex-1"
            placeholder="Enter new password"
            secureTextEntry={!showPassword}
            value={password}
            onChangeText={setPassword}
          />
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
            <Ionicons
              name={showPassword ? "eye" : "eye-off"}
              size={24}
              color="gray"
            />
          </TouchableOpacity>
        </View>

        {/* Confirm Password Input */}
        <Text className="text-lg font-bold text-gray-800 mb-2">
          Confirm Password
        </Text>
        <View className="border border-gray-300 rounded-lg flex-row items-center px-4 py-3 mb-6">
          <TextInput
            className="flex-1"
            placeholder="Re-enter new password"
            secureTextEntry={!showConfirmPassword}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
          />
          <TouchableOpacity
            onPress={() => setShowConfirmPassword(!showConfirmPassword)}
          >
            <Ionicons
              name={showConfirmPassword ? "eye" : "eye-off"}
              size={24}
              color="gray"
            />
          </TouchableOpacity>
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          onPress={handleChangePassword}
          className="bg-pink-600 py-3 rounded-lg"
        >
          <Text className="text-lg font-bold text-white text-center">
            Change Password
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default ChangePassword;
