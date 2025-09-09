import React, { useEffect, useState } from 'react'
import { ActivityIndicator } from 'react-native'
import { ApolloProvider } from '@apollo/client/react'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { apolloClient } from './src/api/apollo'
import ListScreen from './src/screens/ListScreen'
import AddUserScreen from './src/screens/AddUserScreen'
import { useUsersStore } from './src/store/useUsers'
import { syncCustomersFromApi } from './src/api/queries'

export type RootStackParamList = {
  Users: undefined
  AddUser: { user?: { id: string; name: string; email?: string | null; userType?: 'Admin'|'Manager'|'Other' } } | undefined
}

const Stack = createNativeStackNavigator<RootStackParamList>()

function Root() {
  const loadFromDB = useUsersStore((s) => s.loadFromDB)
  const users = useUsersStore((s) => s.users)
  const [initializing, setInitializing] = useState(true)

  useEffect(() => {
    let cancelled = false
    const init = async () => {
      await loadFromDB()
      try {
        await syncCustomersFromApi()
      } catch (e) {
        console.warn('sync failed', e)
      }
      if (cancelled) return
      await loadFromDB()
      setInitializing(false)
    }
    void init()
    return () => {
      cancelled = true
    }
  }, [loadFromDB])

  if (initializing && users.length === 0) {
    return <ActivityIndicator size="large" style={{ flex: 1 }} />
  }

  return null
}

export default function App() {
  return (
    <ApolloProvider client={apolloClient}>
      <SafeAreaProvider>
        <NavigationContainer>
          <Stack.Navigator initialRouteName="Users">
            <Stack.Screen name="Users" component={ListScreen} />
            <Stack.Screen name="AddUser" component={AddUserScreen} />
          </Stack.Navigator>
          <Root />
        </NavigationContainer>
      </SafeAreaProvider>
    </ApolloProvider>
  )
}