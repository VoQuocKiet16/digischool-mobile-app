import { FontAwesome } from '@expo/vector-icons';
import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import PlusIcon from '../PlusIcon';

const allStudents = [
  'Nguyen Van A',
  'Nguyen Van B',
  'Nguyen Van C',
  'Nguyen Van D',
];

const Student_Test = () => {
  const [showCard, setShowCard] = useState(false);
  const [testList, setTestList] = useState<string[]>(['Nguyen Van A']);
  const [dropdownIndex, setDropdownIndex] = useState<number | null>(null);
  const [scoreList, setScoreList] = useState<(string | number)[]>(['']);

  const handleAddTest = () => {
    setTestList([...testList, '']);
    setScoreList([...scoreList, '']);
  };

  const handleRemoveTest = (index: number) => {
    setTestList(testList.filter((_, i) => i !== index));
    setScoreList(scoreList.filter((_, i) => i !== index));
  };

  const handleSelectStudent = (student: string, index: number) => {
    const newList = [...testList];
    newList[index] = student;
    setTestList(newList);
    setDropdownIndex(null);
  };

  const handleScoreChange = (text: string, index: number) => {
    // Chỉ cho phép nhập số, rỗng hoặc 1-10
    let value = text.replace(/[^0-9]/g, '');
    if (value === '') {
      setScoreList(list => {
        const newList = [...list];
        newList[index] = '';
        return newList;
      });
      return;
    }
    let num = parseInt(value, 10);
    if (num < 1) num = 1;
    if (num > 10) num = 10;
    setScoreList(list => {
      const newList = [...list];
      newList[index] = num;
      return newList;
    });
  };

  const openDropdown = (index: number) => {
    setDropdownIndex(index);
  };

  return (
    <View>
      {!showCard ? (
        <PlusIcon onPress={() => setShowCard(true)} text="Thêm học sinh kiểm tra" />
      ) : (
        <View style={styles.card}>
          <View style={styles.headerRow}>
            <View style={styles.headerBar} />
            <Text style={styles.headerText}>Kiểm tra miệng</Text>
            <TouchableOpacity style={styles.closeBtn} onPress={() => setShowCard(false)}>
              <View style={styles.closeCircle}>
                <FontAwesome name="close" size={22} color="#fff" />
              </View>
            </TouchableOpacity>
          </View>
          {testList.map((item, index) => (
            <View key={index} style={styles.testRow}>
              <View style={{flex: 1, position: 'relative', flexDirection: 'column', alignItems: 'flex-start'}}>
                <TouchableOpacity
                  style={styles.testInputWrap}
                  activeOpacity={0.8}
                  onPress={() => openDropdown(index)}
                >
                  <View style={{flexDirection: 'row', alignItems: 'center', width: '100%'}}>
                    <Text style={styles.testText}>{item || 'Chọn học sinh kiểm tra'}</Text>
                    {item && (
                      <View style={styles.scoreInputBox}>
                        <TextInput
                          style={styles.scoreInput}
                          placeholder="Nhập điểm"
                          placeholderTextColor="#C4C4C4"
                          keyboardType="numeric"
                          value={scoreList[index]?.toString() || ''}
                          onChangeText={text => handleScoreChange(text, index)}
                          maxLength={2}
                        />
                      </View>
                    )}
                    <FontAwesome name={dropdownIndex === index ? 'chevron-up' : 'chevron-down'} size={22} color="#fff" style={{marginLeft: 8}} />
                  </View>
                </TouchableOpacity>
                {dropdownIndex === index && (
                  <View style={styles.dropdown}>
                    {allStudents.map(student => (
                      <TouchableOpacity
                        key={student}
                        style={styles.dropdownItem}
                        onPress={() => handleSelectStudent(student, index)}
                      >
                        <Text style={styles.dropdownItemText}>{student}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>
              <TouchableOpacity
                style={{alignSelf: 'flex-start', marginLeft: 8, backgroundColor: 'transparent'}}
                onPress={() => handleRemoveTest(index)}
              >
                <FontAwesome name="close" size={22} color="#F04438" />
              </TouchableOpacity>
            </View>
          ))}
          <PlusIcon onPress={handleAddTest} text="Thêm học sinh kiểm tra" />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    width: '98%',
    backgroundColor: '#E9EBF0',
    borderRadius: 16,
    padding: 18,
    marginBottom: 18,
    marginTop: 8,
    alignSelf: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  headerBar: {
    width: 4,
    height: 28,
    backgroundColor: '#F9A825',
    borderRadius: 2,
    marginRight: 10,
  },
  headerText: {
    color: '#26324D',
    fontWeight: '700',
    fontSize: 20,
    flex: 1,
  },
  closeBtn: {
    marginLeft: 8,
  },
  closeCircle: {
    backgroundColor: '#F04438',
    borderRadius: 16,
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  testRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  testInputWrap: {
    backgroundColor: '#A0A3BD',
    borderRadius: 20,
    paddingVertical: 18,
    paddingHorizontal: 18,
    width: '100%',
    flexDirection: 'column',
    alignItems: 'flex-start',
    marginTop: 0,
  },
  testText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'Baloo 2',
    marginBottom: 0,
  },
  scoreInputBox: {
    backgroundColor: '#7D88A7',
    borderRadius: 12,
    marginLeft: 12,
    paddingVertical: 4,
    paddingHorizontal: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scoreInput: {
    backgroundColor: 'transparent',
    color: 'rgba(255,255,255,0.7)',
    fontSize: 14,
    fontWeight: '500',
    paddingVertical: 0,
    paddingHorizontal: 0,
    minWidth: 40,
    textAlign: 'center',
  },
  dropdown: {
    marginTop: 10,
    backgroundColor: '#fff',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
    paddingVertical: 4,
    maxHeight: 180,
    width: '100%',
  },
  dropdownItem: {
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  dropdownItemText: {
    fontSize: 16,
    color: '#22315B',
  },
});

export default Student_Test;
