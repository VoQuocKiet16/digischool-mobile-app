import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import HeaderLayout from "../../components/layout/HeaderLayout";
import { fonts } from "../../utils/responsive";

const Security: React.FC = () => {
  const router = useRouter();

  const handleChangePassword = () => {
    router.push("/setting/change-password");
  };

  return (
    <HeaderLayout title="Bảo mật" onBack={() => router.back()}>
      <View style={styles.container}>
        <View style={styles.menuWrap}>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={handleChangePassword}
          >
            <View style={styles.menuIcon}>
              <Ionicons
                name="lock-closed-outline"
                size={28}
                color="#FFFFFF"
              />
            </View>
            <Text style={styles.menuText}>Đổi mật khẩu</Text>
            <Ionicons
              name="chevron-forward"
              size={22}
              color="#29375C"
              style={styles.menuArrow}
            />
          </TouchableOpacity>
        </View>
      </View>
    </HeaderLayout>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f7f7f7",
  },
  menuWrap: {
    borderRadius: 16,
    marginHorizontal: 15,
    marginTop: 20,
    paddingVertical: 8,
    gap: 8,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f7f7f7",
    borderRadius: 12,
    marginHorizontal: 8,
    marginVertical: 4,
    paddingVertical: 14,
    paddingHorizontal: 12,
  },
  menuIcon: {
    width: 50,
    height: 50,
    borderRadius: 10,
    backgroundColor: "#29375C",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  menuText: {
    flex: 1,
    fontSize: 18,
    color: "#29375C",
    fontWeight: "bold",
    fontFamily: fonts.semiBold,
  },
  menuArrow: {
    marginLeft: 8,
  },
});

export default Security; 