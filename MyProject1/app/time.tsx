import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Alert, ScrollView } from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import Navigation from './navigation';

const Surprise: React.FC = () => {
  const [currentTime, setCurrentTime] = useState<string>("");
  const [currentDate, setCurrentDate] = useState<string>("");
  const [period, setPeriod] = useState<string>("");
  const [showSurprise, setShowSurprise] = useState<boolean>(false);
  const [foodEntries, setFoodEntries] = useState<any[]>([]);

  const surpriseTime = "12:00:00";

  // test if the loaded food entries can be correctly displayed
  const loadFoodEntries = async () => {
    const entriesJson = await AsyncStorage.getItem('DailyfoodEntries');
    const entries = entriesJson ? JSON.parse(entriesJson) : [];
    setFoodEntries(entries);
  }

  useEffect(() => {
    loadFoodEntries();

    const updateTime = () => {
      const now = new Date();
      const hours = now.getHours();

      const formattedTime = now.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
      });

      const formattedDate = now.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });

      setCurrentTime(formattedTime);
      setCurrentDate(formattedDate);
      setPeriod(hours < 12 ? "上午" : "下午");

      if (formattedTime.includes(surpriseTime)) {
        setShowSurprise(true);
        Alert.alert("驚喜！", `現在是 ${formattedTime}，這是你的驚喜！`);
      }
    };

    updateTime();

    const intervalId = setInterval(updateTime, 1000);
    return () => clearInterval(intervalId);
  }, [surpriseTime]);

  return (
    <View style={styles.container}>
      <Navigation />
      <Text style={styles.title}>現在時間</Text>
      <Text style={styles.date}>{currentDate}</Text>
      <Text style={styles.time}>
        {currentTime} ({period})
      </Text>
      {showSurprise && (
        <View style={styles.surpriseContainer}>
          <Text style={styles.surpriseText}>🎉 這是你的驚喜！ 🎉</Text>
        </View>
      )}
      <View style={styles.foodEntriesContainer}>
        <Text style={styles.foodEntriesTitle}>飲食紀錄</Text>
        <ScrollView style={styles.foodEntriesList}>
          {foodEntries.length === 0 ? (
            <Text style={styles.noEntriesText}>尚無飲食紀錄</Text>
          ) : (
            foodEntries.map((entry, index) => (
              <View key={index} style={styles.entryContainer}>
                <Text style={styles.entryDate}>
                  {new Date(entry.timestamp).toLocaleString()}
                </Text>
                {/* Iterate over the foods object */}
                {entry.foods && Array.isArray(entry.foods) && entry.foods.map((foodItem, foodIndex) => (
                <View key={foodIndex} style={styles.foodItemContainer}>
                  {/* Ensure that foodItem.title is a string */}
                  {foodItem.title && (
                    <Text style={styles.foodItemTitle}>{foodItem.title}</Text>
                  )}
                  {/* Iterate over categories to display key-value pairs */}
                  {foodItem.categories && Object.entries(foodItem.categories).map(([category, value]) => (
                    value !== 0 && (
                      <Text key={category} style={styles.categoryText}>
                        {`${category}: ${value}`}
                      </Text>
                    )
                  ))}
                </View>
              ))}
              </View>
            ))            
          )}
        </ScrollView>
      </View>

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
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
  },
  date: {
    fontSize: 20,
    color: "#555",
    marginBottom: 10,
  },
  time: {
    fontSize: 32,
    color: "#333",
  },
  surpriseContainer: {
    marginTop: 20,
    padding: 15,
    backgroundColor: "#ffde59",
    borderRadius: 10,
  },
  surpriseText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#000",
  },
  foodEntriesContainer: {
    width: '90%',
    marginTop: 20,
    maxHeight: 300,
  },
  foodEntriesTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  foodEntriesList: {
    maxHeight: 250,
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    padding: 10,
  },
  noEntriesText: {
    textAlign: 'center',
    color: '#888',
  },
  entryContainer: {
    marginBottom: 15,
    padding: 10,
    backgroundColor: 'white',
    borderRadius: 5,
  },
  entryDate: {
    fontWeight: 'bold',
    marginBottom: 5,
  },
  foodItem: {
    marginLeft: 10,
    marginBottom: 5,
  },
  categoryText: {
    color: '#666',
    fontSize: 12,
  },
});

export default Surprise;
