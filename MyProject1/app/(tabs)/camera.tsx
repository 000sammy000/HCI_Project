import React, { useState } from 'react';
import { View, Text, Button, StyleSheet, Image,TouchableOpacity  } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { TabBarIcon } from '@/components/navigation/TabBarIcon';


export default function ImageUploader() {
  const [imageUri, setImageUri] = useState<string | null>(null); // 图片的 URI
  const router = useRouter();

  const selectImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      alert('需要相簿權限才能上传图片');
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
      alert('需要將權限才能拍照');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  return (
    <View style={styles.container}>
      
      <Text style={styles.header}>圖片上傳</Text>

      <Button title="選擇圖片" onPress={selectImage} />
      <Button title="拍照" onPress={takePhoto} />

      {imageUri && (
        <Image source={{ uri: imageUri }} style={styles.image} />
      )}

      <View style={styles.buttonTopRight}>
        <TouchableOpacity onPress={() => router.push('/')}>
          <TabBarIcon name="close" color="#000" />
        </TouchableOpacity>
      </View>
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
  buttonTopRight: {
    position: 'absolute', // 絕對定位
    top: 10, // 距離螢幕頂部 10 像素
    right: 10, // 距離螢幕右側 10 像素
  },
});
