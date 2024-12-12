import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, TouchableWithoutFeedback, Keyboard, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage'; // 引入 AsyncStorage
import { Picker } from '@react-native-picker/picker';
import { interpolateNutrition } from "./nutritionCalc"; 
import Navigation from './navigation';
import { useRouter } from 'expo-router';

export default function CalorieCalculator() {
  const [height, setHeight] = useState<string>('');
  const [weight, setWeight] = useState<string>('');
  const [activityLevel, setActivityLevel] = useState<string>('light');
  const [bmi, setBmi] = useState<number | null>(null);
  const [calorieIntake, setCalorieIntake] = useState<string>('');
  const [nutrition, setNutrition] = useState<any>(null);
  const router = useRouter();

  const saveData = async (calculatedNutrition) => {
    try {
      const data = {
        height,
        weight,
        activityLevel,
        calorieIntake,
        nutrition: calculatedNutrition,
      };
      await AsyncStorage.setItem('userData', JSON.stringify(data));
      
      Alert.alert('成功', '資料已儲存', [
        {
          text: '確定',
          onPress: () => {
            //router.push('/'); // 儲存成功後導航到首頁（假設首頁路徑是 "/index"）
          },
        },
      ]);
    } catch (error) {
      Alert.alert('錯誤', '儲存失敗');
    }
  };

  // 讀取資料
  const loadData = async () => {
    try {
      const storedData = await AsyncStorage.getItem('userData');
      if (storedData) {
        const data = JSON.parse(storedData);
        setHeight(data.height || '');
        setWeight(data.weight || '');
        setActivityLevel(data.activityLevel || 'light');
      }
    } catch (error) {
      Alert.alert('錯誤', '讀取資料失敗');
    }
  };

  const clearData = async () => {
    try {
      await AsyncStorage.clear(); // 清除所有儲存資料
      setHeight(''); // 清空輸入框
      setWeight(''); // 清空輸入框
      setActivityLevel('light');
      alert('資料已清除');
    } catch (error) {
      console.error('清除失敗', error);
    }
  };
  
  // 當元件載入時自動讀取資料
  useEffect(() => {
    loadData();
  }, []);

  const calculateBMIAndCalories = (callback) => {
    if (300 >= parseFloat(height) && parseFloat(height) >= 40 && 300 >= parseFloat(weight) && parseFloat(weight) >= 20) {
      //身高限於40~300，體重限於20~300
      const heightInMeters = parseFloat(height) / 100;
      const weightInKg = parseFloat(weight);

      const bmiValue = weightInKg / (heightInMeters * heightInMeters);
      setBmi(bmiValue);

      let calorieRecommendation = '';
      let baseCalorie: number;

      if (bmiValue < 18.5) {
        baseCalorie = 35;
      } else if (bmiValue >= 18.5 && bmiValue <= 24.9) {
        baseCalorie = 30;
      } else {
        baseCalorie = 25;
      }

      let activityAdder: number;
      if (activityLevel === 'light') {
        activityAdder = 0;
      } else if (activityLevel === 'moderate') {
        activityAdder = 5;
      } else {
        activityAdder = 10;
      }

      const adjustedCalorie = weightInKg * (baseCalorie + activityAdder);
      calorieRecommendation = `每日攝取熱量: ${adjustedCalorie} 大卡 (${bmiValue < 18.5 ? '過輕' : bmiValue <= 24.9 ? '正常' : '過重'})`;
      setCalorieIntake(calorieRecommendation);

      const nutri = interpolateNutrition(adjustedCalorie);
      setNutrition(nutri);
      // Run the callback after updates
      if (typeof callback === 'function') {
        callback(nutri);
      }
      
    } else {
      Alert.alert('錯誤', '請輸入有效的身高和體重');
    }
  };

  const Ensure_SaveData = () => { //when save button pressed, leading to it
    calculateBMIAndCalories((calculatedNutrition) => {
      saveData(calculatedNutrition); 
    });
  };

  return (
    <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.container}>
          <Text style={styles.header}>基本資料</Text>

          <Text>身高 (cm):</Text>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            value={height}
            onChangeText={setHeight}
            placeholder="輸入身高"
          />

          <Text>體重 (kg):</Text>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            value={weight}
            onChangeText={setWeight}
            placeholder="輸入體重"
          />

          <Text>運動量:</Text>
          <Picker
            selectedValue={activityLevel}
            style={styles.picker}
            onValueChange={(itemValue) => setActivityLevel(itemValue)}
          >
            <Picker.Item label="輕度運動" value="light" />
            <Picker.Item label="中度運動" value="moderate" />
            <Picker.Item label="重度運動" value="heavy" />
          </Picker>

          <Button title="載入營養目標" onPress={Ensure_SaveData} />
          <Button title="清除所有資料" onPress={clearData} />

          {/* 顯示結果或提示 */}
          {height && weight && bmi !== null && (
            <View style={styles.resultContainer}>
              <Text style={styles.resultText}>BMI: {bmi.toFixed(2)}</Text>
              <Text style={styles.resultText}>{calorieIntake}</Text>
            </View>
          )}

          {/* 顯示營養素建議 */}
          {nutrition && height && weight && (
            <View style={styles.resultContainer}>
              <Text style={styles.resultText}>建議攝取量:</Text>
              <Text style={styles.resultText}>全穀雜糧類: {nutrition.grains} 碗</Text>
              <Text style={styles.resultText}>豆魚蛋肉類: {nutrition.protein} 份</Text>
              <Text style={styles.resultText}>乳品類: {nutrition.dairy} 杯</Text>
              <Text style={styles.resultText}>蔬菜類: {nutrition.vegetables} 份</Text>
              <Text style={styles.resultText}>水果類: {nutrition.fruits} 份</Text>
              <Text style={styles.resultText}>油脂與堅果種子類: {nutrition.oils} 份</Text>
            </View>
          )}

          <Navigation />
        </View>
      </ScrollView>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    paddingTop: 80,
    justifyContent: 'center',
    backgroundColor: '#F5F5F5',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#CCCCCC',
    padding: 10,
    marginVertical: 10,
    borderRadius: 5,
  },
  picker: {
    marginVertical: 10,
  },
  resultContainer: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#E0F7FA',
    borderRadius: 5,
  },
  resultText: {
    fontSize: 18,
    textAlign: 'center',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center", // 讓內容居中（如果內容不足以填滿螢幕）
    paddingBottom: 20,
  },
});
