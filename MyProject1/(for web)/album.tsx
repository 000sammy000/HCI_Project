import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Navigation from './navigation';

export default function AlbumPage() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>相簿</Text>
      <Navigation />
    </View>
    
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1, // 占滿整個畫面
    justifyContent: 'center', // 垂直居中
    alignItems: 'center', // 水平居中
    backgroundColor: '#fff', // 背景顏色
  },
  text: {
    fontSize: 24, // 文字大小
    fontWeight: 'bold', // 文字加粗
    color: '#000', // 文字顏色
  },
});
