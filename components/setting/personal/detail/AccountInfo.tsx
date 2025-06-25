import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const AccountInfo: React.FC = () => {
  const [showInfo, setShowInfo] = useState(true);

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Thông tin tài khoản</Text>
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
        <View style={styles.item}>
          <Text style={styles.label}>Trạng thái tài khoản</Text>
          <Text style={styles.valueActive}>Hoạt động</Text>
          <View style={styles.underline} />
        </View>
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
  valueActive: {
    color: '#4CAF50',
    fontSize: 15,
    position: 'absolute',
    right: 0,
    top: 0,
    fontWeight: 'bold',
  },
  underline: {
    height: 3,
    backgroundColor: '#FFA726',
    marginTop: 16,
    borderRadius: 2,
  },
});

export default AccountInfo;
