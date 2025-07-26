import { Ionicons } from "@expo/vector-icons";
import { useFonts } from "expo-font";
import React from "react";
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { fonts, responsiveValues } from "../../utils/responsive";

interface HeaderLayoutProps {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  rightIcon?: React.ReactNode;
  onRightIconPress?: () => void;
  children: React.ReactNode;
  style?: any;
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
  const [loaded] = useFonts({
    "Baloo2-Bold": require("../../assets/fonts/Baloo2-Bold.ttf"),
    "Baloo2-Medium": require("../../assets/fonts/Baloo2-Medium.ttf"),
    // Có thể thêm các font khác nếu cần
  });

  if (!loaded) return null;

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={onBack}
          style={styles.backBtn}
          hitSlop={{ 
            top: responsiveValues.padding.sm, 
            bottom: responsiveValues.padding.sm, 
            left: responsiveValues.padding.sm, 
            right: responsiveValues.padding.sm 
          }}
        >
          <Ionicons 
            name="chevron-back" 
            size={responsiveValues.iconSize.lg} 
            color="#29375C" 
          />
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
            hitSlop={{ 
              top: responsiveValues.padding.sm, 
              bottom: responsiveValues.padding.sm, 
              left: responsiveValues.padding.sm, 
              right: responsiveValues.padding.sm 
            }}
          >
            {rightIcon}
          </TouchableOpacity>
        ) : (
          <View style={{ width: responsiveValues.iconSize.lg }} />
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
    paddingTop: responsiveValues.padding.md,
    paddingBottom: responsiveValues.padding.md,
    paddingHorizontal: responsiveValues.padding.md,
    backgroundColor: "#f7f7f7",
    marginTop: responsiveValues.padding.md,
  },
  backBtn: {
    width: responsiveValues.iconSize.xl,
    height: responsiveValues.iconSize.xl,
    justifyContent: "center",
    alignItems: "center",
  },
  rightBtn: {
    width: responsiveValues.iconSize.xl,
    height: responsiveValues.iconSize.xl,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "transparent",
    borderRadius: responsiveValues.borderRadius.xl,
  },
  titleContainer: {
    flex: 1,
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    minHeight: responsiveValues.iconSize.xl,
  },
  title: {
    textAlign: "center",
    fontSize: responsiveValues.fontSize.xxxl,
    color: "#29375C",
    marginBottom: responsiveValues.padding.xs,
    maxWidth: "100%",
    fontFamily: fonts.bold,
  },
  subtitle: {
    textAlign: "center",
    fontSize: responsiveValues.fontSize.sm,
    color: "#29375C",
    marginTop: 0,
    maxWidth: "100%",
    fontFamily: fonts.medium,
  },
});

export default HeaderLayout;
