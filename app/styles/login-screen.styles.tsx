import { StyleSheet,
    ViewStyle,
    TextStyle,
 } from 'react-native';

// Styles
// Define types for styles
interface Styles {
    gradientBackground: ViewStyle;
    container: ViewStyle;
    headerContainer: ViewStyle;
    title: TextStyle;
    subtitle: TextStyle;
    formCard: ViewStyle;
    inputContainer: ViewStyle;
    inputLabel: TextStyle;
    phoneInputContainer: ViewStyle;
    countryCodeButton: ViewStyle;
    countryCodeText: TextStyle;
    phoneInput: TextStyle;
    input: TextStyle;
    buttonContainer: ViewStyle;
    button: ViewStyle;
    resendButton: ViewStyle;
    buttonText: TextStyle;
  }

const styles = StyleSheet.create<Styles>({
    gradientBackground: {
      flex: 1,
    },
    container: {
      flex: 1,
      justifyContent: "center",
      paddingHorizontal: 24,
    },
    headerContainer: {
      marginBottom: 20,
      alignItems: "center",
    },
    title: {
      fontSize: 32,
      fontWeight: "bold",
      color: "#fff",
      marginBottom: 4,
    },
    subtitle: {
      fontSize: 16,
      color: "#f5f5f5",
    },
    formCard: {
      backgroundColor: "white",
      borderRadius: 16,
      padding: 20,
      marginVertical: 20,
      marginHorizontal: 10,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.1,
      shadowRadius: 6,
      elevation: 3,
    },
    inputContainer: {
      marginBottom: 16,
    },
    inputLabel: {
      fontSize: 14,
      fontWeight: "600",
      marginBottom: 6,
      color: "#333",
    },
    phoneInputContainer: {
      flexDirection: "row",
      height: 50,
    },
    countryCodeButton: {
      backgroundColor: "#f0f0f0",
      borderWidth: 1,
      borderColor: "#dcdcdc",
      borderRadius: 8,
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: 16,
      width: 80,
      marginRight: 8,
    },
    countryCodeText: {
      fontSize: 16,
      color: "#333",
      fontWeight: "500",
    },
    phoneInput: {
      flex: 1,
      backgroundColor: "#f0f0f0",
      borderRadius: 8,
      paddingHorizontal: 14,
      fontSize: 16,
      borderWidth: 1,
      borderColor: "#dcdcdc",
      color: "#333",
    },
    input: {
      backgroundColor: "#f0f0f0",
      borderRadius: 8,
      paddingHorizontal: 14,
      paddingVertical: 12,
      fontSize: 16,
      borderWidth: 1,
      borderColor: "#dcdcdc",
      color: "#333",
      height: 50,
    },
    buttonContainer: {
      marginTop: 8,
    },
    button: {
      backgroundColor: "#5E72E4",
      borderRadius: 8,
      paddingVertical: 14,
      alignItems: "center",
      marginBottom: 10,
    },
    resendButton: {
      backgroundColor: "#6c757d",
    },
    buttonText: {
      color: "#fff",
      fontSize: 16,
      fontWeight: "600",
    },
  });

  export default styles;