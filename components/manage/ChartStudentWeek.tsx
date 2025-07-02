import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Svg, { G, Rect, Text as SvgText } from "react-native-svg";

export default function ChartStudentWeek() {
  const router = useRouter();
  // Dữ liệu chart (stacked bar theo thứ)
  const chartData = [
    { vcp: 3, vkp: 3, vp: 2 }, // Thứ 2
    { vcp: 3, vkp: 1, vp: 1 }, // Thứ 3
    { vcp: 3, vkp: 3, vp: 1 }, // Thứ 4
    { vcp: 0, vkp: 0, vp: 0 }, // Thứ 5
    { vcp: 0, vkp: 0, vp: 0 }, // Thứ 6
    { vcp: 0, vkp: 0, vp: 0 }, // Thứ 7
  ];
  const barColors = ["#3B4363", "#F9A825", "#2E8B8B"];
  const barLabels = ["VCP", "VKP", "Vi phạm"];
  const maxY = 8;
  const barWidth = 24;
  const barGap = 18;
  const chartHeight = 120;
  const days = ["Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7"];

  function getBarStack(bar: any) {
    let y0 = 0;
    return [
      { h: bar.vcp, color: barColors[0], y: y0, label: bar.vcp },
      { h: bar.vkp, color: barColors[1], y: (y0 += bar.vcp), label: bar.vkp },
      { h: bar.vp, color: barColors[2], y: (y0 += bar.vkp), label: bar.vp },
    ];
  }

  return (
    <View style={styles.wrap}>
      <View style={styles.card}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => router.push("/manage/list_activity?type=student")}> 
            <Text style={styles.cardTitle}>Biểu đồ hoạt động</Text>
          </TouchableOpacity>
          <MaterialIcons name="subdirectory-arrow-left" size={20} color="#3B4363" />
        </View>
        <View style={styles.chartWrap}>
          {/* Trục Y + line ngang */}
          <View style={{justifyContent: 'space-between', alignItems: 'flex-end', marginRight: 6, height: chartHeight}}>
            {[8,6,4,2,0].map((v, idx) => (
              <View key={v} style={{flexDirection: 'row', alignItems: 'center'}}>
                <Text style={styles.axisY}>{v}</Text>
                <View style={{height: 1, backgroundColor: '#BFC6D1', width: 170, marginLeft: 4, opacity: idx===4?0:1}} />
              </View>
            ))}
          </View>
          {/* Chart */}
          <View style={{position: 'absolute', left: 44, top: 0}}>
            <Svg width={barWidth*6 + barGap*5} height={chartHeight}>
              {chartData.map((bar, i) => {
                let stack = getBarStack(bar);
                let yOffset = 0;
                return (
                  <G key={i}>
                    {stack.map((seg, j) => {
                      const h = seg.h * chartHeight / maxY;
                      const y = chartHeight - yOffset - h;
                      yOffset += h;
                      if (seg.h === 0) return null;
                      return (
                        <G key={j}>
                          <Rect
                            x={i*(barWidth+barGap)}
                            y={y}
                            width={barWidth}
                            height={h}
                            fill={seg.color}
                            rx={0}
                          />
                          {/* Số trên bar, căn giữa ô */}
                          <SvgText
                            x={i*(barWidth+barGap) + barWidth/2}
                            y={y + h/2 + 6}
                            fontSize={16}
                            fontWeight="bold"
                            fill="#fff"
                            textAnchor="middle"
                            alignmentBaseline="middle"
                          >{seg.label}</SvgText>
                        </G>
                      );
                    })}
                  </G>
                );
              })}
            </Svg>
            {/* Nhãn trục X */}
            <View style={{flexDirection: 'row', justifyContent: 'space-between', width: barWidth*6 + barGap*5, marginTop: 2}}>
              {days.map((d, i) => (
                <Text key={i} style={styles.axisX}>{d}</Text>
              ))}
            </View>
          </View>
        </View>
        {/* Chú thích màu */}
        <View style={styles.legendRow}>
          {barLabels.map((label, i) => (
            <View key={label} style={styles.legendItem}>
              <View style={[styles.legendColor, {backgroundColor: barColors[i]}]} />
              <Text style={styles.legend}>{label}</Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'column',
    alignItems: 'center',
    width: '100%',
    marginTop: 8,
    marginHorizontal: 0,
  },
  card: {
    backgroundColor: '#D7DCE5',
    borderRadius: 22,
    padding: 18,
    width: '92%',
    minHeight: 120,
    marginBottom: 18,
    alignSelf: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 2,
  },
  cardTitle: {
    fontSize: 18,
    color: '#1A2343',
    fontWeight: '500',
    textDecorationLine: 'underline',
  },
  chartWrap: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    // backgroundColor: '#E6EAF2',
    borderRadius: 16,
    paddingVertical: 8,
    paddingLeft: 0,
    marginTop: 8,
    marginBottom: 0,
    minHeight: 150,
    position: 'relative',
  },
  axisY: {
    fontSize: 12,
    color: '#3B4363',
    marginBottom: 0,
    width: 32,
    textAlign: 'right',
  },
  axisX: {
    fontSize: 12,
    color: '#3B4363',
    width: 36,
    textAlign: 'center',
    marginHorizontal: 1,
  },
  legendRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    marginTop: 10,
    marginLeft: 8,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
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
    color: '#3B4363',
    marginLeft: 2,
  },
});
