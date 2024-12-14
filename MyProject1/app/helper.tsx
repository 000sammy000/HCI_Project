import React, { useState,useEffect } from "react";
import { View, Button, StyleSheet, Alert, Text, ScrollView, ActivityIndicator, Pressable  } from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import Navigation from './navigation';
import axios from 'axios';

const SendFoodEntries: React.FC = () => {
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false); // Loading state for ActivityIndicator
  const [isPressed, setIsPressed] = useState(false);

  useEffect(() => {
    const load_StoredResult = async () => {
      const StoredResult = await AsyncStorage.getItem('AnalysisResult');
      if (StoredResult) {
        setAnalysisResult(StoredResult);
      }
    };
    load_StoredResult();
  }, []);

  const sendFoodEntries = async () => {
    setLoading(true); // Show ActivityIndicator
    try {
        // Retrieve food entries from AsyncStorage
        //console.log('sucess')
        const entriesJson = await AsyncStorage.getItem('DailyfoodEntries');
        // Parse and extract only "foods"
        const foodEntries = entriesJson ? JSON.parse(entriesJson).map(entry => entry.foods).flat() : [];
        
        if (foodEntries.length === 0) {
            Alert.alert("No Data", "No DailyfoodEntries to send.");
            return;
        }
        console.log("food Data:", foodEntries); // Debug log
        // Send data to Python backend
        const response = await axios.post('http://192.168.86.65:5000/analyze-food-entries', 
            {foodEntries}, 
            {headers: {'Content-Type': 'application/json',  }}
        );
        //console.log("Response Data:", response.data); // Debug log
        // Check for a successful response
        if (response.status === 200) {
            const resultString = JSON.stringify(response.data);
            setAnalysisResult(resultString);  
            await AsyncStorage.setItem('AnalysisResult', resultString);
        } else {
            Alert.alert("Error", response.data.error || "Failed to analyze DailyfoodEntries.");
        }
    } catch (error) {
        console.error("Error sending food entries:", error);
        Alert.alert("Error", "Failed to send DailyfoodEntries.");
    } finally {
        setLoading(false); // Hide ActivityIndicator
    }
  };

  const renderResult = (result) => {
    return result.lack_nutrient.map((item, index) => (
      <View key={index} style={styles.card}>
        <Text style={styles.title}>缺乏營養素: {item.nutrition}</Text>
        <Text style={styles.reason}>原因: {item.reason}</Text>
        <Text style={styles.solution}>建議方案:</Text>
        {item.solution.map((sol, idx) => (
          <Text key={idx} style={styles.solutionItem}>- {sol}</Text>
        ))}
      </View>
    ));
  };

  return (
    <View style={styles.container}>
      <Navigation />
       
      <Pressable
        onPressIn={() => setIsPressed(true)}
        onPressOut={() => setIsPressed(false)}
        onPress={sendFoodEntries}
        style={({ pressed }) => [
            styles.button,
            isPressed || pressed ? styles.buttonPressed : styles.buttonDefault,
        ]}
      >

        <Text style={styles.buttonText}>分析今日餐點</Text>

      </Pressable>;

      {loading ?  (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0066ff" />
        </View>
      ): null }

      {analysisResult && (
        <ScrollView style={styles.resultContainer}>
          {renderResult(JSON.parse(analysisResult))}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
  },
  resultContainer: {
    marginTop: 20,
    padding: 10,
    backgroundColor: "#fff",
    borderRadius: 5,
    maxHeight: 300,
  },
  resultText: {
    fontSize: 14,
    color: "#333",
  },
  loadingContainer: {
    position: 'absolute',
    top: '20%',
    left: '55%',
    transform: [{ translateX: -25 }, { translateY: -25 }],
    alignItems: 'center',
  },
  button: {
    marginVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    height: 50,
    width: '60%',
    alignSelf: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 7,
  },
  buttonDefault: {
    backgroundColor: '#4CAF50',
    shadowOffset: { width: 2, height: 4 }, // 3D elevated shadow
  },
  buttonPressed: {
    backgroundColor: '#45A049',
    shadowOffset: { width: 0, height: 2 }, // Flat shadow for pressed effect
    elevation: 2, // Reduced elevation
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 5,
    marginTop: 15,
  },
  reason: {
    fontSize: 16,
  },
  solution: {
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 5,
  },
  solutionItem: {
    fontSize: 16,
    marginLeft: 15,
  },
});

export default SendFoodEntries;