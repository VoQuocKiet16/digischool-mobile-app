import { useTheme } from '@react-navigation/native';
import React, { useEffect, useRef } from 'react';
import { Dimensions, StyleSheet, TouchableOpacity, View } from 'react-native';
import * as Animatable from 'react-native-animatable';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Colors from '../constants/Colors';
import { responsive } from '../utils/responsive';
import Icon from './Icons';

const { width } = Dimensions.get('window');

interface TabItem {
  route: string;
  label: string;
  type: any;
  icon: string;
}

interface AnimatedTabBarProps {
  tabs: TabItem[];
  currentRoute: string;
  onTabPress: (route: string) => void;
  visible: boolean;
}

const animate1: any = { 0: { scale: .5, translateY: 7 }, .92: { translateY: -34 }, 1: { scale: 1.2, translateY: -24 } };
const animate2: any = { 0: { scale: 1.2, translateY: -24 }, 1: { scale: 1, translateY: 7 } };
const circle1: any = { 0: { scale: 0 }, 0.3: { scale: .9 }, 0.5: { scale: .2 }, 0.8: { scale: .7 }, 1: { scale: 1 } };
const circle2: any = { 0: { scale: 1 }, 1: { scale: 0 } };

const TabButton: React.FC<{
  item: TabItem;
  onPress: () => void;
  focused: boolean;
}> = ({ item, onPress, focused }) => {
  const viewRef = useRef<Animatable.View>(null);
  const circleRef = useRef<Animatable.View>(null);
  const textRef = useRef<Animatable.Text>(null);
  const { colors } = useTheme();
  
  const color = Colors.black; // Luôn sử dụng màu đen cho text
  const bgColor = Colors.white; // Luôn sử dụng màu trắng cho background

  useEffect(() => {
    if (focused) {
      viewRef.current?.animate(animate1);
      circleRef.current?.animate(circle1);
      textRef.current?.transitionTo({ scale: 1 } as any);
    } else {
      viewRef.current?.animate(animate2);
      circleRef.current?.animate(circle2);
      textRef.current?.transitionTo({ scale: 0 } as any);
    }
  }, [focused]);

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={1}
      style={styles.container}>
      <Animatable.View
        ref={viewRef}
        duration={200}
        style={styles.container}>
        <View style={[styles.btn, { borderColor: bgColor, backgroundColor: bgColor }]}>
          <Animatable.View
            ref={circleRef}
            style={styles.circle} />
          <Icon 
            type={item.type} 
            name={item.icon} 
            color={focused ? Colors.white : Colors.primary} 
            size={focused ? (responsive.isIPad() ? responsive.iconSize(22) : responsive.iconSize(18)) : (responsive.isIPad() ? responsive.iconSize(42) : responsive.iconSize(24))}
          />
        </View>
        <Animatable.Text
          ref={textRef}
          style={[styles.text, { color }]}>
          {item.label}
        </Animatable.Text>
      </Animatable.View>
    </TouchableOpacity>
  );
};

const AnimatedTabBar: React.FC<AnimatedTabBarProps> = ({ 
  tabs, 
  currentRoute, 
  onTabPress, 
  visible 
}) => {
  const insets = useSafeAreaInsets();
  
  if (!visible) return null;

  return (
    <View style={[styles.tabBar, { paddingBottom: insets.bottom }]}>
      {tabs.map((tab) => (
        <TabButton
          key={tab.route}
          item={tab}
          focused={currentRoute === tab.route}
          onPress={() => onTabPress(tab.route)}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    height: responsive.isIPad() ? 80 : 70, // Cao hơn cho iPad
  },
  tabBar: {
    height: responsive.isIPad() ? 110 : 60, // Cao hơn cho iPad
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.white, // Luôn sử dụng màu trắng
    flexDirection: 'row',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  btn: {
    width: responsive.isIPad() ? 50 : 40, // Lớn hơn cho iPad
    height: responsive.isIPad() ? 50 : 40, // Lớn hơn cho iPad
    borderRadius: responsive.isIPad() ? 30 : 25, // Border radius tương ứng
    borderWidth: responsive.isIPad() ? 5 : 4, // Border dày hơn cho iPad
    borderColor: Colors.white,
    backgroundColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center'
  },
  circle: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    borderRadius: responsive.isIPad() ? 30 : 25, // Border radius tương ứng
  },
  text: {
    fontSize: responsive.isIPad() ? responsive.fontSize(10) : 8, // Font size lớn hơn cho iPad
    textAlign: 'center',
    color: Colors.primary,
    fontWeight: '500',
    marginTop: responsive.isIPad() ? 6 : 4, // Margin lớn hơn cho iPad
  }
});

export default AnimatedTabBar; 