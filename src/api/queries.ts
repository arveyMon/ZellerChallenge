import { gql } from '@apollo/client'
import { apolloClient } from './apollo'
import { UserRecord } from '../db/sqlite'
import { useUsersStore } from '../store/useUsers'

export const LIST_ZELLER_CUSTOMERS = gql`
  query ListZellerCustomers($limit: Int, $nextToken: String) {
    listZellerCustomers(limit: $limit, nextToken: $nextToken) {
      items {
        id
        name
        email
        role
      }
      nextToken
    }
  }
`

interface ApiUser {
  id: string
  name: string
  email?: string | null
  role?: string | null
}

interface ListZellerCustomersResponse {
  listZellerCustomers: {
    items: ApiUser[]
    nextToken?: string | null
  }
}

export async function syncCustomersFromApi(): Promise<void> {
  const allUsers: ApiUser[] = []
  let nextToken: string | null | undefined = null

do {
  const response = await apolloClient.query<ListZellerCustomersResponse>({
    query: LIST_ZELLER_CUSTOMERS,
    variables: { limit: 50, nextToken },
    fetchPolicy: 'network-only',
  }) as { data: ListZellerCustomersResponse }

  const result = response.data

  if (result?.listZellerCustomers?.items) {
    allUsers.push(...result.listZellerCustomers.items)
    nextToken = result.listZellerCustomers.nextToken
  } else {
    nextToken = null
  }
} while (nextToken)

  const users: UserRecord[] = allUsers.map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email ?? null,
    userType: (u.role as UserRecord['userType']) ?? 'Other',
    createdAt: undefined,
    updatedAt: undefined,
  }))

  const sync = useUsersStore.getState().syncFromApi
  await sync(users)
}