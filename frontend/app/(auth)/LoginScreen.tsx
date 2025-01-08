import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import React from 'react';
import { TailwindProvider } from 'tailwindcss-react-native';
import { useNavigation } from '@react-navigation/native';
import { Link } from "expo-router";

const navigation = useNavigation();

const LoginScreen = () => {
  return (
    <TailwindProvider>
      <View className="flex-1 bg-white justify-center items-center">
        {/* Header Section */}
        <Text className="text-2xl font-bold text-gray-800 mb-2">Welcome to GuideNepal!</Text>
        <Text className="text-sm text-gray-500 mb-8">Sign in to your account</Text>

        {/* Email Input */}
        <View className="w-4/5 mb-4">
          <TextInput
            placeholder="Enter your email address"
            keyboardType="email-address"
            className="p-4 border border-gray-300 rounded-lg bg-gray-100 text-gray-800 shadow-sm"
          />
        </View>

        {/* Password Input */}
        <View className="w-4/5 mb-4">
          <TextInput
            placeholder="Enter your password"
            secureTextEntry
            className="p-4 border border-gray-300 rounded-lg bg-gray-100 text-gray-800 shadow-sm"
          />
        </View>

        {/* Forgot Password Link */}
        <View className="w-4/5 flex-row justify-end mb-6"> {/* Added flex-row and justify-end */}
          <TouchableOpacity>
            <Text className="text-sm text-blue-500">Forgot Password?</Text>
          </TouchableOpacity>
        </View>

        {/* Sign-In Button */}
        <TouchableOpacity className="w-4/5 bg-blue-500 py-4 rounded-lg shadow-lg items-center">
          <Text className="text-white text-lg font-bold">Login</Text>
        </TouchableOpacity>

        {/* Register Link */}
        <View className="flex-row mt-6">
        <Link
            href="/(auth)/RegisterScreen"
            className="text-lg text-center text-general-200 mt-10"
          >
            <Text>Don't have an account?</Text>
            <Text className="text-yellow-500"> Sign Up</Text>
          </Link>
        </View>
      </View>
    </TailwindProvider>
  );
};

export default LoginScreen;
