import React, { useEffect, useState, useLayoutEffect } from 'react'
import { View, Text, FlatList, RefreshControl, StyleSheet, TouchableOpacity, Alert } from 'react-native'
import PagerView from 'react-native-pager-view'
import { useUsersStore } from '../store/useUsers'
import { UserRecord } from '../db/sqlite'
import { useNavigation } from '@react-navigation/native'
import TabSwitcher from '../components/TabSwitcher'
import { syncCustomersFromApi } from '../api/queries'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import type { RootStackParamList } from '../../App'

type NavProp = NativeStackNavigationProp<RootStackParamList, 'Users'>

const TabLabels: Array<'All' | 'Admin' | 'Manager'> = ['All', 'Admin', 'Manager']

function UserItem({ user, onEdit, onDelete }: { user: UserRecord; onEdit: (u: UserRecord) => void; onDelete: (id: string) => void }) {
  return (
    <View style={styles.item}>
      <View style={{ flex: 1 }}>
        <Text style={styles.name}>{user.name}</Text>
        {user.email ? <Text style={styles.email}>{user.email}</Text> : null}
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <TouchableOpacity onPress={() => onEdit(user)} style={{ padding: 8 }}>
          <Text style={{ color: '#007AFF' }}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => onDelete(user.id)} style={{ padding: 8 }}>
          <Text style={{ color: '#ff3b30' }}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

function UserList({ type }: { type: 'All' | 'Admin' | 'Manager' }) {
  const { users, loadFromDB, loading, searchText, selectedTab } = useUsersStore()
  const [refreshing, setRefreshing] = useState(false)
  const nav = useNavigation<NavProp>()

  const activeTab = type === 'All' ? selectedTab : type
  const filtered = activeTab === 'All'
    ? users
    : users.filter(u => (u.userType || 'Other').toString().trim().toLowerCase() === activeTab.toLowerCase())

  const finalFiltered = searchText
    ? filtered.filter(u => u.name.toLowerCase().includes(searchText.toLowerCase()))
    : filtered

  const onRefresh = async () => {
    setRefreshing(true)
    try {
      await syncCustomersFromApi()
    } catch {
    }
    await loadFromDB()
    setRefreshing(false)
  }

  const handleEdit = (u: UserRecord) => {
    nav.navigate('AddUser', { user: u } as never)
  }

  const handleDelete = (id: string) => {
    Alert.alert('Delete', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await useUsersStore.getState().deleteUserById(id)
        },
      },
    ])
  }

  return (
    <FlatList
      data={finalFiltered}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => <UserItem user={item} onEdit={handleEdit} onDelete={handleDelete} />}
      refreshControl={<RefreshControl refreshing={refreshing || loading} onRefresh={onRefresh} />}
      ListEmptyComponent={<View style={{ padding: 24 }}><Text>No users</Text></View>}
    />
  )
}

export default function ListScreen() {
  const { selectedTab, setSelectedTab, loadFromDB } = useUsersStore()
  const [page, setPage] = useState(TabLabels.indexOf(selectedTab))
  const nav = useNavigation<NavProp>()

  useEffect(() => {
    setPage(TabLabels.indexOf(selectedTab))
  }, [selectedTab])

  useEffect(() => {
    void loadFromDB()
  }, [loadFromDB])

  useLayoutEffect(() => {
    nav.setOptions({
      headerRight: () => (
        <TouchableOpacity onPress={() => nav.navigate('AddUser' as never)} style={{ padding: 8 }}>
          <Text style={{ color: '#007AFF', fontSize: 16 }}>+ Add</Text>
        </TouchableOpacity>
      ),
    })
  }, [nav])

  return (
    <View style={{ flex: 1 }}>
      <TabSwitcher />
      <PagerView
        style={{ flex: 1 }}
        initialPage={page}
        onPageSelected={(e) => {
          const pos = e.nativeEvent.position
          setSelectedTab(TabLabels[pos])
        }}
      >
        {TabLabels.map((tab) => (
          <View key={tab} style={{ flex: 1 }}>
            <UserList type={tab} />
          </View>
        ))}
      </PagerView>
    </View>
  )
}

const styles = StyleSheet.create({
  item: {
    padding: 12,
    borderBottomWidth: 1,
    borderColor: '#eee',
    flexDirection: 'row',
    alignItems: 'center',
  },
  name: { fontWeight: '600', fontSize: 16 },
  email: { color: '#555', fontSize: 14 },
})