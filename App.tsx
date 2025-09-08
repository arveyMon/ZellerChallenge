import React, { useEffect } from 'react'
import { ActivityIndicator } from 'react-native'
import { ApolloProvider } from '@apollo/client/react'
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context'
import { apolloClient } from './src/api/apollo'
import { useUsersStore } from './src/store/useUsers'
import { syncCustomersFromApi } from './src/api/queries'
import ListScreen from './src/screens/ListScreen'
import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import AddUserScreen from './src/screens/AddUserScreen'

const Stack = createNativeStackNavigator()

function RootNav() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Users" component={ListScreen} />
      <Stack.Screen name="AddUser" component={AddUserScreen} />
    </Stack.Navigator>
  )
}

function Root() {
  const { loadFromDB, users, loading } = useUsersStore()

  useEffect(() => {
    const init = async () => {
      await loadFromDB()
      try {
        await syncCustomersFromApi()
      } catch {
        console.warn('API sync failed, using local DB only')
      }
    }
    init()
  }, [loadFromDB])

  if (loading && users.length === 0) {
    return <ActivityIndicator size="large" style={{ flex: 1 }} />
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ListScreen />
    </SafeAreaView>
  )
}

export default function App() {
  return (
    <ApolloProvider client={apolloClient}>
      <SafeAreaProvider>
        <NavigationContainer>
          <RootNav />
        </NavigationContainer>
      </SafeAreaProvider>
    </ApolloProvider>
  )
}