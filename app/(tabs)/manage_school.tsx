import { MaterialIcons } from "@expo/vector-icons";
import React, { useState } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Header from "../../components/Header";
import ChartSchoolTopday from "../../components/manage/ChartSchoolTopday";
import ChartSchoolWeek from "../../components/manage/ChartSchoolWeek";

const FILTERS = ["Toàn trường", "Giáo viên", "Học sinh"];
const SUB_FILTERS = ["Hôm nay", "Tuần này"];

export default function ManageSchool() {
  const [filter, setFilter] = useState(0);
  const [subFilter, setSubFilter] = useState(0);

  // Lấy ngày giờ hiện tại
  const now = new Date();
  const weekdays = ["chủ nhật", "thứ hai", "thứ ba", "thứ tư", "thứ năm", "thứ sáu", "thứ bảy"];
  const pad = (n: number) => n < 10 ? `0${n}` : n;
  const timeStr = `${pad(now.getHours())}:${pad(now.getMinutes())}'`;
  const dateStr = `${weekdays[now.getDay()]}, ${pad(now.getDate())}/${pad(now.getMonth()+1)}/${now.getFullYear()}`;

  return (
    <View style={{flex: 1}}>
      <Header title="Quản lý trường học" />
      <ScrollView contentContainerStyle={{paddingBottom: 24}} showsVerticalScrollIndicator={false}>
        <View style={styles.container}>
          <View style={styles.row}>
            <TouchableOpacity style={styles.arrowBtn} onPress={() => setFilter((filter + FILTERS.length - 1) % FILTERS.length)}>
              <MaterialIcons name="chevron-left" size={24} color="#215562" />
            </TouchableOpacity>
            <Text style={styles.title}>{FILTERS[filter]}</Text>
            <TouchableOpacity style={styles.arrowBtn} onPress={() => setFilter((filter + 1) % FILTERS.length)}>
              <MaterialIcons name="chevron-right" size={24} color="#215562" />
            </TouchableOpacity>
          </View>
          <View style={styles.filterRow}>
            {FILTERS.map((item, idx) => (
              <TouchableOpacity
                key={item}
                style={[styles.filterBtn, filter === idx && styles.filterBtnActive]}
                onPress={() => setFilter(idx)}
                activeOpacity={0.7}
              >
                <Text style={[styles.filterText, filter === idx && styles.filterTextActive]}>{item}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <View style={styles.subFilterRow}>
            {SUB_FILTERS.map((item, idx) => (
              <TouchableOpacity
                key={item}
                style={styles.subFilterBtn}
                onPress={() => setSubFilter(idx)}
                activeOpacity={0.7}
              >
                <Text style={[styles.subFilterText, subFilter === idx && styles.subFilterTextActive]}>{item}</Text>
                {subFilter === idx && <View style={styles.underline} />}
              </TouchableOpacity>
            ))}
          </View>
          <View style={styles.timeRow}>
            <MaterialIcons name="access-time" size={18} color="#215562" style={{marginRight: 4}} />
            <Text style={styles.timeText}>{timeStr}, {dateStr}</Text>
          </View>
        </View>
        {/* Hiển thị chart khi filter là Toàn trường và subFilter là Hôm nay */}
        {filter === 0 && subFilter === 0 && (
          <ChartSchoolTopday />
        )}
        {/* Hiển thị chart tuần khi filter là Toàn trường và subFilter là Tuần này */}
        {filter === 0 && subFilter === 1 && (
          <ChartSchoolWeek />
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    // backgroundColor: '#F7F8FA',
    flex: 1,
    alignItems: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  arrowBtn: {
    padding: 4,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#22304A',
    fontFamily: 'Baloo2-Bold',
    marginHorizontal: 12,
    letterSpacing: 0.5,
  },
  filterRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 6,
    marginTop: 2,
  },
  filterBtn: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
    marginHorizontal: 2,
  },
  filterBtnActive: {
    backgroundColor: '#E6EEF2',
  },
  filterText: {
    fontSize: 18,
    color: '#22304A',
    fontFamily: 'Baloo2-SemiBold',
  },
  filterTextActive: {
    color: '#215562',
    fontWeight: '700',
  },
  subFilterRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 8,
    marginTop: 2,
  },
  subFilterBtn: {
    alignItems: 'center',
    marginHorizontal: 12,
    paddingBottom: 2,
  },
  subFilterText: {
    fontSize: 16,
    color: '#22304A',
    fontFamily: 'Baloo2-Medium',
  },
  subFilterTextActive: {
    color: '#215562',
    fontWeight: '700',
  },
  underline: {
    height: 2,
    backgroundColor: '#215562',
    width: 32,
    marginTop: 2,
    borderRadius: 1,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  timeText: {
    fontSize: 16,
    color: '#22304A',
    fontFamily: 'Baloo2-Medium',
  },
});
