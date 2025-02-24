import React, { useState, useRef, useMemo } from "react";
import { View, Text, TouchableOpacity, Image, Alert } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import BottomSheet from "@gorhom/bottom-sheet";
import { GestureHandlerRootView } from "react-native-gesture-handler";

const GuideProfile = () => {
  const router = useRouter();
  const bottomSheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ["50%"], []); // Define snap points

  const [guideDetails, setGuideDetails] = useState({
    name: "John Doe",
    email: "johndoe@gmail.com",
    location: "Kathmandu, Nepal",
    phoneNumber: "+977 9812345678",
    specialization: "Mountain Trekking",
    profileImage: null,
    verificationImage: null,
  });

  // Handle image selection
  const handleImageChange = async (imageType: string) => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setGuideDetails((prevDetails) => ({
        ...prevDetails,
        [imageType]: result.assets[0].uri,
      }));
    }
  };

  // Handle form submission (static alert for now)
  const handleSubmit = () => {
    if (!guideDetails.profileImage || !guideDetails.verificationImage) {
      Alert.alert(
        "Error",
        "Please upload both profile and verification images."
      );
      return;
    }
    Alert.alert("Success", "Guide details updated successfully!");
    bottomSheetRef.current?.close(); // Close Bottom Sheet after submission
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View className="flex-1 bg-gray-100">
        {/* Header */}
        <View className="flex-row items-center p-4 bg-[#3B82F6] gap-4">
          <TouchableOpacity onPress={() => router.replace("/GuideHome")}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text className="font-bold text-lg text-white">Profile</Text>
        </View>

        {/* Profile Card */}
        <View className="bg-white py-6 rounded-lg">
          <View className="justify-center items-center">
            <TouchableOpacity onPress={() => handleImageChange("profileImage")}>
              {guideDetails.profileImage ? (
                <Image
                  source={{ uri: guideDetails.profileImage }}
                  className="w-32 h-32 rounded-full"
                />
              ) : (
                <View className="w-24 h-24 rounded-full bg-gray-300 items-center justify-center">
                  <Ionicons name="camera-outline" size={40} color="white" />
                </View>
              )}
            </TouchableOpacity>
            <Text className="text-xl font-bold mt-4">{guideDetails.name}</Text>
          </View>
          <View className="mt-10 w-fit flex gap-16">
            <View className="flex-row gap-20 justify-around">
              <Text>Email</Text>
              <Text className="text-gray-600">{guideDetails.email}</Text>
            </View>
            <View className="flex-row gap-20 justify-around">
              <Text>Address</Text>
              <Text className="text-gray-600">{guideDetails.location}</Text>
            </View>
            <View className="flex-row gap-20 justify-around">
              <Text>Contact</Text>
              <Text className="text-gray-600">{guideDetails.phoneNumber}</Text>
            </View>
            <View className="flex-row gap-20 justify-around">
              <Text>Speciality</Text>
              <Text className="text-gray-600">
                {guideDetails.specialization}
              </Text>
            </View>
            <View className="flex-row gap-20 justify-around">
              <Text>Status</Text>
              <Text className="text-gray-600">Unverified</Text>
            </View>
          </View>

          {/* Verify Button */}
          <TouchableOpacity
            className="bg-blue-500 px-6 py-3 rounded-lg mt-14 w-[310px] ml-12"
            onPress={() => bottomSheetRef.current?.expand()} // Open Bottom Sheet
          >
            <Text className="text-white font-semibold text-center">Verify</Text>
          </TouchableOpacity>
        </View>

        {/* Bottom Sheet (Verification) */}
        <BottomSheet
          ref={bottomSheetRef}
          snapPoints={snapPoints} // Use defined snap points
          enablePanDownToClose
          index={-1} // Initially closed
        >
          <View className="p-6">
            <Text className="text-xl font-bold text-gray-900 mb-4">
              Verify Guide
            </Text>

            <TouchableOpacity
              onPress={() => handleImageChange("verificationImage")}
              className="mb-4"
            >
              <Text className="text-lg text-blue-600">
                Select Verification Image
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="bg-green-500 px-6 py-3 rounded-lg mt-4"
              onPress={handleSubmit}
            >
              <Text className="text-white font-semibold text-center">
                Submit
              </Text>
            </TouchableOpacity>
          </View>
        </BottomSheet>
      </View>
    </GestureHandlerRootView>
  );
};

export default GuideProfile;
