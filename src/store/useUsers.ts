import { create } from 'zustand'
import { UserRecord, getAllUsers, insertUser, updateUser, deleteUser, bulkUpsertUsers } from '../db/sqlite'

type TabType = 'All' | 'Admin' | 'Manager'

interface UsersState {
  users: UserRecord[]
  loading: boolean
  searchText: string
  selectedTab: TabType
  setUsers: (u: UserRecord[]) => void
  loadFromDB: () => Promise<void>
  addUser: (u: UserRecord) => Promise<void>
  updateUser: (u: UserRecord) => Promise<void>
  deleteUserById: (id: string) => Promise<void>
  setSearchText: (s: string) => void
  setSelectedTab: (t: TabType) => void
  syncFromApi: (users: UserRecord[]) => Promise<void>
}

export const useUsersStore = create<UsersState>((set, get) => ({
  users: [],
  loading: false,
  searchText: '',
  selectedTab: 'All',
  setUsers: (u) => set({ users: u }),
  loadFromDB: async () => {
    set({ loading: true })
    const u = await getAllUsers()
    set({ users: u, loading: false })
  },
  addUser: async (u) => {
    await insertUser(u)
    await get().loadFromDB()
  },
  updateUser: async (u) => {
    await updateUser(u)
    await get().loadFromDB()
  },
  deleteUserById: async (id) => {
    await deleteUser(id)
    await get().loadFromDB()
  },
  setSearchText: (s) => set({ searchText: s }),
  setSelectedTab: (t) => set({ selectedTab: t }),
  syncFromApi: async (users) => {
    await bulkUpsertUsers(users)
    await get().loadFromDB()
  },
}))