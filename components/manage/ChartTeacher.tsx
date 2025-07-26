import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Svg, { G, Rect, Text as SvgText } from "react-native-svg";

export default function ChartTeacher() {
  const router = useRouter();
  // Dữ liệu chart (stacked bar theo thứ)
  const chartData = [
    { daythay: 3, doitt: 3, daybu: 2 }, // Thứ 2
    { daythay: 3, doitt: 1, daybu: 1 }, // Thứ 3
    { daythay: 3, doitt: 3, daybu: 1 }, // Thứ 4
    { daythay: 0, doitt: 0, daybu: 0 }, // Thứ 5
    { daythay: 0, doitt: 0, daybu: 0 }, // Thứ 6
    { daythay: 0, doitt: 0, daybu: 0 }, // Thứ 7
  ];
  const barColors = ["#3B4363", "#F9A825", "#2E8B8B"];
  const barLabels = ["Dạy thay", "Đổi tiết", "Dạy bù"];
  const maxY = 8;
  const barWidth = 24;
  const barGap = 18;
  const chartHeight = 120;
  const days = ["T2", "T3", "T4", "T5", "T6", "T7"];

  function getBarStack(bar: any) {
    let y0 = 0;
    return [
      { h: bar.daythay, color: barColors[0], y: y0, label: bar.daythay },
      {
        h: bar.doitt,
        color: barColors[1],
        y: (y0 += bar.daythay),
        label: bar.doitt,
      },
      {
        h: bar.daybu,
        color: barColors[2],
        y: (y0 += bar.doitt),
        label: bar.daybu,
      },
    ];
  }

  return (
    <View style={styles.wrap}>
      {/* Card 1: Biểu đồ hoạt động */}
      <View style={styles.card}>
        <View style={styles.headerRow}>
          <TouchableOpacity
            onPress={() => router.push("/manage/list_activity?type=teacher")}
          >
            <Text style={styles.cardTitle}>
              <Text style={[styles.linkText, { textDecorationLine: "underline" }]}>Biểu đồ hoạt động</Text>
            </Text>
          </TouchableOpacity>
        </View>
        <View style={styles.chartWrap}>
          {/* Trục Y + line ngang */}
          <View
            style={{
              justifyContent: "space-between",
              alignItems: "flex-end",
              marginRight: 6,
              height: chartHeight,
            }}
          >
            {[8, 6, 4, 2, 0].map((v, idx) => (
              <View
                key={v}
                style={{ flexDirection: "row", alignItems: "center" }}
              >
                <Text style={styles.axisY}>{v}</Text>
                <View
                  style={{
                    height: 1,
                    backgroundColor: "#BFC6D1",
                    width: 170,
                    marginLeft: 4,
                    opacity: idx === 4 ? 0 : 1,
                  }}
                />
              </View>
            ))}
          </View>
          {/* Chart */}
          <View style={{ position: "absolute", left: 44, top: 0 }}>
            <Svg width={barWidth * 6 + barGap * 5} height={chartHeight}>
              {chartData.map((bar, i) => {
                let stack = getBarStack(bar);
                let yOffset = 0;
                return (
                  <G key={i}>
                    {stack.map((seg, j) => {
                      const h = (seg.h * chartHeight) / maxY;
                      const y = chartHeight - yOffset - h;
                      yOffset += h;
                      if (seg.h === 0) return null;
                      return (
                        <G key={j}>
                          <Rect
                            x={i * (barWidth + barGap)}
                            y={y}
                            width={barWidth}
                            height={h}
                            fill={seg.color}
                            rx={0}
                          />
                          {/* Số trên bar, căn giữa ô */}
                          <SvgText
                            x={i * (barWidth + barGap) + barWidth / 2}
                            y={y + h / 2 + 6}
                            fontSize={16}
                            fontWeight="bold"
                            fill="#fff"
                            textAnchor="middle"
                            alignmentBaseline="middle"
                          >
                            {seg.label}
                          </SvgText>
                        </G>
                      );
                    })}
                  </G>
                );
              })}
            </Svg>
            {/* Nhãn trục X */}
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                width: barWidth * 6 + barGap * 5,
                marginTop: 2,
              }}
            >
              {days.map((d, i) => (
                <Text key={i} style={styles.axisX}>
                  {d}
                </Text>
              ))}
            </View>
          </View>
        </View>
        {/* Chú thích màu */}
        <View style={styles.legendRow}>
          {barLabels.map((label, i) => (
            <View key={label} style={styles.legendItem}>
              <View
                style={[styles.legendColor, { backgroundColor: barColors[i] }]}
              />
              <Text style={styles.legend}>{label}</Text>
            </View>
          ))}
        </View>
      </View>
      {/* Card 2: Vắng có phép */}
      <View style={styles.card}>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => router.push("/manage/attended?type=teacher")}
          style={{ flex: 1 }}
        >
          <Text style={styles.cardTitle}>
            <Text style={[styles.linkText, { textDecorationLine: "underline" }]}>Vắng có phép</Text>
          </Text>
          <View
            style={{
              flexDirection: "row",
              alignItems: "flex-end",
              marginTop: 2,
              justifyContent: "center",
            }}
          >
            <Text style={styles.bigNumber2}>3</Text>
            <Text style={styles.unitText}>người</Text>
          </View>
        </TouchableOpacity>
      </View>
      {/* Card 3: Vắng không phép */}
      <View style={styles.card}>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => router.push("/manage/absence?type=teacher")}
          style={{ flex: 1 }}
        >
          <Text style={styles.cardTitle}>
            <Text style={[styles.linkText, { textDecorationLine: "underline" }]}>Vắng không phép</Text>
          </Text>
          <View
            style={{
              flexDirection: "row",
              alignItems: "flex-end",
              marginTop: 2,
              justifyContent: "center",
            }}
          >
            <Text style={styles.bigNumber2}>3</Text>
            <Text style={styles.unitText}>người</Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: "column",
    alignItems: "center",
    width: "100%",
    marginTop: 8,
    paddingBottom: 100,
    paddingHorizontal: 12,
  },
  card: {
    backgroundColor: "#D7DCE5",
    borderRadius: 26,
    padding: 22,
    width: "92%",
    minHeight: 120,
    marginBottom: 18,
    alignSelf: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 2,
  },
  cardTitle: {
    fontSize: 20,
    marginBottom: 2,
  },
  linkText: {
    color: "#29375C",
    fontFamily: "Baloo2-Regular",
  },
  chartWrap: {
    flexDirection: "row",
    alignItems: "flex-start",
    borderRadius: 16,
    paddingVertical: 8,
    paddingLeft: 0,
    marginTop: 8,
    marginBottom: 0,
    minHeight: 150,
    position: "relative",
  },
  axisY: {
    fontSize: 12,
    color: "#29375C",
    fontFamily: "Baloo2-Regular",
    marginBottom: 0,
    width: 32,
    textAlign: "right",
  },
  axisX: {
    fontSize: 14,
    color: "#29375C",
    fontFamily: "Baloo2-Regular",
    width: 28,
    textAlign: "center",
  },
  legendRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
    marginLeft: 8,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 24,
  },
  legendColor: {
    width: 22,
    height: 12,
    borderRadius: 3,
    marginRight: 6,
  },
  legend: {
    fontSize: 13,
    color: "#29375C",
    fontFamily: "Baloo2-Regular",
    marginLeft: 2,
  },
  centerBox: {
    alignItems: "center",
    marginTop: 8,
  },
  bigNumber: {
    fontSize: 44,
    color: "#1A2343",
    fontWeight: "bold",
    letterSpacing: 1,
    marginBottom: -2,
  },
  unitText: {
    fontSize: 18,
    color: "#29375C",
    fontFamily: "Baloo2-Regular",
    marginLeft: 6,
    marginBottom: 6,
  },
  bigNumber2: {
    fontSize: 55,
    color: "#29375C",
    fontFamily: "Baloo2-Bold",
    letterSpacing: 1,
  },
});
