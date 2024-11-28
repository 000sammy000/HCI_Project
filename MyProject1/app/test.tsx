import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert,TouchableOpacity,TouchableWithoutFeedback ,Keyboard} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { TabBarIcon } from '@/components/navigation/TabBarIcon';
import { useRouter } from 'expo-router';
import Navigation from './navigation';


export default function CalorieCalculator() {
  const [height, setHeight] = useState<string>(''); // 身高 (cm)
  const [weight, setWeight] = useState<string>(''); // 體重 (kg)
  const [activityLevel, setActivityLevel] = useState<string>('light'); // 運動量
  const [bmi, setBmi] = useState<number | null>(null);
  const [calorieIntake, setCalorieIntake] = useState<string>('');
  const router = useRouter();

  const calculateBMIAndCalories = () => {
    const heightInMeters = parseFloat(height) / 100;
    const weightInKg = parseFloat(weight);

    if (heightInMeters && weightInKg) {
      const bmiValue = weightInKg / (heightInMeters * heightInMeters);
      setBmi(bmiValue);

      let calorieRecommendation = '';
      let baseCalorie: number;

      if (bmiValue < 18.5) {
        baseCalorie =  35; // 過輕
      } else if (bmiValue >= 18.5 && bmiValue <= 24.9) {
        baseCalorie =  30; // 正常
      } else {
        baseCalorie =  25; // 過重
      }

      // 根據運動量調整熱量建議
      let activityAdder: number;
      if (activityLevel === 'light') {
        activityAdder = 0; // 輕度運動
      } else if (activityLevel === 'moderate') {
        activityAdder = 5; // 中度運動
      } else {
        activityAdder = 10; // 重度運動
      }

      const adjustedCalorie = weightInKg*(baseCalorie + activityAdder);
      calorieRecommendation = `每日攝取熱量: ${adjustedCalorie} 大卡 (${bmiValue < 18.5 ? '過輕' : bmiValue <= 24.9 ? '正常' : '過重'})`;
      setCalorieIntake(calorieRecommendation);
    } else {
      Alert.alert('錯誤', '請輸入有效的身高和體重');
    }
  };

  return (
    <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
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

      <Button title="計算" onPress={calculateBMIAndCalories} />

      {bmi !== null && (
        <View style={styles.resultContainer}>
          <Text style={styles.resultText}>BMI: {bmi.toFixed(2)}</Text>
          <Text style={styles.resultText}>{calorieIntake}</Text>
        </View>
      )}
      <Navigation />
     
    </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
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
    borderWidth: 1,
    borderColor: '#CCCCCC',
    padding: 10,
    marginVertical: 10,
    borderRadius: 5,
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
  buttonTopLeft: {
    position: 'absolute', // 絕對定位
    top: 10, // 距離螢幕頂部 10 像素
    left: 10, // 距離螢幕左側 10 像素
  },
  buttonTopHome: {
    position: 'absolute',
    top: 10,
    left: 40, 
  },
});
