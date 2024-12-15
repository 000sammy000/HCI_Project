import React from 'react';
import { View, Text, Modal, StyleSheet, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface DailySummaryModalProps {
  visible: boolean;
  onClose: () => void;
  currentProgress: {
    [key: string]: number;
  };
  targetProgress: {
    [key: string]: number;
  };
}

const nutrientNames = {
  grains: '全榖雜糧類',
  protein: '豆魚蛋肉類',
  dairy: '乳品類',
  vegetables: '蔬菜類',
  fruits: '水果類',
  oils: '油脂與堅果種子類'
};

const DailySummaryModal: React.FC<DailySummaryModalProps> = ({ 
  visible, 
  onClose, 
  currentProgress, 
  targetProgress 
}) => {
  // Calculate differences and find the most significant deviation
  const nutritionDifferences = Object.keys(currentProgress).map(key => ({
    name: nutrientNames[key],
    current: currentProgress[key],
    target: targetProgress[key],
    difference: currentProgress[key] - targetProgress[key]
  }));

  // Calculate total points: 100 - sum of absolute differences / 6 * 10
  const totalPoints = 100 - nutritionDifferences.reduce((acc, nutrient) =>
    acc + (Math.abs(nutrient.difference) / nutrient.target) * 10
  , 0);
  React.useEffect(() => {
    if (visible) {
      AsyncStorage.setItem('totalPoints', totalPoints.toString());
      // parse to weekTotalPoints
      AsyncStorage.getItem('weekTotalPoints').then((array) => {
        let weekTotalPoints = array ? JSON.parse(array) : [];
        weekTotalPoints.push(totalPoints);
        AsyncStorage.setItem('weekTotalPoints', JSON.stringify(weekTotalPoints));
        console.log(weekTotalPoints);
      });
      console.log('total today: ', totalPoints);
    }
  }, [visible]);

  // Sort differences to find the most significant deviation
  const sortedDifferences = nutritionDifferences.sort((a, b) => 
    Math.abs(b.difference) - Math.abs(a.difference)
  );

  const mostSignificantDeviation = sortedDifferences[0];

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <Text style={styles.modalTitle}>今日營養結算</Text>
          {/* 顯示totalPoints */}
            <Text 
            style={[
              styles.modalTitle, 
              totalPoints < 30 ? { color: 'red' } : totalPoints < 70 ? { color: 'orange' } : { color: 'green' }
            ]}
            >
            {totalPoints.toFixed(2)}%
            </Text>
          
          <View style={styles.summaryContainer}>
            <Text style={styles.summaryText}>
              本日營養攝取總結
            </Text>

            {nutritionDifferences.map((nutrient, index) => (
              <View key={index} style={styles.nutrientRow}>
                <Text style={styles.nutrientName}>{nutrient.name}</Text>
                <Text style={[
                  styles.nutrientValue,
                  nutrient.difference < 0 ? styles.belowTarget : styles.aboveTarget
                ]}>
                  {nutrient.current}/{nutrient.target} {nutrient.difference < 0 ? '偏低' : '偏高'}
                </Text>
              </View>
            ))}

            {mostSignificantDeviation && (
              <View style={styles.recommendationContainer}>
                <Text style={styles.recommendationTitle}>小雞想說...</Text>
                <Text style={styles.recommendationText}>
                  {mostSignificantDeviation.name}攝取與建議量差異最大，
                  {mostSignificantDeviation.difference < 0 ? '我好想吃喔～' : '我吃不下了...'}
                </Text>
              </View>
            )}
          </View>

          <TouchableOpacity 
            style={styles.closeButton} 
            onPress={onClose}
          >
            <Text style={styles.closeButtonText}>確認</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)'
  },
  modalView: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333'
  },
  summaryContainer: {
    width: '100%',
    marginBottom: 15
  },
  summaryText: {
    fontSize: 18,
    marginBottom: 10,
    textAlign: 'center',
    color: '#666'
  },
  nutrientRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
    paddingHorizontal: 10
  },
  nutrientName: {
    fontSize: 16,
    color: '#333'
  },
  nutrientValue: {
    fontSize: 16,
    fontWeight: 'bold'
  },
  belowTarget: {
    color: 'red'
  },
  aboveTarget: {
    color: 'green'
  },
  recommendationContainer: {
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    padding: 15,
    marginTop: 10
  },
  recommendationTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#333'
  },
  recommendationText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center'
  },
  closeButton: {
    backgroundColor: '#007BFF',
    borderRadius: 10,
    padding: 10,
    width: '100%',
    alignItems: 'center',
    marginTop: 15
  },
  closeButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold'
  }
});

export default DailySummaryModal;