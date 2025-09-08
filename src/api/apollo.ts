import { ApolloClient, InMemoryCache, HttpLink, ApolloLink } from '@apollo/client'
import { ErrorLink } from '@apollo/client/link/error'
import { Platform } from 'react-native'

const GRAPHQL_URL =
  Platform.OS === 'android'
    ? 'http://10.0.2.2:9002/graphql'
    : 'http://localhost:9002/graphql'

interface ApolloErrorShape {
  graphQLErrors?: readonly any[]
  networkError?: Error
}

const errorLink = new ErrorLink((error: unknown) => {
  const e = error as ApolloErrorShape
  if (e.graphQLErrors) {
    e.graphQLErrors.forEach((err: any) => {
      console.warn('[GraphQL error]', err)
    })
  }
  if (e.networkError) {
    console.warn('[Network error]', e.networkError)
  }
})

const httpLink = new HttpLink({ uri: GRAPHQL_URL })

const link = ApolloLink.from([errorLink, httpLink])

export const apolloClient = new ApolloClient({
  link,
  cache: new InMemoryCache(),
})