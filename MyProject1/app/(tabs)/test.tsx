import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet } from 'react-native';

export default function CalorieCalculator() {
  const [height, setHeight] = useState<string>(''); // 身高 (cm)
  const [weight, setWeight] = useState<string>(''); // 體重 (kg)
  const [bmi, setBmi] = useState<number | null>(null);
  const [calorieIntake, setCalorieIntake] = useState<string>('');

  const calculateBMIAndCalories = () => {
    const heightInMeters = parseFloat(height) / 100;
    const weightInKg = parseFloat(weight);

    if (heightInMeters && weightInKg) {
      const bmiValue = weightInKg / (heightInMeters * heightInMeters);
      setBmi(bmiValue);

      let calorieRecommendation = '';
      if (bmiValue < 18.5) {
        calorieRecommendation = `每日攝取熱量: ${Math.round(weightInKg * 35)} 大卡 (過輕)`;
      } else if (bmiValue >= 18.5 && bmiValue <= 24.9) {
        calorieRecommendation = `每日攝取熱量: ${Math.round(weightInKg * 30)} 大卡 (正常)`;
      } else {
        calorieRecommendation = `每日攝取熱量: ${Math.round(weightInKg * 25)} 大卡 (過重)`;
      }
      setCalorieIntake(calorieRecommendation);
    } else {
      alert('請輸入有效的身高和體重');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>熱量計算機</Text>

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

      <Button title="計算" onPress={calculateBMIAndCalories} />

      {bmi !== null && (
        <View style={styles.resultContainer}>
          <Text style={styles.resultText}>BMI: {bmi.toFixed(2)}</Text>
          <Text style={styles.resultText}>{calorieIntake}</Text>
        </View>
      )}
    </View>
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
});
