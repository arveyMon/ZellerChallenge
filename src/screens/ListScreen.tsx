import React, { useEffect, useState , useLayoutEffect} from 'react'
import { TouchableOpacity, View, Text, FlatList, RefreshControl, StyleSheet } from 'react-native'
import PagerView from 'react-native-pager-view'
import { useUsersStore } from '../store/useUsers'
import { UserRecord } from '../db/sqlite'
import TabSwitcher from '../components/TabSwitcher'
import { useNavigation } from '@react-navigation/native'


const TabLabels: Array<'All' | 'Admin' | 'Manager'> = ['All', 'Admin', 'Manager']

function UserItem({ user }: { user: UserRecord }) {
  return (
    <View style={styles.item}>
      <Text style={styles.name}>{user.name}</Text>
      {user.email ? <Text style={styles.email}>{user.email}</Text> : null}
      {user.userType ? <Text style={styles.type}>{user.userType}</Text> : null}
    </View>
  )
}

function UserList({ type }: { type: 'All' | 'Admin' | 'Manager' }) {
  const { users, loadFromDB, loading } = useUsersStore()
  const [refreshing, setRefreshing] = useState(false)
  const {searchText} = useUsersStore.getState()

  const filtered =
  type === 'All'
    ? users
    : users.filter((u) => u.userType === type)

  const finalFiltered = searchText
  ? filtered.filter((u) =>
      u.name.toLowerCase().includes(searchText.toLowerCase())
    )
  : filtered
  const onRefresh = async () => {
    setRefreshing(true)
    await loadFromDB()
    setRefreshing(false)
  }

  return (
    <FlatList
      data={finalFiltered}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => <UserItem user={item} />}
      refreshControl={
        <RefreshControl refreshing={refreshing || loading} onRefresh={onRefresh} />
      }
    />
  )
}

export default function ListScreen() {
  const { selectedTab, setSelectedTab } = useUsersStore()
  const [page, setPage] = useState(TabLabels.indexOf(selectedTab))
  const nav = useNavigation()
  useLayoutEffect(() => {
   nav.setOptions({
    headerRight: () => (
      <TouchableOpacity onPress={() => nav.navigate('AddUser' as never)} style={{padding:8}}>
        <Text style={{color:'#007AFF',fontSize:16}}>+ Add</Text>
      </TouchableOpacity>
    ),
    })
  }, [nav])
  useEffect(() => {
    setPage(TabLabels.indexOf(selectedTab))
  }, [selectedTab])

  return (
    <View style={{flex:1}} >
        <TabSwitcher/>
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
    borderColor: '#ddd',
  },
  name: { fontWeight: '600', fontSize: 16 },
  email: { color: '#555', fontSize: 14 },
  type: { color: '#999', fontSize: 12 },
})