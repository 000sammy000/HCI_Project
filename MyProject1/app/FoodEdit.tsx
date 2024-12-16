import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, ScrollView,Pressable } from 'react-native';

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
    //console.log('Saved Data:', editedData);
    const EmptyFood = editedData.length < 1;
    if(EmptyFood){
      alert('不可以餵食空氣');
      return;
    }
    const hasEmptyTitle = editedData.some((item) => item.title.trim() === '' || item.title.trim() === "");
    if(hasEmptyTitle){
      alert('有食材為空');
      return;
    }
    onSave(editedData); 
    onClose(); // Close the modal
  };
  const addNewItem = () => {
    const newItem = { 
      "title": "",
      "categories": {
                "全榖雜糧類": "0",
                "豆蛋魚肉類": "0",
                "乳品類": "0",
                "蔬菜類": "0",
                "水果類": "0",
                "油脂與堅果種子類": "0"
                } 
    };
    setEditedData([...editedData, newItem]);
  };

  const handleDelete = (index) => {
    const updatedItems = editedData.filter((_, i) => i !== index);
    setEditedData(updatedItems);
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
              keyboardType="numeric"
              onChangeText={(newValue) =>
                handleCategoryChange(index, category, newValue)
              }
            />
          </View>
        ))}
      </View>
      <Pressable onPress={() => handleDelete(index)} style={styles.button}>
        <Text style={styles.buttonText}>Delete</Text>
      </Pressable>
    </View>
  ))}
  <View style={styles.buttonContainer}>
    <Pressable onPress={onClose} style={[styles.button, styles.cancelButton]}>
      <Text style={styles.buttonText}>取消</Text>
    </Pressable>
    <Pressable onPress={handleReset} style={styles.button}>
      <Text style={styles.buttonText}>重設</Text>
    </Pressable>
    <Pressable onPress={addNewItem} style={styles.button}>
      <Text style={styles.buttonText}>新增</Text>
    </Pressable>
    <Pressable onPress={handleSave} style={[styles.button, styles.saveButton]}>
      <Text style={styles.buttonText}>餵食</Text>
    </Pressable>
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
    marginTop: 30,
    marginBottom: 10,
  },
  foodItemContainer: {
    marginBottom: 20,
  },
  foodItemTitleInput: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    borderTopWidth: 1,
    borderBottomWidth: 3,
    borderRightWidth: 1,
    borderLeftWidth: 1,
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
  button: {
    backgroundColor: '#007bff',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#ff4d4d',
  },
  saveButton: {
    backgroundColor: '#4CAF50',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default FoodEditScreen;
