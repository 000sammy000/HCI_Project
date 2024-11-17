import React from 'react';
import { View, StyleSheet } from 'react-native';
import LottieView from 'lottie-react-native';

export default function App() {
  return (
    <View style={styles.container}>
      {/* 放置在螢幕的左上角 */}
      <LottieView
        source={require('@/assets/animations/test_chicken.json')}
        autoPlay
        loop
        style={styles.lottieAnimationTopLeft}
      />
      
      {/* 放置在螢幕的正中央 */}
      <LottieView
        source={require('@/assets/animations/test_chicken.json')}
        autoPlay
        loop
        style={styles.lottieAnimationCenter}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  lottieAnimationTopLeft: {
    position: 'absolute',  // 使用絕對定位
    top: 10,  // 距離螢幕頂部 10 像素
    left: 10, // 距離螢幕左邊 10 像素
    width: 100,  // 設定動畫的寬度
    height: 100, // 設定動畫的高度
  },
  lottieAnimationCenter: {
    position: 'absolute',  // 使用絕對定位
    top: '50%', // 距離螢幕頂部 50% 的位置
    left: '50%', // 距離螢幕左邊 50% 的位置
    transform: [{ translateX: -50 }, { translateY: -50 }], // 用於精確將動畫置中
    width: 150,
    height: 150,
  },
});
