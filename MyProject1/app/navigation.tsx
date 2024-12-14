import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { TabBarIcon } from '@/components/navigation/TabBarIcon';
import AntDesign from '@expo/vector-icons/AntDesign';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

export default function Navigation() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      {/* 設定按鈕，左上角 */}
      <View style={styles.buttonTopLeft}>
        <View style={styles.buttonWrapper}>
          <TouchableOpacity onPress={() => router.push('/test')}>
            <TabBarIcon name="settings-outline" size={24}  color="#000" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.buttonTopList}>
        <View style={styles.buttonWrapper}>
          <TouchableOpacity onPress={() => router.push('/helper')}>
            <MaterialCommunityIcons name="clipboard-edit-outline" size={24} color="black" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.buttonTopHistory}>
        <View style={styles.buttonWrapper}>
          <TouchableOpacity onPress={() => router.push('/time')}>
            <AntDesign name="clockcircleo" size={24} color="black" />
          </TouchableOpacity>
        </View>
      </View>

      {/* 相簿按鈕 */}
      <View style={styles.buttonTopAlbum}>
        <View style={styles.buttonWrapper}>
          <TouchableOpacity onPress={() => router.push('/album')}>
            <AntDesign name="book" size={24} color="black" />
          </TouchableOpacity>
        </View>
      </View>

      {/* 主頁面按鈕 */}
      <View style={styles.buttonTopHome}>
        <View style={styles.buttonWrapper}>
          <TouchableOpacity onPress={() => router.push('/')}>
            <TabBarIcon name="home-outline" size={24} color="#000" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 10,
    left: 10,
    right: 10,
    zIndex: 10, // 保证按钮显示在最上层
  },
  buttonTopLeft: {
    position: 'absolute',
    top: 10,
    left: 10,
  },
  buttonTopList: {
    position: 'absolute',
    top: 10,
    left: 50,
  },
  buttonTopHistory: {
    position: 'absolute',
    top: 10,
    left: 90,
  },
  buttonTopAlbum: {
    position: 'absolute',
    top: 10,
    left: 130,
  },
  buttonTopHome: {
    position: 'absolute',
    top: 10,
    left: 170,
  },
  buttonWrapper: {
    width: 40, // 框的寬度
    height: 40, // 框的高度
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1, // 邊框寬度
    borderColor: '#000', // 邊框顏色
    borderRadius: 8, // 圓角邊框
  },
});
