import React, { useEffect, useState, useRef } from 'react';
import { Button, View, StyleSheet, TouchableOpacity, Text, Alert, Image, Pressable, Modal,} from 'react-native';
import LottieView from 'lottie-react-native';
import { useRouter } from 'expo-router';
import { TabBarIcon } from '@/components/navigation/TabBarIcon';
import Navigation from './navigation';
import * as Progress from 'react-native-progress'; // 引入進度條庫
import AsyncStorage from '@react-native-async-storage/async-storage';
import DailySummaryModal from './DailySummaryModal';


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
  const [cover, setCover] = useState(true);//遮罩用
  const [infoVisable, setInfoVisable] = useState(false);
  const [infoText, setInfoText] = useState("");
  const [modalPosition, setModalPosition] = useState({ top: 0, left: 0 });
  const imageRefs = useRef<any[]>([]); // 儲存圖片的引用
  const [currentTime, setCurrentTime] = useState<string>("");//抓取當前時間
  const [targetDate, setTargetDate] = useState<Date | null>(null);//紀錄週期結束時間
  const [dayCount, setDayCount] = useState<number | null>(null);//計算當前為第幾天
  const [CGVisible, setCGVisible] = useState(false);
  // 紀錄食物日攝取量、週攝取量、每日結算頁面
  const [currentProgress, setCurrentProgress] = useState({
    grains: 0,
    protein: 0,
    dairy: 0,
    vegetables: 0,
    fruits: 0,
    oils: 0,
  }); // Initial progress state
  const [foodEntries, setFoodEntries] = useState<any[]>([]);
  const [isDailySummaryVisible, setIsDailySummaryVisible] = useState(false);

  const loadFoodEntries = async () => {
    try {
  
      const entriesJson = await AsyncStorage.getItem('DailyfoodEntries');
      const entries = entriesJson ? JSON.parse(entriesJson) : [];
      setFoodEntries(entries);
  
      const categoryMapping: { [key: string]: keyof typeof currentProgress } = {
        "乳品類": "dairy",
        "全榖雜糧類": "grains",
        "水果類": "fruits",
        "油脂與堅果種子類": "oils",
        "蔬菜類": "vegetables",
        "豆蛋魚肉類": "protein",
      };
  
      const updatedProgress = ({
        grains: 0,
        protein: 0,
        dairy: 0,
        vegetables: 0,
        fruits: 0,
        oils: 0,
      });
      entries.forEach((entry: any) => {
        entry.foods.forEach((food: any) => {
          Object.entries(food.categories).forEach(([key, value]: [string, any]) => {
            const mappedKey = categoryMapping[key];
            if (mappedKey) {
              const numericValue = parseFloat(value);
              if (!isNaN(numericValue)) {
                updatedProgress[mappedKey] += numericValue;
              } else {
                console.warn(`無效的數值: key = ${key}, value = ${value}`);
              }
            }
          });
        });
      });
  
      setCurrentProgress(updatedProgress);
    } catch (error) {
      console.error('Error loading food entries:', error);
      Alert.alert('錯誤', '無法讀取飲食記錄');
    }
  };
  
// 讀儲存資料
  useEffect(() => {
    // 讀營養建議
    const fetchNutritionData = async () => {
      try {
        const storedData = await AsyncStorage.getItem('userData');
        if (storedData) {
          const parsedData = JSON.parse(storedData);
          if (parsedData.nutrition) {
            setNutritionData(parsedData.nutrition);
            setCover(false);//設定個人資料後沒有遮罩
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
    loadFoodEntries();

    // 讀養成週期
    const initializeTargetDate = async () => {
      try {
        const storedDate = await AsyncStorage.getItem("targetDate");
        if (storedDate) {
          setTargetDate(new Date(storedDate));
        } else {
          // 如果未儲存目標時間，設置為 7 天後的午夜
          const initialDate = new Date();
          initialDate.setDate(initialDate.getDate() + 7);
          initialDate.setHours(0, 0, 0, 0);
          setTargetDate(initialDate);
          await AsyncStorage.setItem("targetDate", initialDate.toISOString());
        }
      } catch (error) {
        Alert.alert("錯誤", "初始化目標時間失敗！");
      }
    };

    initializeTargetDate();
  }, []);

  // 更新當前時間 & 檢測是否超過七天
  useEffect(() => {
    const interval = setInterval(async () => {
      const now = new Date();
      const dateString = now.toLocaleDateString(); // 僅顯示年月日
      setCurrentTime(dateString);

      // 日結算
      // 檢查當前時間是否為午夜 00:00:00 (結算時間可以再改)
      if (now.getHours() === 0 && now.getMinutes() === 0 && now.getSeconds() === 0) {
        const settlementHandler = async () => {
          // 獲得當前食物進度
          const tempFoodEntries = [...foodEntries];
          const tempWeekData = await AsyncStorage.getItem('WeeklyfoodEntries');
          const parsedWeekData = tempWeekData ? JSON.parse(tempWeekData) : [];
      
          // 更新 weekFoodEntries
          const updatedWeekData = [...parsedWeekData, ...tempFoodEntries];
          await AsyncStorage.setItem('WeeklyfoodEntries', JSON.stringify(updatedWeekData));

          setIsDailySummaryVisible(true);
        };
        // 清空日進度、progress
        AsyncStorage.setItem('DailyfoodEntries', JSON.stringify([]));
        setFoodEntries([]);

        settlementHandler();
      }

      // 周結算
      if (targetDate) {
        // 計算當前日期與目標日期的差距天數
        const diffTime = targetDate.getTime() - now.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); // 向上取整
        setDayCount(8 - diffDays);

        // 如果到達目標時間
        if (now >= targetDate) {
          setCGVisible(true);

          // 更新目標時間為 7 天後的午夜
          const newTargetDate = new Date();
          newTargetDate.setDate(newTargetDate.getDate() + 7);
          newTargetDate.setHours(0, 0, 0, 0);
          setTargetDate(newTargetDate);

          try {
            await AsyncStorage.setItem(
              "targetDate",
              newTargetDate.toISOString()
            );
          } catch (error) {
            Alert.alert("錯誤", "儲存新目標時間失敗！");
          }
        }
      }

    }, 1000);

    return () => clearInterval(interval); // 清除定時器
  }, [targetDate]);

  const closeModal = () => {
    setCGVisible(false);
  };


  const nutrientNameMap: { [key: string]: string } = {
    grains: '全榖雜糧類\n份量單位為1碗，約為米、大麥等80公克\n',
    protein: '豆魚蛋肉類\n份量單位為1份，約為黃豆20公克 = 蛋1顆 = 魚35公克 = 去皮雞胸肉30公克\n',
    dairy: '乳品類\n份量單位為1杯，約為鮮奶240毫升\n',
    vegetables: '蔬菜類\n份量單位為1碗，約為生菜100公克\n',
    fruits: '水果類\n份量單位為1份，約為水果100公克 = 香蕉半根\n',
    oils: '油脂與堅果種子類\n份量單位為1份，約為油類1茶匙\n',
  };

  const nutrientIconMap: { [key: string]: any } = {
    grains: require("../assets/images/NutrientIcons/grains.png"),
    protein: require("../assets/images/NutrientIcons/protein.png"),
    dairy: require("../assets/images/NutrientIcons/dairy.png"),
    vegetables: require("../assets/images/NutrientIcons/vegetables.png"),
    fruits: require("../assets/images/NutrientIcons/fruits.png"),
    oils: require("../assets/images/NutrientIcons/oils.png"),
  };
  // 營養素顏色設定
  const getColorForNutrient = (nutrient: string) => {
    switch (nutrient) {
      case 'grains':
        return '#2c88c3'; // 藍色
      case 'protein':
        return '#e58e74'; // 深膚色
      case 'dairy':
        return '#8a7cb9'; // 紫色
      case 'vegetables':
        return '#66a372'; // 綠色
      case 'fruits':
        return '#fd9fc0'; // 粉色
      case 'oils':
        return '#fbb947'; // 黃色
      default:
        return '#ccc'; // 預設顏色
    }
  };

  const handleLongPress = (index: number, text: string) => {
    if (imageRefs.current[index]) {
      imageRefs.current[index].measure(
        (x: number, y: number, width: number, height: number, pageX: number, pageY: number) => {
          setModalPosition({
            top: pageY - 120, // 彈窗顯示在圖片上方120px
            left: pageX, // 彈窗水平對齊圖片的左側
          });
          setInfoText(text); // 設定彈窗的文字內容
          setInfoVisable(true); // 顯示彈窗
        }
      );
    }
  };

  const handlePressOut = () => {
    setInfoVisable(false); // 關閉icon資訊
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
  const [currentAnimation, setCurrentAnimation] = useState(require('@/assets/animations/chicken.json')); // 動畫狀態
  const [isLooping, setIsLooping] = useState(true); // 動畫循環狀態
  const [animationStyles, setAnimationStyles] = useState(styles.lottieAnimationCenter); // 動態樣式
  const [GoToCamera, setGoToCamera] = useState(false);
  const playAndNavigate = () => {
    setIsVisible(false);
    setGoToCamera(true);
    setCurrentAnimation(require('@/assets/animations/flying.json')); // 切換到按鈕動畫
    setIsLooping(false); // 停止循環
    setAnimationStyles(styles.lottieAnimationButton); // 切換到按鈕動畫的樣式
  };  
  const [isVisible, setIsVisible] = useState(true); // 控制按鈕的顯示狀態

  const handleAnimationFinish = () => {
    if (GoToCamera) {
      setTimeout(() => {
        router.push('/camera'); // 跳轉到相機頁面
        setCurrentAnimation(require('@/assets/animations/chicken.json')); // 恢復元動畫
        setIsLooping(true); // 恢復循環播放
        setAnimationStyles(styles.lottieAnimationCenter); // 恢復元動畫的樣式
        setIsVisible(true);
        setGoToCamera(false);
      }, 1000); // 延遲 1 秒
    }
  };

  const BackAnimation = () => {
    setIsVisible(false);
    setCurrentAnimation(require('@/assets/animations/back.json')); // 切換到按鈕動畫
    setIsLooping(false); // 停止循環
    setAnimationStyles(styles.lottieAnimationButton); // 切換到按鈕動畫的樣式
  }; 
  useEffect(() => {
    const checkAnimationStatus = async () => {
      const animationStatus = await AsyncStorage.getItem('shouldPlayAnimation');
      if (animationStatus === 'true') {
        console.log('play animation');
        BackAnimation();
        await AsyncStorage.setItem('shouldPlayAnimation', 'false'); // Reset the status
        setTimeout(() => {
          setCurrentAnimation(require('@/assets/animations/chicken.json')); // 恢復元動畫
          setIsLooping(true); // 恢復循環播放
          setAnimationStyles(styles.lottieAnimationCenter); // 恢復元動畫的樣式
          setIsVisible(true);
          setGoToCamera(false);
        }, 1000); // 延遲 1 秒
      }
    };
    checkAnimationStatus();
  }, []);

  return (
    <View style={styles.container}>
      {/* Lottie 動畫 */}
      
      <LottieView
        source={currentAnimation}
        autoPlay
        loop={isLooping}
        onAnimationFinish={handleAnimationFinish}
        style={animationStyles} // 動態樣式
      />
      {/* 相機按鈕 */}
      <View style={styles.buttonTopRight}>
      {isVisible && ( 
        <TouchableOpacity onPress={playAndNavigate}>
          <Image 
            source={require('@/assets/images/window.png')} // 替換成你的圖片檔路徑
            style={styles.image} 
          />
        </TouchableOpacity>
        )}
      </View>

      {/* 每日結算彈出視窗 */}
      <DailySummaryModal
        visible={isDailySummaryVisible}
        onClose={() => setIsDailySummaryVisible(false)}
        currentProgress={currentProgress}
        targetProgress={nutritionData || defaultNutrition}
      />

        {/* 營養素進度條 */}
      <View style={styles.progressBarContainer}>
        {nutrients.map((nutrient, index) => (
              <View key={index} style={styles.progressItem}>
                <Pressable 
                  key={index}
                  onLongPress={() => handleLongPress(index, nutrientNameMap[nutrient.name] || nutrient.name)}
                  onPressOut={handlePressOut}
                  ref={(ref) => (imageRefs.current[index] = ref)} // 儲存圖片引用
                  >
                <Image 
                  style={styles.progressIcon}
                  source={nutrientIconMap[nutrient.name]}/>
                </Pressable>
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

      {/*icon資訊小視窗*/}
      <Modal
        animationType="fade"
        transparent={true}
        visible={infoVisable}
        onRequestClose={() => setInfoVisable(false)}
      >
        <View style={[
            styles.infoContent,
            {
              position: "absolute",
              top: modalPosition.top,
              left: modalPosition.left,
            },
          ]}>
          <Text style={styles.infoText}>{infoText}</Text>
        </View>
      </Modal>

      {/*遮罩跟提醒文字*/}
      { cover && <View style = {coverstyle}>
        <Text style = {textstyle}>請先輸入基本資料</Text>
      </View>}
      
      <Navigation />

      {/*當前日期*/}
      <View style={styles.timeContainer}>
        <Text style={styles.timeText}>{currentTime}</Text>
        <Text style={styles.countText}>Day {dayCount}</Text>
      </View>

      {/* CG視窗 */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={CGVisible}
        onRequestClose={closeModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.CGContent}>
            <Text style={styles.CGText}>觸發CG</Text>
            <Pressable style={styles.closeButton} onPress={closeModal}>
              <Text style={styles.closeButtonText}>結束</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fffbe2',
  },
  lottieAnimationCenter: {
    position: 'absolute',
    top: '10%',
    transform: [{ translateY: -40 }], // 向上移動 20 像素
    width: 600,
    height: 600,
  },
  lottieAnimationButton: {
    position: 'absolute',
    top: '10%',
    width: 600,
    height: 600,
    transform: [{ translateY: -60 }], // 特定偏移
  },
  buttonTopRight: {
    position: 'absolute',
    top: 5,
    right: -11,
  },
  image: {
    width: 160,
    height: 160,
    resizeMode: 'contain',
  },
  progressBarContainer: {
    position: 'absolute',
    bottom: 30, // 距離螢幕底部
    // left: 10, // 與螢幕左側對齊
    alignItems: 'flex-start', // 讓項目都靠左
  },
  progressItem: {
    flexDirection: 'row', // 水平排列
    alignItems: 'flex-start', // 垂直對齊為頂部
    marginBottom: 7, // 每個進度條項目之間的距離
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
  progressIcon: {
    width: 25,
    height: 25,
  },
  progressBar: {
    height: 8, // 設定固定高度，保持一致
    alignSelf: 'center', // 進度條改為置中
    marginLeft: 8,
    
  },
  progressText: {
    fontSize: 14,
    color: '#333',
    marginLeft: 10, // 數字與進度條的距離
    alignSelf: 'center',
  },
  
  infoContent: {
    width: 300,
    padding: 20,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    borderRadius: 10,
    alignItems: "flex-start",
    borderWidth: 2, // 邊框寬度
    borderColor: "rgba(255, 255, 255, 0.6)", // 邊框顏色
  },
  infoText: {
    fontSize: 12,
    marginBottom: 5,
    textAlign: "left",
    color: "#fff"
  },
  refreshButtonContainer: {
    position: 'absolute',
    bottom: 280,
    left: 150,
  },
  timeContainer: {
    position: "absolute",
    top: 75,
    left: 20,
    alignSelf: "center",
    backgroundColor: "#fff",
    padding: 10,
  },
  timeText: {
    fontSize: 16,
    color: "#333",
  },
  countText: {
    fontSize: 24,
    color: "#333",
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)", // 半透明背景
  },
  CGContent: {
    width: 300,
    padding: 20,
    backgroundColor: "#fff",
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#007BFF",
    alignItems: "center",
  },
  CGText: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: "center",
  },
  closeButton: {
    backgroundColor: "#007BFF",
    padding: 10,
    borderRadius: 5,
  },
  closeButtonText: {
    color: "#fff",
    fontSize: 16,
  },
});

const coverstyle: React.CSSProperties = { //遮罩透明黑底
  position: 'fixed',
  bottom: -260,
  left: 0,
  width: '95%',
  height: '30%',
  backgroundColor: 'rgba(0,0,0,0.4)',
  zIndex: 9999,
  justifyContent: 'center',
  alignItems: 'center',
};

const textstyle: React.CSSProperties = {//遮罩上文字
  fontSize: 20,
  fontWeight: 'bold',
  color: 'white',
};
