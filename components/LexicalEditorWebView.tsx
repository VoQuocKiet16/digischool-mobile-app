import React, { useEffect, useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import { WebView } from 'react-native-webview';

interface LexicalEditorWebViewProps {
  value?: string;
  onChange?: (text: string) => void;
  height?: number;
}

const LexicalEditorWebView = ({ value, onChange, height = 220 }: LexicalEditorWebViewProps) => {
  const webviewRef = useRef<WebView>(null);
  const initialValue = useRef(value);

  // Gửi nội dung từ RN vào WebView khi value thay đổi
  useEffect(() => {
    if (webviewRef.current && value !== undefined && value !== null) {
      webviewRef.current.postMessage(value);
    }
  }, [value]);

  return (
    <View style={[styles.container, { height }]}> 
      <WebView
        ref={webviewRef}
        originWhitelist={['*']}
        source={require('../assets/lexical-editor.html')}
        onMessage={event => {
          if (onChange) onChange(event.nativeEvent.data);
        }}
        javaScriptEnabled
        domStorageEnabled
        style={styles.webview}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { borderRadius: 12, overflow: 'hidden', backgroundColor: '#fff' },
  webview: { flex: 1, backgroundColor: 'transparent' },
});

export default LexicalEditorWebView; 