import React, { useEffect, useState } from 'react';
import { Button, View, StyleSheet, TouchableOpacity, Text, Alert, } from 'react-native';
import LottieView from 'lottie-react-native';
import { useRouter } from 'expo-router';
import { TabBarIcon } from '@/components/navigation/TabBarIcon';
import Navigation from './navigation';
import * as Progress from 'react-native-progress'; // 引入進度條庫
import AsyncStorage from '@react-native-async-storage/async-storage';



const defaultNutrition = {
  grains: 5, // 全榖雜糧類
  protein: 5, // 豆魚蛋肉類
  dairy: 5, // 乳品類
  vegetables: 5, // 蔬菜類
  fruits: 5, // 水果類
  oils: 5, // 油脂與堅果種子類
};

export default function App() {
  const router = useRouter();
  const [nutritionData, setNutritionData] = useState<any | null>(null);

  useEffect(() => {
    const fetchNutritionData = async () => {
      try {
        const storedData = await AsyncStorage.getItem('userData');
        if (storedData) {
          const parsedData = JSON.parse(storedData);
          if (parsedData.nutrition) {
            setNutritionData(parsedData.nutrition);
          } else {
            Alert.alert('提示', '尚未儲存任何營養建議資料');
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        Alert.alert('錯誤', '無法讀取資料');
      }
    };

    fetchNutritionData();
  }, []);

  const currentProgress = {
    grains: 2.4, // 當前攝取量（例如來自伺服器或本地計算）
    protein: 3.5,
    dairy: 1.0,
    vegetables: 3.0,
    fruits: 2.5,
    oils: 1.0,
  };
  const nutrientNameMap: { [key: string]: string } = {
    grains: '全榖雜糧類 ',
    protein: '豆魚蛋肉類 ',
    dairy: '\t\t\t\t 乳品類 ',
    vegetables: '\t\t\t\t 蔬菜類 ',
    fruits: '\t\t\t\t 水果類 ',
    oils: '\t\t\t\t 油脂與\n堅果種子類 ',
  };
  // 營養素顏色設定
  const getColorForNutrient = (nutrient: string) => {
    switch (nutrient) {
      case 'grains':
        return '#FFB6B6'; // 淡粉紅
      case 'protein':
        return '#FFDAB9'; // 淡橙
      case 'dairy':
        return '#FFEC8B'; // 淡黃 
      case 'vegetables':
        return '#C1E1C1'; // 淡綠
      case 'fruits':
        return '#B0C4DE'; // 淡藍灰
      case 'oils':
        return '#DDA0DD'; // 淡紫
      default:
        return '#ccc'; // 預設顏色
    }
  };
  
  const nutrients = Object.keys(currentProgress).map((key) => {
    const nutrientKey = key as keyof typeof currentProgress;
    const max = (nutritionData || defaultNutrition)[nutrientKey]; // 建議量
    const current = currentProgress[nutrientKey]; // 當前攝取量
    return {
      name: nutrientKey,
      current, // 分子：當前攝取量
      max, // 分母：建議量
      progress: max ? Math.min(current / max, 1) : 0, // 進度條比例
      color: getColorForNutrient(nutrientKey), // 根據營養類型設定顏色
    };
  })


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
            <Text style={styles.progressLabel}>
              {nutrientNameMap[nutrient.name] || nutrient.name}
            </Text>
            <Progress.Bar
              progress={nutrient.progress}
              width={200}
              color={nutrient.color}
              style={styles.progressBar}
            />
            <Text style={styles.progressText}>
              {nutrient.current}/{nutrient.max}
            </Text>
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
    transform: [{ translateY: -40 }], // 向上移動 20 像素
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
    bottom: 30, // 距離螢幕底部
    left: 10, // 與螢幕左側對齊
    alignItems: 'flex-start', // 讓項目都靠左
  },
  progressItem: {
    flexDirection: 'row', // 水平排列
    alignItems: 'flex-start', // 垂直對齊為頂部
    marginBottom: 15, // 每個進度條項目之間的距離
  },
  progressLabel: {
    fontSize: 16,
    color: '#000',
    marginRight: 10, // 標籤與進度條的距離
    textAlign: 'left',
    lineHeight: 20, // 調整行高讓文字垂直居中
    bottom: 5,
    left: 10,
   
  },
  progressBar: {
    height: 8, // 設定固定高度，保持一致
    alignSelf: 'flex-start', // 進度條與文字靠左
    
  },
  progressText: {
    fontSize: 14,
    color: '#333',
    marginLeft: 10, // 數字與進度條的距離
  },
});
