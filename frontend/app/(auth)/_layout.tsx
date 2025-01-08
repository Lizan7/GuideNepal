import { Stack } from "expo-router";
import { StatusBar } from "react-native";
import "../global.css";
import Toast from "react-native-toast-message";

const Layout = () => {
  return (
    <>
      {/* Set StatusBar globally */}
      <StatusBar
        barStyle="dark-content" 
        backgroundColor="white" 
        translucent={false} 
      />
      {/* Define Stack Navigator */}
      <Stack>
        <Stack.Screen name="RegisterScreen" options={{ headerShown: false }} />
        <Stack.Screen name="LoginScreen" options={{ headerShown: false }} />
      </Stack>
      {/* Toast container */}
      <Toast />
    </>
  );
};

export default Layout;