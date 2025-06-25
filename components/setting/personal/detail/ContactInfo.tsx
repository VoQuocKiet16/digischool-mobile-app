import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const ContactInfo: React.FC = () => {
  const [showInfo, setShowInfo] = useState(true);

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Thông tin liên hệ</Text>
        <TouchableOpacity onPress={() => setShowInfo(v => !v)}>
          <Ionicons
            name={showInfo ? 'chevron-down' : 'chevron-forward'}
            size={24}
            color="#A3A7AC"
            style={styles.icon}
          />
        </TouchableOpacity>
      </View>
      {showInfo && (
        <>
          <View style={styles.item}>
            <Text style={styles.label}>Số điện thoại</Text>
            <Text style={styles.value}>Chưa cập nhật</Text>
            <View style={styles.underline} />
          </View>
          <View style={styles.item}>
            <Text style={styles.label}>Email</Text>
            <Text style={styles.value}>exampl@gmail.com</Text>
            <View style={styles.underline} />
          </View>
          <View style={styles.item}>
            <Text style={styles.label}>Địa chỉ</Text>
            <Text style={styles.value}>Ninh Kieu, Can Tho</Text>
            <View style={styles.underline} />
          </View>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#f7f7f7',
    borderRadius: 12,
    margin: 10,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#25345D',
    flex: 1,
  },
  icon: {
    marginLeft: 6,
  },
  item: {
    marginBottom: 2,
    paddingVertical: 6,
    position: 'relative',
  },
  label: {
    color: '#25345D',
    fontWeight: 'bold',
    fontSize: 15,
    marginBottom: 0,
  },
  value: {
    color: '#A3A7AC',
    fontSize: 15,
    position: 'absolute',
    right: 0,
    top: 0,
    fontWeight: '500',
  },
  underline: {
    height: 3,
    backgroundColor: '#FFA726',
    marginTop: 16,
    borderRadius: 2,
  },
});

export default ContactInfo;