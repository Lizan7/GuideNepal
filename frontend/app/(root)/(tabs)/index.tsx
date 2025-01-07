import { View, Text } from 'react-native';
import { Link } from 'expo-router';

export default function Home() {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <Text>Welcome to the Home Screen</Text>
      <Link href="/sign">Sign</Link>
      <Link href="/profile">Profile</Link>
      <Link href="/RegisterScreen">Register</Link>
    </View>
  );
}
