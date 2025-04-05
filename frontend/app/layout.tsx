import { Stack } from "expo-router";
import { StatusBar } from "react-native";
import "./global.css";
import Toast from "react-native-toast-message";

const Layout = () => {
  return (
    <>
      {/* Status Bar Configuration */}
      <StatusBar
        barStyle="dark-content"
        backgroundColor="white"
        translucent={false}
      />

      {/* Define Stack Navigator */}
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="/LoginScreen" options={{ headerShown: false }} />
        <Stack.Screen name="/RegisterScreen" options={{ headerShown: false }} />
        <Stack.Screen name="/UserHome" options={{ headerShown: false }} />
        <Stack.Screen name="/GuideHome" options={{ headerShown: false }} />
        <Stack.Screen name="/GuideChat" options={{ headerShown: false }} />
        <Stack.Screen name="/GuideProfile" options={{ headerShown: false }} />
        <Stack.Screen name="/HotelHome" options={{ headerShown: false }} />
        <Stack.Screen name="/HotelProfile" options={{ headerShown: false }} />
        <Stack.Screen name="/HotelBook" options={{ headerShown: false }} />
        <Stack.Screen name="/UserSearch" options={{ headerShown: false }} />
        <Stack.Screen name="/UserBooking" options={{ headerShown: false }} />
        <Stack.Screen name="/UserChat" options={{ headerShown: false }} />
        <Stack.Screen name="/UserProfile" options={{ headerShown: false }} />
        <Stack.Screen name="/UserMenu" options={{ headerShown: false }} />
        <Stack.Screen name="/Booking" options={{ headerShown: false }} />
        <Stack.Screen name="/SpecificHotel" options={{ headerShown: false }} />
        <Stack.Screen name="/Chatbot" options={{ headerShown: false }} />
        <Stack.Screen name="/admin" options={{ headerShown: false }} />
        <Stack.Screen name="/UserPackage" options={{ headerShown: false }} />
        <Stack.Screen name="/GuidePackage" options={{ headerShown: false }} />
      </Stack>

      {/* Toast Notifications */}
      <Toast />
    </>
  );
};

export default Layout;
