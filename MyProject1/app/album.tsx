import React, { useState,useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, Modal, Pressable } from 'react-native';
import Navigation from './navigation';
import AsyncStorage from '@react-native-async-storage/async-storage';

// 示例圖片數據（本地圖片或 URL）

const imageData = [
  { id: '1', source: require('@/assets/images/cg1-album.png'), full_source:require('@/assets/images/cg1.png') },
  { id: '2', source: require('@/assets/images/cg2-album.png'),full_source:require('@/assets/images/cg2.png')  },
  { id: '3', source: require('@/assets/images/cg3-album.png'),full_source:require('@/assets/images/cg3.png')  },
]



export default function AlbumPage() {
  const [selectedImage, setSelectedImage] = useState(null); // 儲存被選中的圖片
  const [modalVisible, setModalVisible] = useState(false); // 控制 Modal 的顯示
  const [usedCGs, setUsedCGs] = useState([0, 0, 0]);

  useEffect(() => {
    const loadUsedCGs = async () => {
      try {
        const storedUsedCGs = await AsyncStorage.getItem('usedCGs');
        if (storedUsedCGs) {
          setUsedCGs(JSON.parse(storedUsedCGs)); // 讀取並設置狀態
        }
      } catch (error) {
        console.log("Failed to load usedCGs from AsyncStorage", error);
      }
    };

    loadUsedCGs();
  }, []);

  // 處理圖片點擊事件
  const handleImagePress = (image, index) => {
    // 如果該圖片未顯示過（usedCGs[index] === 0），則不打開 Modal
    if (usedCGs[index] === 1) {
      setSelectedImage(image); // 設定被選中的圖片
      setModalVisible(true); // 打開 Modal
    }
  };

  const renderImage = ({ item, index }) => {
    // 如果該圖片的 usedCGs 值為 0，顯示問號圖片
    const imageSource = usedCGs[index] === 0 
      ? require('@/assets/images/noPicture.png') // 替換為問號圖片的路徑
      : item.source;

    return (
      <TouchableOpacity onPress={() => usedCGs[index] === 0 ? null : handleImagePress(item.full_source,index)}>
        <View style={styles.imageContainer}>
          <Image source={imageSource} style={styles.image} />
        </View>
      </TouchableOpacity>
    );
  };
  
  return (
    <View style={styles.container}>
      {/* 使用 FlatList 顯示圖片 */}
      <FlatList
        data={imageData}
        renderItem={renderImage}
        keyExtractor={(item) => item.id}
        numColumns={1} // 每行兩張圖片
        contentContainerStyle={styles.listContainer}
      />
      <Navigation />
      {selectedImage && (
        <Modal visible={modalVisible} transparent={true} animationType="fade">
          <View style={styles.modalContainer}>
            <Pressable style={styles.closeButton} onPress={() => setModalVisible(false)}>
              <Text style={styles.closeText}>✕</Text>
            </Pressable>
            <Image source={selectedImage} style={styles.fullImage} />
          </View>
        </Modal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1, // 占滿整個畫面
    justifyContent: 'center', // 垂直居中
    alignItems: 'center', // 水平居中
    backgroundColor: '#fffbe2', // 背景顏色
  },
  text: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
    textAlign: 'center',
    marginVertical: 10, // 增加頂部間距
  },
  listContainer: {
    paddingHorizontal: 10, // 左右間距
    paddingTop: 80, // 增加頂部間距，讓列表更靠下
    paddingBottom: 20, // 可以微調底部間距
  },
  imageContainer: {
    flex: 1,
    margin: 5, // 每張圖片的間距
    alignItems: 'center',
  },
  image: {
    width: 250, // 圖片寬度
    height: 200, // 圖片高度
    borderRadius: 10, // 圓角樣式
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.8)', // 半透明背景
  },
  fullImage: {
    width: '90%',
    height: '70%',
    resizeMode: 'contain', // 確保圖片等比例縮放
  },
  closeButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    zIndex: 1,
  },
  closeText: {
    fontSize: 30,
    color: '#fff',
    fontWeight: 'bold',
  },
});
