import React from "react";
import { ActivityIndicator, Modal, Text, View } from "react-native";

export default function LoadingModal({
  visible,
  text,
}: {
  visible: boolean;
  text?: string;
}) {
  return (
    <Modal
      visible={visible}
      transparent
      statusBarTranslucent={true}
      animationType="fade"
      onRequestClose={() => {}}
    >
      <View
        style={{
          flex: 1,
          backgroundColor: "rgba(0,0,0,0.18)",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <View
          style={{
            backgroundColor: "#fff",
            borderRadius: 16,
            padding: 32,
            alignItems: "center",
            minWidth: 180,
          }}
        >
          <ActivityIndicator size="large" color="#25345D" />
          <Text
            style={{
              marginTop: 16,
              fontFamily: "Baloo2-Medium",
              fontSize: 16,
              color: "#25345D",
            }}
          >
            {text || "Đang xử lý..."}
          </Text>
        </View>
      </View>
    </Modal>
  );
}
