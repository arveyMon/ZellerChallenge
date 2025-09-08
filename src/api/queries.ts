import { gql } from '@apollo/client'
import { apolloClient } from './apollo'
import { UserRecord } from '../db/sqlite'
import { useUsersStore } from '../store/useUsers'

export const LIST_ZELLER_CUSTOMERS = gql`
  query ListZellerCustomers {
    listZellerCustomers {
      id
      name
      email
      userType
      createdAt
      updatedAt
    }
  }
`

interface ApiUser {
  id: string
  name: string
  email?: string | null
  userType?: string | null
  createdAt?: string | null
  updatedAt?: string | null
}

interface ListZellerCustomersResponse {
  listZellerCustomers: ApiUser[]
}

export async function syncCustomersFromApi(): Promise<void> {
  const { data } = await apolloClient.query<ListZellerCustomersResponse>({
    query: LIST_ZELLER_CUSTOMERS,
    fetchPolicy: 'network-only',
  })

  if (data?.listZellerCustomers) {
    const users: UserRecord[] = data.listZellerCustomers.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email ?? null,
      userType: (u.userType as UserRecord['userType']) ?? 'Other',
      createdAt: u.createdAt ?? undefined,
      updatedAt: u.updatedAt ?? undefined,
    }))

    const sync = useUsersStore.getState().syncFromApi
    await sync(users)
  }
}