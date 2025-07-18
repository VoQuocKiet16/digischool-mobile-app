import React, { useEffect, useRef, useState } from "react";
import { Keyboard, StyleSheet, View } from "react-native";
import { WebView } from "react-native-webview";

interface LexicalEditorWebViewProps {
  value?: string;
  onChange?: (text: string) => void;
  height?: number;
}

const LexicalEditorWebView = ({
  value,
  onChange,
}: LexicalEditorWebViewProps) => {
  const webviewRef = useRef<WebView>(null);
  const lastValue = useRef<string | undefined>(undefined);
  const [webviewReady, setWebviewReady] = useState(false);

  // Khi WebView load xong, mới gửi value vào
  const handleWebViewLoad = () => {
    setWebviewReady(true);
  };

  useEffect(() => {
    if (
      webviewReady &&
      webviewRef.current &&
      value !== undefined &&
      value !== null &&
      value !== lastValue.current
    ) {
      webviewRef.current.postMessage(value);
      lastValue.current = value;
    }
  }, [value, webviewReady]);

  return (
    <View style={[styles.container]}>
      <WebView
        ref={webviewRef}
        originWhitelist={["*"]}
        source={require("../assets/lexical-editor.html")}
        onLoadEnd={handleWebViewLoad}
        onMessage={(event) => {
          if (event.nativeEvent.data === "__BLUR__") {
            Keyboard.dismiss();
          } else if (onChange) {
            onChange(event.nativeEvent.data);
          }
        }}
        javaScriptEnabled
        domStorageEnabled
        style={styles.webview}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, overflow: "hidden" },
  webview: { flex: 1, backgroundColor: "transparent" },
});

export default LexicalEditorWebView;
