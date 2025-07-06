import { MaterialIcons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import Svg, { Rect } from "react-native-svg";

export default function ChartSchoolTopday() {
  // Dữ liệu mẫu
  const total = 1200;
  const students = 1100;
  const teachers = 70;
  const managers = 30;
  const checkedIn = 67;
  const totalTeachers = 70;

  // Dữ liệu chart (stacked bar)
  const chartData = [
    { k10: 300, k11: 400, k12: 400 },
    { k10: 320, k11: 390, k12: 390 },
    { k10: 310, k11: 410, k12: 380 },
    { k10: 305, k11: 405, k12: 390 },
    { k10: 315, k11: 395, k12: 390 },
  ];
  const barColors = ["#4B5B8C", "#F9A825", "#2E8B8B"];
  const barLabels = ["Khối 10", "Khối 11", "Khối 12"];
  const maxY = 1200;
  const barWidth = 28;
  const barGap = 22;
  const chartHeight = 120;

  // Tính toạ độ cột
  function getBarStack(bar: any, idx: number) {
    let y0 = 0;
    return [
      { h: bar.k10, color: barColors[0], y: y0 },
      { h: bar.k11, color: barColors[1], y: (y0 += bar.k10) },
      { h: bar.k12, color: barColors[2], y: (y0 += bar.k11) },
    ];
  }

  return (
    <View style={styles.wrap}>
      {/* Card 1 */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>
          <Text style={styles.linkText}>Sĩ số toàn trường</Text>
        </Text>
        <View style={{flexDirection: 'row', alignItems: 'flex-end', marginTop: 2}}>
          <Text style={styles.bigNumber}>1.200</Text>
          <Text style={styles.unitText}>người</Text>
        </View>
        <View style={styles.row3}>
          <View style={styles.col3}><Text style={styles.label3}>Học sinh{"\n"}<Text style={styles.bold3}>1.100</Text></Text></View>
          <View style={styles.col3}><Text style={styles.label3}>Giáo viên{"\n"}<Text style={styles.bold3}>70</Text></Text></View>
          <View style={styles.col3}><Text style={styles.label3}>Quản lý{"\n"}<Text style={styles.bold3}>30</Text></Text></View>
        </View>
      </View>
      {/* Card 2 */}
      <View style={styles.card}>
        <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start'}}>
          <Text style={styles.cardTitle}><Text style={styles.linkText}>Sĩ số giáo viên điểm danh</Text></Text>
          <MaterialIcons name="subdirectory-arrow-left" size={20} color="#4B5B8C" style={{marginTop: 2}} />
        </View>
        <View style={{flexDirection: 'row', alignItems: 'flex-end', marginTop: 2}}>
          <Text style={styles.bigNumber2}>67/70</Text>
          <Text style={styles.unitText}>người</Text>
        </View>
      </View>
      {/* Card 3: Chart */}
      <View style={[styles.card, {marginTop: 0, paddingBottom: 18}]}> 
        <Text style={styles.cardTitle}><Text style={styles.linkText}>Biểu đồ học sinh</Text> <Text style={styles.orange}>SÁNG</Text></Text>
        <View style={styles.chartWrap}>
          {/* Trục Y + line ngang */}
          <View style={{justifyContent: 'space-between', alignItems: 'flex-end', marginRight: 6, height: chartHeight}}>
            {[1200,900,600,300,0].map((v, idx) => (
              <View key={v} style={{flexDirection: 'row', alignItems: 'center'}}>
                <Text style={styles.axisY}>{v}</Text>
                <View style={{height: 1, backgroundColor: '#BFC6D1', width: 210, marginLeft: 4, opacity: idx===4?0:1}} />
              </View>
            ))}
          </View>
          {/* Chart */}
          <View style={{position: 'absolute', left: 44, top: 0}}>
            <Svg width={barWidth*5 + barGap*4} height={chartHeight}>
              {chartData.map((bar, i) => {
                let stack = getBarStack(bar, i);
                let yOffset = 0;
                return stack.map((seg, j) => {
                  const h = seg.h * chartHeight / maxY;
                  const y = chartHeight - yOffset - h;
                  yOffset += h;
                  return (
                    <Rect
                      key={i+"-"+j}
                      x={i*(barWidth+barGap)}
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
            <View style={{flexDirection: 'row', justifyContent: 'space-between', width: barWidth*5 + barGap*4, marginTop: 2}}>
              {[1,2,3,4,5].map(i => (
                <Text key={i} style={styles.axisX}>{`Tiết ${i}`}</Text>
              ))}
            </View>
            {/* Mũi tên phải */}
            <MaterialIcons name="chevron-right" size={22} color="#4B5B8C" style={{position: 'absolute', right: -28, top: chartHeight/2-12}} />
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
    borderRadius: 26,
    padding: 22,
    width: '92%',
    minHeight: 120,
    marginBottom: 18,
    alignSelf: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 18,
    color: '#4B5B8C',
    fontWeight: '500',
    marginBottom: 2,
  },
  linkText: {
    textDecorationLine: 'underline',
    color: '#4B5B8C',
    fontWeight: '500',
  },
  bigNumber: {
    fontSize: 44,
    color: '#1A2343',
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  bigNumber2: {
    fontSize: 38,
    color: '#1A2343',
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  unitText: {
    fontSize: 16,
    color: '#4B5B8C',
    marginLeft: 6,
    marginBottom: 6,
  },
  row3: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  col3: {
    flex: 1,
    alignItems: 'center',
  },
  label3: {
    fontSize: 15,
    color: '#4B5B8C',
    textAlign: 'center',
  },
  bold3: {
    fontWeight: 'bold',
    color: '#1A2343',
    fontSize: 17,
  },
  axisY: {
    fontSize: 12,
    color: '#4B5B8C',
    marginBottom: 0,
  },
  axisX: {
    fontSize: 14,
    color: '#4B5B8C',
    width: 38,
    textAlign: 'center',
    marginHorizontal: 1,
  },
  orange: {
    color: '#F9A825',
    fontWeight: 'bold',
    fontSize: 16,
  },
  legend: {
    fontSize: 13,
    color: '#4B5B8C',
    marginLeft: 2,
  },
  chartWrap: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    // backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 8,
    paddingLeft: 0,
    marginTop: 8,
    marginBottom: 0,
    minHeight: 150,
    position: 'relative',
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
});
