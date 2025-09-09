// __tests__/useUsers.store.test.ts
import { act } from '@testing-library/react-native'
import { useUsersStore } from '../src/store/useUsers'
import * as db from '../src/db/sqlite'

jest.mock('../src/db/sqlite')

const mocked = db as jest.Mocked<typeof db>

describe('useUsersStore', () => {
  beforeEach(() => {
    jest.resetAllMocks()
    mocked.getAllUsers.mockResolvedValue([])
    mocked.insertUser.mockResolvedValue()
    mocked.updateUser.mockResolvedValue()
    mocked.deleteUser.mockResolvedValue()
    mocked.bulkUpsertUsers.mockResolvedValue()
  })

  it('loads users from DB', async () => {
    mocked.getAllUsers.mockResolvedValueOnce([
      { id: '1', name: 'A', email: null, userType: 'Admin' },
    ])
    await act(async () => {
      await useUsersStore.getState().loadFromDB()
    })
    const state = useUsersStore.getState()
    expect(state.users.length).toBe(1)
    expect(state.users[0].name).toBe('A')
  })

  it('addUser calls db.insertUser and reloads', async () => {
    mocked.getAllUsers.mockResolvedValueOnce([])
    await act(async () => {
      await useUsersStore.getState().addUser({ id: '2', name: 'B', email: null, userType: 'Manager' })
    })
    expect(mocked.insertUser).toHaveBeenCalledWith(expect.objectContaining({ id: '2', name: 'B' }))
    expect(mocked.getAllUsers).toHaveBeenCalled()
  })

  it('deleteUserById calls db.deleteUser and reloads', async () => {
    await act(async () => {
      await useUsersStore.getState().deleteUserById('x')
    })
    expect(mocked.deleteUser).toHaveBeenCalledWith('x')
  })
})