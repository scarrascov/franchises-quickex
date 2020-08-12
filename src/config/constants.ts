import { Platform } from "react-native";

const constants = {
  IS_ENV_DEVELOPMENT: __DEV__,
  IS_ANDROID: Platform.OS === "android",
  IS_IOS: Platform.OS === "ios",
  IS_DEBUG_MODE_ENABLED: Boolean(window.navigator.userAgent),
  API_URL: "https://new.quickex.cl/wp-json/",
  EMAIL_FIELD:"Correo Electrónico",
  PASSWD_FIELD:"Password"
};

export default constants;