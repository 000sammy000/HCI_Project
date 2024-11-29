import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Alert } from "react-native";

const Surprise: React.FC = () => {
  const [currentTime, setCurrentTime] = useState<string>("");
  const [currentDate, setCurrentDate] = useState<string>("");
  const [period, setPeriod] = useState<string>("");
  const [showSurprise, setShowSurprise] = useState<boolean>(false);

  const surpriseTime = "12:00:00";

  useEffect(() => {
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
});

export default Surprise;
