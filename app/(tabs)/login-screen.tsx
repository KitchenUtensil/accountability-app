import { View, Text, TextInput } from "react-native";
import { useState } from "react";
import { StyleSheet } from "react-native";

export default function LoginScreen() {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [smsCode, setSMSCode] = useState("");
  const [username, setUserName] = useState("");

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: "#fff",
      padding: 20,
    },
    input: {
      backgroundColor: "#f5f5f5",
      borderRadius: 8,
      padding: 16,
      fontSize: 16,
      marginBottom: 20,
    },
  });

  return (
    <View style={styles.container}>
      <Text>Hello Hi This is a Login Screne</Text>
      <TextInput value={phoneNumber} onChangeText={setPhoneNumber}></TextInput>
      <TextInput value={smsCode} onChangeText={setSMSCode}></TextInput>
      <TextInput value={username} onChangeText={setUserName}></TextInput>
    </View>
  );
}
