import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { t } from 'react-native-tailwindcss';
import { useNavigation } from '@react-navigation/native'; // Import useNavigation
import * as DocumentPicker from 'expo-document-picker';
import { Link } from "expo-router";

const RegisterScreen = () => {
  const [userType, setUserType] = useState<string>('Tourist');
  const [document, setDocument] = useState<any>(null);
  const navigation = useNavigation(); // Initialize navigation

  const renderFormFields = () => {
    return (
      <View style={[t.bgWhite, t.p4, t.roundedLg, { width: '90%', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 3, elevation: 4 }]}>
        <TextInput
          placeholder="Email"
          style={[
            t.border,
            t.borderGray300,
            t.p4,
            t.roundedFull,
            { marginBottom: 16 },
            { backgroundColor: '#f9fafb' },
            { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 1.5, elevation: 2 },
          ]}
        />
        <TextInput
          placeholder="Name"
          style={[
            t.border,
            t.borderGray300,
            t.p4,
            t.roundedFull,
            { marginBottom: 16 },
            { backgroundColor: '#f9fafb' },
            { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 1.5, elevation: 2 },
          ]}
        />
        <TextInput
          placeholder="Password"
          secureTextEntry
          style={[
            t.border,
            t.borderGray300,
            t.p4,
            t.roundedFull,
            { marginBottom: 16 },
            { backgroundColor: '#f9fafb' },
            { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 1.5, elevation: 2 },
          ]}
        />
        {(userType === 'Guide' || userType === 'Hotel Owner') && (
          <TouchableOpacity
            style={[t.bgBlue500, t.p4, t.roundedFull, { marginBottom: 16 }, { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 3, elevation: 4 }]}
          >
            <Text style={[t.textWhite, t.textCenter, t.fontBold, t.textBase]}>
              {document ? 'Document Selected' : 'Upload Document'}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <View style={[t.flex1, t.justifyCenter, t.itemsCenter, t.p4, { backgroundColor: '#f3f4f6' }]}>
      <Text style={[t.text2xl, t.fontBold, t.textGray800, { marginBottom: 24 }]}>
        Create Account
      </Text>

      {/* User Type Selection */}
      <View
        style={[
          t.flexRow,
          t.justifyBetween,
          t.bgWhite,
          t.roundedFull,
          { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 3, elevation: 4 },
          t.p1,
          { marginBottom: 24 },
          { width: '90%' },
        ]}
      >
        {['Tourist', 'Guide', 'Hotel Owner'].map((type) => (
          <TouchableOpacity
            key={type}
            style={[
              t.flex1,
              t.p3,
              t.roundedFull,
              userType === type ? t.bgBlue500 : t.bgWhite,
              userType === type ? t.textWhite : t.textGray700,
              t.itemsCenter,
            ]}
            onPress={() => setUserType(type)}
          >
            <Text
              style={[
                userType === type ? t.textWhite : t.textGray800,
                t.fontBold,
                t.textCenter,
              ]}
            >
              {type}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Form Fields */}
      {renderFormFields()}

      {/* Submit Button */}
      <TouchableOpacity
        style={[
          t.bgPurple600,
          t.p4,
          t.roundedFull,
          { marginTop: 24 },
          { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 3, elevation: 4 },
          { width: '90%' },
        ]}
      >
        <Text style={[t.textWhite, t.textCenter, t.textLg, t.fontBold]}>
          Create Account
        </Text>
      </TouchableOpacity>

      {/* Login Information */}
      <View style={[{ marginTop: 24 }, t.itemsCenter]}>
      <Link
            href="/(auth)/LoginScreen"
            className="text-lg text-center text-general-200 mt-10"
          >
            <Text>Already have an account?</Text>
            <Text className="text-yellow-500">Login here</Text>
          </Link>
      </View>
    </View>
  );
};

export default RegisterScreen;
