import React, { useEffect, useRef, useState } from "react";
import { ScrollView, StyleSheet, Switch, Text, View } from "react-native";

interface RemindPickerProps {
  remind: boolean;
  setRemind: (value: boolean) => void;
  remindTime: string;
  setRemindTime: (value: string) => void;
  REMIND_OPTIONS: string[];
  ITEM_HEIGHT: number;
  PADDING_COUNT: number;
}

const RemindPicker: React.FC<RemindPickerProps> = ({
  remind,
  setRemind,
  remindTime,
  setRemindTime,
  REMIND_OPTIONS,
  ITEM_HEIGHT,
  PADDING_COUNT,
}) => {
  const scrollRef = useRef<ScrollView>(null);
  const [scrollingRemindTime, setScrollingRemindTime] = useState<string | null>(
    null
  );

  useEffect(() => {
    if (remind && scrollRef.current) {
      const idx = REMIND_OPTIONS.indexOf(remindTime);
      if (idx !== -1) {
        scrollRef.current.scrollTo({ y: idx * ITEM_HEIGHT, animated: true });
      }
    }
  }, [remindTime, remind]);

  const handleSnapToItem = (e: any) => {
    const offsetY = e.nativeEvent.contentOffset.y;
    let idx = Math.round(offsetY / ITEM_HEIGHT);
    idx = Math.max(0, Math.min(REMIND_OPTIONS.length - 1, idx));
    setRemindTime(REMIND_OPTIONS[idx]);
    setScrollingRemindTime(null);
  };

  const handleScroll = (e: any) => {
    const offsetY = e.nativeEvent.contentOffset.y;
    let idx = Math.round(offsetY / ITEM_HEIGHT);
    idx = Math.max(0, Math.min(REMIND_OPTIONS.length - 1, idx));
    setScrollingRemindTime(REMIND_OPTIONS[idx]);
  };

  // Các style động phụ thuộc ITEM_HEIGHT, PADDING_COUNT
  const pickerContainerStyle = {
    height: ITEM_HEIGHT * (PADDING_COUNT * 2 + 1),
    justifyContent: "center" as const,
    alignItems: "center" as const,
    marginTop: 8,
    marginBottom: 8,
    position: "relative" as const,
  };
  const pickerSelectedOverlayStyle = {
    position: "absolute" as const,
    top: ITEM_HEIGHT * PADDING_COUNT,
    left: 0,
    right: 0,
    height: ITEM_HEIGHT,
    justifyContent: "center" as const,
    alignItems: "center" as const,
    zIndex: 2,
  };
  const pickerSelectedItemStyle = {
    backgroundColor: "#AEB6C1",
    borderRadius: 16,
    width: "98%" as const,
    height: ITEM_HEIGHT,
    justifyContent: "center" as const,
    alignItems: "center" as const,
  };
  const remindOptionStyle = {
    height: ITEM_HEIGHT,
    justifyContent: "center" as const,
    alignItems: "center" as const,
  };

  return (
    <View style={styles.remindBoxCustom}>
      <Text style={styles.remindFloatingLabel}>Nhắc nhở</Text>
      <View style={styles.remindRow}>
      <Text style={styles.remindText}>
        {remind
          ? scrollingRemindTime !== null
            ? scrollingRemindTime
            : remindTime
          : "Không nhắc nhỡ"}
        </Text>
        <Switch
          value={remind}
          onValueChange={setRemind}
          trackColor={{ false: "#ccc", true: "#29375C" }}
          thumbColor={remind ? "#fff" : "#f4f3f4"}
          ios_backgroundColor="#ccc"
          style={styles.remindSwitch}
        />
      </View>
      {/* Chỉ hiện phần chọn thời gian khi remind = true */}
      {remind && (
        <View style={pickerContainerStyle}>
          {/* Overlay item chọn */}
          <View style={pickerSelectedOverlayStyle} pointerEvents="none">
            <View style={pickerSelectedItemStyle}>
              <Text style={styles.pickerSelectedText}>
                {scrollingRemindTime !== null
                  ? scrollingRemindTime
                  : remindTime}
              </Text>
            </View>
          </View>
          {/* ScrollView các lựa chọn */}
          <ScrollView
            ref={scrollRef}
            style={styles.remindOptionsList}
            showsVerticalScrollIndicator={false}
            snapToInterval={ITEM_HEIGHT}
            decelerationRate="fast"
            contentContainerStyle={{
              paddingTop: ITEM_HEIGHT * PADDING_COUNT,
              paddingBottom: ITEM_HEIGHT * PADDING_COUNT,
            }}
            onMomentumScrollEnd={handleSnapToItem}
            onScroll={handleScroll}
            scrollEventThrottle={16}
            scrollEnabled={remind}
          >
            {REMIND_OPTIONS.map((option) => (
              <View key={option} style={remindOptionStyle}>
                <Text
                  style={
                    option === remindTime
                      ? [styles.remindOptionText, { opacity: 0 }]
                      : styles.remindOptionText
                  }
                >
                  {option}
                </Text>
              </View>
            ))}
          </ScrollView>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  remindBoxCustom: {
    borderWidth: 1,
    borderColor: "#29375C",
    borderRadius: 12,
    backgroundColor: "#f7f7f7",
    paddingTop: 15,
    paddingBottom: 12,
    paddingHorizontal: 25,
    marginLeft: 15,
    marginRight: 15,
    marginBottom: 25,
    marginTop: 8,
    position: "relative",
    minHeight: 50, // Giảm chiều cao cho phù hợp
  },
  remindFloatingLabel: {
    position: "absolute",
    top: -16,
    left: 18,
    backgroundColor: "#f7f7f7",
    paddingHorizontal: 6,
    fontSize: 14,
    color: "#29375C",
    fontFamily: "Baloo2-SemiBold",
    zIndex: 2,
  },
  remindRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  remindSwitch: {
    zIndex: 2,
  },
  remindText: {
    color: "#29375C",
    fontFamily: "Baloo2-Medium",
    fontSize: 16,
  },
  pickerSelectedText: {
    color: "#29375C",
    fontFamily: "Baloo2-Medium",
    fontSize: 17,
  },
  remindOptionsList: {
    width: "100%",
  },
  remindOptionText: {
    color: "#B6B6B6",
    fontSize: 17,
    fontFamily: "Baloo2-Medium",
    fontWeight: "400",
  },
});

export default RemindPicker;
