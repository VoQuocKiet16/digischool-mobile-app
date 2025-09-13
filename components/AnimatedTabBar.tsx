import { useTheme } from '@react-navigation/native';
import React, { useEffect } from 'react';
import { Dimensions, StyleSheet, TouchableOpacity, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming
} from 'react-native-reanimated';
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

// Animation configurations for reanimated
const ANIMATION_DURATION = 200;

const TabButton: React.FC<{
  item: TabItem;
  onPress: () => void;
  focused: boolean;
}> = ({ item, onPress, focused }) => {
  const { colors } = useTheme();
  
  // Shared values for animations
  const scale = useSharedValue(focused ? 1.2 : 1);
  const translateY = useSharedValue(focused ? -24 : 7);
  const circleScale = useSharedValue(focused ? 1 : 0);
  const textScale = useSharedValue(focused ? 1 : 0);
  
  const color = Colors.black; // Luôn sử dụng màu đen cho text
  const bgColor = Colors.white; // Luôn sử dụng màu trắng cho background

  useEffect(() => {
    if (focused) {
      scale.value = withSpring(1.2, { damping: 15, stiffness: 150 });
      translateY.value = withTiming(-24, { duration: ANIMATION_DURATION });
      circleScale.value = withSpring(1, { damping: 15, stiffness: 150 });
      textScale.value = withTiming(1, { duration: ANIMATION_DURATION });
    } else {
      scale.value = withSpring(1, { damping: 15, stiffness: 150 });
      translateY.value = withTiming(7, { duration: ANIMATION_DURATION });
      circleScale.value = withSpring(0, { damping: 15, stiffness: 150 });
      textScale.value = withTiming(0, { duration: ANIMATION_DURATION });
    }
  }, [focused]);

  // Animated styles
  const animatedButtonStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { scale: scale.value },
        { translateY: translateY.value }
      ]
    };
  });

  const animatedCircleStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: circleScale.value }]
    };
  });

  const animatedTextStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: textScale.value }],
      opacity: textScale.value
    };
  });

  const iconSize = focused 
    ? (responsive.isIPad() ? responsive.iconSize(22) : responsive.iconSize(18))
    : (responsive.isIPad() ? responsive.iconSize(42) : responsive.iconSize(24));

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={1}
      style={styles.container}>
      <Animated.View
        style={[styles.container, animatedButtonStyle]}>
        <View style={[styles.btn, { borderColor: bgColor, backgroundColor: bgColor }]}>
          <Animated.View
            style={[styles.circle, animatedCircleStyle]} />
          <Icon 
            type={item.type} 
            name={item.icon} 
            color={focused ? Colors.white : Colors.primary} 
            size={iconSize}
          />
        </View>
        <Animated.Text
          style={[styles.text, { color }, animatedTextStyle]}>
          {item.label}
        </Animated.Text>
      </Animated.View>
    </TouchableOpacity>
  );
};

const AnimatedTabBar: React.FC<AnimatedTabBarProps> = ({ 
  tabs, 
  currentRoute, 
  onTabPress, 
  visible 
}) => {
  if (!visible) return null;

  return (
    <View style={styles.tabBar}>
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
    height: responsive.isIPad() ? 110 : 90, // Cao hơn cho iPad
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