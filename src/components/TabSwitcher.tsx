import React, { useRef, useEffect } from 'react'
import { View, TextInput, Text, TouchableOpacity, StyleSheet, Animated, LayoutChangeEvent } from 'react-native'
import { useUsersStore } from '../store/useUsers'

const tabs: Array<'All' | 'Admin' | 'Manager'> = ['All', 'Admin', 'Manager']

export default function TabSwitcher() {
  const { selectedTab, setSelectedTab, searchText, setSearchText } = useUsersStore()
  const containerWidth = useRef(0)
  const indicatorIndex = useRef(new Animated.Value(tabs.indexOf(selectedTab))).current

  useEffect(() => {
    Animated.spring(indicatorIndex, { toValue: tabs.indexOf(selectedTab), useNativeDriver: true }).start()
  }, [selectedTab, indicatorIndex])

  const onLayout = (e: LayoutChangeEvent) => {
    containerWidth.current = e.nativeEvent.layout.width
  }

  const indWidth = containerWidth.current ? containerWidth.current / tabs.length : 0
  const translateX = Animated.multiply(indicatorIndex, indWidth)

  return (
    <View style={styles.container}>
      <TextInput
        value={searchText}
        onChangeText={setSearchText}
        placeholder="Search by name"
        style={styles.search}
      />
      <View style={styles.tabs} onLayout={onLayout}>
        {tabs.map((tab, idx) => (
          <TouchableOpacity key={tab} onPress={() => setSelectedTab(tab)} style={styles.tab}>
            <Text style={[styles.tabText, selectedTab === tab && styles.activeText]}>{tab}</Text>
          </TouchableOpacity>
        ))}
        <Animated.View
          style={[
            styles.indicator,
            { width: indWidth, transform: [{ translateX }] },
          ]}
        />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { padding: 12, backgroundColor: '#fff' },
  search: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginBottom: 12,
  },
  tabs: {
    flexDirection: 'row',
    position: 'relative',
    height: 36,
  },
  tab: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  tabText: { fontSize: 14, color: '#555' },
  activeText: { fontWeight: '600', color: '#000' },
  indicator: {
    position: 'absolute',
    bottom: 0,
    height: 2,
    backgroundColor: '#007AFF',
  },
})