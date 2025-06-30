import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TextStyle,
  TouchableOpacity,
  View,
} from "react-native";

interface HeaderLayoutProps {
  title: string;
  onBack?: () => void;
  rightIcon?: React.ReactNode;
  onRightIconPress?: () => void;
  children?: React.ReactNode;
  style?: TextStyle;
  subtitle?: string;
}

const HeaderLayout: React.FC<HeaderLayoutProps> = ({
  title,
  subtitle,
  onBack,
  rightIcon,
  onRightIconPress,
  children,
  style,
}) => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={onBack}
          style={styles.backBtn}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="chevron-back" size={24} color="#25345D" />
        </TouchableOpacity>
        <View style={styles.titleContainer}>
          <Text style={[styles.title, style]} numberOfLines={1}>
            {title}
          </Text>
          {subtitle && (
            <Text style={styles.subtitle} numberOfLines={2}>
              {subtitle}
            </Text>
          )}
        </View>
        {rightIcon ? (
          <TouchableOpacity
            onPress={onRightIconPress}
            style={styles.rightBtn}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            {rightIcon}
          </TouchableOpacity>
        ) : (
          <View style={{ width: 24 }} />
        )}
      </View>
      <View style={{ height: 1, backgroundColor: "#FFFFFF", width: "100%" }} />
      {children}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f7f7f7",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 16,
    paddingBottom: 16,
    paddingHorizontal: 16,
    backgroundColor: "#f7f7f7",
  },
  backBtn: {
    width: 32,
    height: 32,
    justifyContent: "center",
    alignItems: "center",
  },
  rightBtn: {
    width: 32,
    height: 32,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "transparent",
    borderRadius: 16,
  },
  titleContainer: {
    flex: 1,
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    minHeight: 44,
  },
  title: {
    textAlign: "center",
    fontSize: 28,
    fontWeight: "bold",
    color: "#25345D",
    marginBottom: 2,
    maxWidth: "100%",
    fontFamily: "Baloo2-Bold",
  },
  subtitle: {
    textAlign: "center",
    fontSize: 14,
    color: "#25345D",
    fontWeight: "500",
    marginTop: 0,
    maxWidth: "100%",
    fontFamily: "Baloo2-Medium",
  },
});

export default HeaderLayout;
