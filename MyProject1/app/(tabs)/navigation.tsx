import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { TabBarIcon } from '@/components/navigation/TabBarIcon';


export default function Navigation() {
  const router = useRouter();
  

  return (
    <View style={styles.container}>
      {/* 設定按鈕，左上角 */}
      <View style={styles.buttonTopLeft}>
        <TouchableOpacity onPress={() => router.push('/test')}>
          <TabBarIcon name="settings-outline" color="#000" />
        </TouchableOpacity>
      </View>

      {/* 主頁面 */}
      <View style={styles.buttonTopHome}>
        <TouchableOpacity onPress={() => router.push('/')}>
          <TabBarIcon name="home-outline" color="#000" />
        </TouchableOpacity>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    zIndex: 10, // 保证按钮显示在最上层
  },
  buttonTopLeft: {
    position: 'absolute',
    top: 10,
    left: 10,
  },
  buttonTopHome: {
    position: 'absolute',
    top: 10,
    left: 40, 
  },
});
