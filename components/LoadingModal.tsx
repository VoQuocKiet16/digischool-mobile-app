import { MaterialIcons } from "@expo/vector-icons";
import React, { useEffect, useRef } from "react";
import { ActivityIndicator, Animated, Modal, Text, View } from "react-native";

export default function LoadingModal({
  visible,
  text,
  success = false,
}: {
  visible: boolean;
  text?: string;
  success?: boolean;
}) {
  const scaleAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (success) {
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.2,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [success]);

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
            borderRadius: 20,
            padding: 24,
            alignItems: "center",
            minWidth: 200,
          }}
        >
          {success ? (
            <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
              <MaterialIcons name="check-circle" size={54} color="#29375C" />
            </Animated.View>
          ) : (
            <ActivityIndicator size="large" color="#29375C" />
          )}
          <Text
            style={{
              marginTop: 16,
              fontFamily: "Baloo2-Medium",
              fontSize: 16,
              color: "#29375C",
            }}
          >
            {text || "Đang xử lý..."}
          </Text>
        </View>
      </View>
    </Modal>
  );
}
