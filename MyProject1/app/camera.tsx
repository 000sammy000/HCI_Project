import React, { useState, useEffect } from 'react';
import { Modal, Alert, View, Text, Button, StyleSheet, Image,TouchableOpacity, ActivityIndicator, Pressable} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';
import { useRouter } from 'expo-router';
import { TabBarIcon } from '@/components/navigation/TabBarIcon';
import FoodEditScreen from './FoodEdit';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function ImageUploader() {

  const [imageUri, setImageUri] = useState<string | null>(null); // 圖片的 URI
  const [foodData, setFoodData] = useState(null);
  const [isFoodEditVisible, setFoodEditVisible] = useState(false);
  const [loading, setLoading] = useState(false); // Loading state for ActivityIndicator

  const router = useRouter();
  
  const wv = ["油菜", "高麗菜", "白菜", "芥藍", "菠菜", "甜椒"];//冬蔬菜
  const wf = ["椪柑", "草莓", "小番茄", "蜜棗", "柳丁"];//冬水果
  const sv = ["蘆筍", "龍鬚菜", "櫛瓜", "地瓜葉", "紅鳳菜"];//春蔬菜
  const sf = ["枇杷", "楊桃", "桑椹", "烏梅", "柑橘"];//春水果
  const suv = ["空心菜", "冬瓜", "小黃瓜", "芥藍", "絲瓜"];//夏蔬菜
  const suf = ["蓮霧", "香蕉", "西瓜", "鳳梨", "龍眼", "荔枝", "百香果"];//夏水果
  const fv = ["茭白筍", "青江菜", "青木瓜", "豆芽", "南瓜"];//秋蔬菜
  const ff = ["葡萄", "金桔", "木瓜", "柿子", "文旦"];//秋水果
  const [currentMonth, setCurrentMonth] = useState<number>(0);

  useEffect(() => {
    const date = new Date();
    const month = date.getMonth(); 
    setCurrentMonth(month + 1); 
  }, []);
  
  const selectImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      alert('需要相簿權限才能上傳圖片');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      alert('需要相機權限才能拍照');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  }

  const calculateCategoryTotals = (Data) => {
    const totalCategories: { [key: string]: number } = {};
  
    Data.forEach((food) => {
      Object.entries(food.categories).forEach(([category, value]) => {
        const numericValue = parseFloat(value);
        if (!totalCategories[category]) {
          totalCategories[category] = 0;
        }
        totalCategories[category] += numericValue;
      });
    });
  
    return totalCategories;
  };
  
  const llm_analyze = async () => {
    if (!imageUri) {
      alert('請先上傳或選擇圖片！');
      return;
    }

    // console.log('Image URI:', imageUri);

    const formData = new FormData();
    
    // If imageUri is a local file path (like from image picker)
    // You might need to create a proper file object
    if (imageUri.startsWith('file://') || imageUri.startsWith('content://')) {
      // For React Native
      formData.append('image', {
        uri: imageUri,
        type: 'image/jpeg',
        name: 'image.jpg',
      });
    } else if (imageUri.startsWith('data:image')) {
      // For base64 image data
      console.log('Base64 image detected');
      const response = await fetch(imageUri);
      const blob = await response.blob();
      formData.append('image', blob, 'image.jpg');
    } else {
      // For regular file objects
      formData.append('image', imageUri);
    }

    setLoading(true); // Show ActivityIndicator
    try {
      const response = await axios.post(
        'http://192.168.86.65:5000/analyzeimg', //change into your IP address
        formData,  // Send formData directly
        {
          headers: { 
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      if(!response.data["is_food"] )
      {
        alert('這不是食物!!!');
      }else{
        // alert(JSON.stringify(response.data["food_data"], null, 2));
        setFoodData(response.data["food_data"]);
        setFoodEditVisible(true); // Open the modal with food data
      }
      
    } catch (error) {
      console.error('Error connecting to Flask:', error);
      alert('Error: ' + (error.response?.data?.error || error.message));
    } finally {
      setLoading(false); // Hide ActivityIndicator
    }
  };

  const saveFoodData = async (EditfoodData) => {  //不要取名為foodData
    const entry = {
      timestamp: new Date().toISOString(),
      foods: EditfoodData,
    };
    const existingDailyEntriesJson = await AsyncStorage.getItem('DailyfoodEntries');
    const existingDailyEntries = existingDailyEntriesJson ? JSON.parse(existingDailyEntriesJson) : [];
    
    const updatedEntries = [...existingDailyEntries, entry];
    await AsyncStorage.setItem('DailyfoodEntries', JSON.stringify(updatedEntries));
    await AsyncStorage.setItem('shouldPlayAnimation', 'true');

    const result = calculateCategoryTotals(EditfoodData);
    if (result["蔬菜類"] < 1) {
      if (3 <= currentMonth && currentMonth <= 5){
        const rI = Math.floor(Math.random() * sv.length);
        Alert.alert('建議',`這餐的蔬菜吃得比較少。春天是${sv[rI]}的季節可以多吃點!`);
      }
      else if(6 <= currentMonth && currentMonth <= 9){
        const rI = Math.floor(Math.random() * suv.length);
        Alert.alert('建議',`這餐的蔬菜吃得比較少。夏天是${suv[rI]}的季節可以多吃點!`);
      }
      else if(10 <= currentMonth && currentMonth <= 11){
        const rI = Math.floor(Math.random() * fv.length);
        Alert.alert('建議',`這餐的蔬菜吃得比較少。秋天是${fv[rI]}的季節可以多吃點!`);
      }
      else{
        const rI = Math.floor(Math.random() * wv.length);
        Alert.alert('建議',`這餐的蔬菜吃得比較少。冬天是${wv[rI]}的季節可以多吃點!`);
      }
    }
    else if (result["水果類"] < 1) {
      if (3 <= currentMonth && currentMonth <= 5){
        const rI = Math.floor(Math.random() * sf.length);
        Alert.alert('建議',`這餐的沒有吃到水果。春天推薦吃${sf[rI]}!`);
      }
      else if(6 <= currentMonth && currentMonth <= 9){
        const rI = Math.floor(Math.random() * suv.length);
        Alert.alert('建議',`這餐的沒有吃到水果。夏天推薦吃${suf[rI]}!`);
      }
      else if(10 <= currentMonth && currentMonth <= 11){
        const rI = Math.floor(Math.random() * ff.length);
        Alert.alert('建議',`這餐的沒有吃到水果。秋天推薦吃${ff[rI]}!`);
      }
      else{
        const rI = Math.floor(Math.random() * wf.length);
        Alert.alert('建議',`這餐的沒有吃到水果。冬天推薦吃${wf[rI]}!`);
      }
    }
    //console.log('Saved food data:', updatedEntries);
  }

  const closeFoodEdit = () => {
    setFoodEditVisible(false);
    
    // save food data to local storage
    //saveFoodData(foodData);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>圖片上傳</Text>

      <View style={styles.buttonContainer}>
          <Pressable onPress={selectImage} style={styles.button}>
            <Text style={styles.buttonText}>選擇圖片</Text>
          </Pressable>
          <Pressable onPress={takePhoto} style={styles.button}>
            <Text style={styles.buttonText}>拍照</Text>
          </Pressable>
          <Pressable onPress={llm_analyze} style={[styles.button, styles.analyzeButton]}>
            <Text style={styles.buttonText}>分析圖片</Text>
          </Pressable>
        </View>

      {loading ?  (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0066ff" />
        </View>
      ): null }

      <Modal
        visible={isFoodEditVisible}
        animationType="slide"
        onRequestClose={() => closeFoodEdit(foodData)} // Default pass current data
      >
        <FoodEditScreen
          foodData={foodData} // gpt回傳分析結果傳去編輯畫面
          onClose={closeFoodEdit} // Pass the close function
          onSave={saveFoodData}
        />
      </Modal>
      <View style={styles.buttonTopRight}>
        <TouchableOpacity onPress={() => router.push('/')}>
          <TabBarIcon name="close" color="#000" />
        </TouchableOpacity>
      </View>

      {imageUri ? (
        <Image source={{ uri: imageUri }} style={styles.image} />
      ) : null }
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    backgroundColor: '#fffbe2',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  image: {
    width: 200,
    height: 200,
    alignSelf: 'center',
    marginTop: 20,
    borderRadius: 10,
  },
  buttonTopRight: {
    position: 'absolute', // 絕對定位
    top: 10, // 距離螢幕頂部 10 像素
    right: 10, // 距離螢幕右側 10 像素
  },
  loadingContainer: {
    position: 'absolute',
    top: '10%',
    left: '55%',
    transform: [{ translateX: -25 }, { translateY: -25 }],
    alignItems: 'center',
  },
  buttonContainer: {
    borderRadius: 10,   
    alignSelf: 'center',
    marginBottom: 70,
  },
  button: {
    backgroundColor: '#007bff',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
    
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  analyzeButton:{
    backgroundColor: '#4CAF50',
  },
});
