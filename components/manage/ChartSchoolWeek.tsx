import React from "react";
import { StyleSheet, Text, View } from "react-native";
import Svg, { Rect } from "react-native-svg";

export default function ChartSchoolWeek() {
  // Dữ liệu chart (stacked bar theo thứ)
  const chartData = [
    { hs: 400, gv: 200, ql: 200 },
    { hs: 420, gv: 210, ql: 210 },
    { hs: 410, gv: 220, ql: 210 },
    { hs: 430, gv: 200, ql: 210 },
    { hs: 440, gv: 210, ql: 210 },
    { hs: 420, gv: 220, ql: 210 },
    { hs: 450, gv: 210, ql: 210 },
  ];
  const barColors = ["#4B5B8C", "#F9A825", "#2E8B8B"];
  const barLabels = ["Học sinh", "Giáo viên", "Quản lý"];
  const maxY = 1200;
  const barWidth = 24;
  const barGap = 16;
  const chartHeight = 120;
  const days = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];

  function getBarStack(bar: any) {
    let y0 = 0;
    return [
      { h: bar.hs, color: barColors[0], y: y0 },
      { h: bar.gv, color: barColors[1], y: (y0 += bar.hs) },
      { h: bar.ql, color: barColors[2], y: (y0 += bar.gv) },
    ];
  }

  return (
    <View style={styles.wrap}>
      {/* Card 1: Biểu đồ sĩ số */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>
          <Text style={styles.linkText}>Biểu đồ sĩ số</Text>
        </Text>
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
            {[1200, 900, 600, 300, 0].map((v, idx) => (
              <View
                key={v}
                style={{ flexDirection: "row", alignItems: "center" }}
              >
                <Text style={styles.axisY}>{v}</Text>
                <View
                  style={{
                    height: 1,
                    backgroundColor: "#BFC6D1",
                    width: 270,
                    marginLeft: 4,
                    opacity: idx === 4 ? 0 : 1,
                  }}
                />
              </View>
            ))}
          </View>
          {/* Chart */}
          <View style={{ position: "absolute", left: 44, top: 0 }}>
            <Svg width={barWidth * 7 + barGap * 6} height={chartHeight}>
              {chartData.map((bar, i) => {
                let stack = getBarStack(bar);
                let yOffset = 0;
                return stack.map((seg, j) => {
                  const h = (seg.h * chartHeight) / maxY;
                  const y = chartHeight - yOffset - h;
                  yOffset += h;
                  return (
                    <Rect
                      key={i + "-" + j}
                      x={i * (barWidth + barGap)}
                      y={y}
                      width={barWidth}
                      height={h}
                      fill={seg.color}
                      rx={0}
                    />
                  );
                });
              })}
            </Svg>
            {/* Nhãn trục X */}
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                width: barWidth * 7 + barGap * 6,
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
      <View style={{ marginBottom: 18, alignSelf: "flex-start", marginLeft: 20 }}>
        <Text style={{ fontSize: 24, color: "#29375C", fontFamily: "Baloo2-SemiBold" }}>Trong tuần này</Text>
      </View>
      {/* Card 2: Tỉ lệ học sinh hoàn thành */}
      <View style={[styles.card, { flexDirection: "row", justifyContent: "space-between", alignItems: "center" }]}>
        <Text style={styles.percentLabel}>Tỉ lệ học sinh hoàn thành</Text>
        <Text style={styles.percentValue}>80%</Text>
      </View>
      {/* Card 3: Tỉ lệ giáo viên hoàn thành */}
      <View style={[styles.card, { flexDirection: "row", justifyContent: "space-between", alignItems: "center" }]}>
        <Text style={styles.percentLabel}>Tỉ lệ giáo viên hoàn thành</Text>
        <Text style={styles.percentValue}>80%</Text>
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
    minHeight: 100,
    marginBottom: 18,
    alignSelf: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
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
  percentLabel: {
    fontSize: 18,
    color: "#29375C",
    fontFamily: "Baloo2-Medium",
  },
  percentValue: {
    fontSize: 40,
    color: "#F9A825",
    fontFamily: "Baloo2-Bold",
    letterSpacing: 1,
  },
});
