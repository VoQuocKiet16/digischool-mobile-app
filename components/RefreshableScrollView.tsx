import React, { useCallback, useState } from "react";
import { RefreshControl, ScrollView, ScrollViewProps } from "react-native";

interface RefreshableScrollViewProps extends ScrollViewProps {
  onRefresh: () => Promise<void>;
  colors?: string[];
  tintColor?: string;
}

const RefreshableScrollView: React.FC<RefreshableScrollViewProps> = ({
  onRefresh,
  colors = ["#29375C"],
  tintColor = "#29375C",
  children,
  ...scrollViewProps
}) => {
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await onRefresh();
    } catch (error) {
      console.log("Refresh error:", error);
    } finally {
      setRefreshing(false);
    }
  }, [onRefresh]);

  return (
    <ScrollView
      {...scrollViewProps}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={handleRefresh}
          colors={colors}
          tintColor={tintColor}
        />
      }
    >
      {children}
    </ScrollView>
  );
};

export default RefreshableScrollView;
