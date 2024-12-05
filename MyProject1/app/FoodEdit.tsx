import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, ScrollView } from 'react-native';

const FoodEditScreen = ({ foodData, onClose, onSave  }) => {
  const original_Data = foodData;
  const [editedData, setEditedData] = useState(foodData);  //send food data from camera.tsx

  const handleTitleChange = (index, newTitle) => {
    setEditedData((prev) => {
      const updatedData = [...prev];
      updatedData[index] = {
        ...updatedData[index],
        title: newTitle,
      };
      return updatedData;
    });
  };

  const handleCategoryChange = (index, category, newValue) => {
    setEditedData((prev) => {
      const updatedData = [...prev];
      updatedData[index] = {
        ...updatedData[index],
        categories: {
          ...updatedData[index].categories,
          [category]: newValue,
        },
      };
      return updatedData;
    });
  };
  const handleReset = () => {
    alert("You have reset")
    setEditedData(original_Data); // Reset editedData to original_Data
  };

  const handleSave = () => {
    console.log('Saved Data:', editedData);
    onSave(editedData); 
    onClose(); // Close the modal
  };

  return (
    <ScrollView style={styles.scrollContainer}>
      <Text style={styles.title}>Edit Food Content</Text>
      {editedData.map((foodItem, index) => (
        <View key={index} style={styles.foodItemContainer}>
          <TextInput
            style={styles.foodItemTitleInput}
            placeholder="Food Title"
            value={foodItem.title}
            onChangeText={(newTitle) => handleTitleChange(index, newTitle)}
          />
          <View style={styles.container}>
            {Object.entries(foodItem.categories).map(([category, value]) => (
              <View key={category} style={styles.inputContainer}>
                <Text style={styles.categoryLabel}>{category}</Text>
                <TextInput
                  style={styles.input}
                  placeholder={category}
                  value={value.toString()}
                  keyboardType='numeric'
                  onChangeText={(newValue) =>
                    handleCategoryChange(index, category, newValue)
                  }
                />
              </View>
            ))}
          </View>
        </View>
      ))}
      <View style={styles.buttonContainer}>
        <Button title="Save" onPress={handleSave} />
        <Button title="Reset" onPress={handleReset} color="red" /> {/* Reset Button */}
        <Button title="Cancel" onPress={onClose} />
      </View>
    </ScrollView>
  );
};
const styles = StyleSheet.create({
  scrollContainer: {
    padding: 20,
  },
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap', 
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 0,
    marginBottom: 10,
  },
  foodItemContainer: {
    marginBottom: 20,
  },
  foodItemTitleInput: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    borderBottomWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    backgroundColor: '#fff',
    borderRadius: 5,
  },
  inputContainer: {
    width: '33%', 
    marginBottom: 8,
    alignItems: 'center', 
  },
  categoryLabel: {
    fontSize: 14,
    marginBottom: 3,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 10,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 70,
  },
});

export default FoodEditScreen;
