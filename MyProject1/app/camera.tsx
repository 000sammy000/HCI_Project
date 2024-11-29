import React, { useState } from 'react';
import { View, Text, Button, StyleSheet, Image } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';

export default function ImageUploader() {
  const [imageUri, setImageUri] = useState<string | null>(null); // 圖片的 URI

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
  
  const llm_analyze = async () => {
    if (!imageUri) {
      alert('請先上傳或選擇圖片！');
      return;
    }

    console.log('Image URI:', imageUri);

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

    try {
      const response = await axios.post(
        'http://192.168.86.141:5000/analyzeimg', //change into your IP address
        formData,  // Send formData directly
        {
          headers: { 
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      if(response.data["is_food"] == false)
      {
        alert('這不是食物!!!')
      }else{
        alert('分析結果: ' + JSON.stringify(response.data["food_data"], null, 2));
      }
      
    } catch (error) {
      console.error('Error connecting to Flask:', error);
      alert('Error: ' + (error.response?.data?.error || error.message));
    }
};

  return (
    <View style={styles.container}>
      <Text style={styles.header}>圖片上傳</Text>

      <Button title="選擇圖片" onPress={selectImage} />
      <Button title="拍照" onPress={takePhoto} />
      <Button title="分析圖片" onPress={llm_analyze} />

      {imageUri && (
        <Image source={{ uri: imageUri }} style={styles.image} />
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
  image: {
    width: 200,
    height: 200,
    alignSelf: 'center',
    marginTop: 20,
    borderRadius: 10,
  },
});
