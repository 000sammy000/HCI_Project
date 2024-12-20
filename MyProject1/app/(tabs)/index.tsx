import React from 'react';
import { Button, View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import LottieView from 'lottie-react-native';
import { useRouter } from 'expo-router';
import { TabBarIcon } from '@/components/navigation/TabBarIcon';
import Navigation from './navigation';
import * as Progress from 'react-native-progress'; // 引入進度條庫

export default function App() {
  const router = useRouter();

  // 營養素進度數據
  const nutrients = [
    { name: '蛋白質', progress: 0.7, color: '#FFB6B6' }, // 淡粉紅
    { name: '澱粉', progress: 0.5, color: '#B0C4DE' }, // 淡藍灰
    { name: '脂肪', progress: 0.3, color: '#C1E1C1' }, // 淡綠
  ];

  return (
    <View style={styles.container}>
      {/* Lottie 動畫 */}
      <LottieView
        source={require('@/assets/animations/chicken.json')}
        autoPlay
        loop
        style={styles.lottieAnimationCenter}
      />
      {/* 相機按鈕 */}
      <View style={styles.buttonTopRight}>
        <TouchableOpacity onPress={() => router.push('/camera')}>
          <TabBarIcon name="camera-outline" color="#000" />
        </TouchableOpacity>
      </View>

      {/* 營養素進度條 */}
      <View style={styles.progressBarContainer}>
        {nutrients.map((nutrient, index) => (
          <View key={index} style={styles.progressItem}>
            <Text style={styles.progressLabel}>{nutrient.name}</Text>
            <Progress.Bar
              progress={nutrient.progress}
              width={300}
              color={nutrient.color}
              style={styles.progressBar}
            />
          </View>
        ))}
      </View>

      <Navigation />
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
  lottieAnimationCenter: {
    position: 'absolute',
    top: '10%',
    transform: [{ translateY: -20 }], // 向上移動 20 像素
    width: 600,
    height: 600,
  },
  buttonTopRight: {
    position: 'absolute',
    top: 10,
    right: 10,
  },
  progressBarContainer: {
    position: 'absolute',
    bottom: 50, // 距離螢幕底部
    alignItems: 'center',
  },
  progressItem: {
    marginVertical: 10,
    alignItems: 'center',
  },
  progressLabel: {
    fontSize: 16,
    marginBottom: 5,
    color: '#000',
  },
  progressBar: {
    alignSelf: 'center',
  },
});
