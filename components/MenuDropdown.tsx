import { responsiveValues } from '@/utils/responsive';
import React from 'react';
import { Dimensions, StyleSheet, Text, View } from 'react-native';
import {
  Menu,
  MenuOption,
  MenuOptions,
  MenuTrigger,
  renderers,
} from 'react-native-popup-menu';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

const { Popover } = renderers;
const { width } = Dimensions.get('window');

interface MenuItem {
  id: string;
  title: string;
  onPress?: () => void;
  disabled?: boolean;
}

interface MenuDropdownProps {
  anchorText?: string;
  items: MenuItem[];
  anchorStyle?: any;
  style?: any;
  anchorIcon?: string;
  anchorIconSize?: number;
  anchorIconColor?: string;
}

export default function MenuDropdown({ 
  anchorText = "Show menu", 
  items, 
  anchorStyle,
  style,
  anchorIcon = "menu",
  anchorIconSize = responsiveValues.iconSize.lg,
  anchorIconColor = "#29375C"
}: MenuDropdownProps) {
  const handleItemPress = (item: MenuItem) => {
    if (item.onPress && !item.disabled) {
      item.onPress();
    }
  };

  return (
    <View style={[styles.container, style]}>
      <Menu 
        renderer={Popover} 
        rendererProps={{ 
          placement: 'bottom', // Luôn hiển thị bên dưới
          preferredPlacement: 'bottom',
          anchorStyle: styles.anchorStyle,
          openAnimationDuration: 200,
          closeAnimationDuration: 150,
        }}
        onSelect={(value) => {
          const item = items.find(item => item.id === value);
          if (item && item.onPress && !item.disabled) {
            item.onPress();
          }
        }}
      >
        <MenuTrigger 
          customStyles={{
            triggerWrapper: {
              padding: responsiveValues.padding.sm,
              minWidth: responsiveValues.iconSize.xxxxl + responsiveValues.padding.md,
              minHeight: responsiveValues.iconSize.xxxxl + responsiveValues.padding.md,
              justifyContent: 'center',
              alignItems: 'center',
              
            }
          }}
          style={anchorStyle}
        >
          <MaterialIcons 
            name={anchorIcon} 
            size={anchorIconSize} 
            color={anchorIconColor}
          />
        </MenuTrigger>
        <MenuOptions customStyles={{
          optionsContainer: {
            backgroundColor: '#29375C',
            borderRadius: responsiveValues.borderRadius.md,
            padding: responsiveValues.padding.s,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.25,
            shadowRadius: 4,
            elevation: 5,
            minWidth: 120,
            maxWidth: 300,
     
          }
        }}>
          {items.map((item, index) => (
            <React.Fragment key={item.id}>
              <MenuOption
                value={item.id}
                disabled={item.disabled}
                customStyles={{
                  optionWrapper: {
                    padding: responsiveValues.padding.md,
                    minHeight: responsiveValues.iconSize.xl + responsiveValues.padding.s,
                    opacity: item.disabled ? 0.5 : 1,
                  }
                }}
              >
                <Text style={styles.menuItemText}>
                  {item.title}
                </Text>
              </MenuOption>
              {index < items.length - 1 && <View style={styles.divider} />}
            </React.Fragment>
          ))}
        </MenuOptions>
      </Menu>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  anchorStyle: {
    backgroundColor: '#29375C',
  },
  menuItemText: {
    color: '#fff',
    fontSize: responsiveValues.fontSize.sm,
    fontFamily: 'Baloo2-Medium',
  },
  divider: {
    height: 1,
    backgroundColor: '#4A5568',
    marginVertical: responsiveValues.padding.s,
  },
}); 