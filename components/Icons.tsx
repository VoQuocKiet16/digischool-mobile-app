import { Feather, FontAwesome, MaterialIcons } from '@expo/vector-icons';
import React from 'react';

export const Icons = {
  MaterialIcons,
  FontAwesome,
  Feather,
};

interface IconProps {
  type: any;
  name: string;
  color: string;
  size?: number;
}

const Icon: React.FC<IconProps> = ({ type, name, color, size = 24 }) => {
  const IconComponent = type;
  return <IconComponent name={name} size={size} color={color} />;
};

export default Icon; 