// __tests__/AddUser.form.test.tsx
import React from 'react'
import { render, fireEvent, waitFor } from '@testing-library/react-native'
import AddUserScreen from '../src/screens/AddUserScreen'
import { useUsersStore } from '../src/store/useUsers'
import * as db from '../src/db/sqlite'

jest.mock('../src/db/sqlite')
jest.mock('../src/store/useUsers') // keep store stable

const mockedDb = db as jest.Mocked<typeof db>

const createTestProps = (props = {}) => ({
  route: { params: undefined },
  navigation: { goBack: jest.fn() } as any,
  ...props,
})

describe('AddUserScreen validation', () => {
  beforeEach(() => {
    jest.resetAllMocks()
    mockedDb.insertUser.mockResolvedValue()
    mockedDb.updateUser.mockResolvedValue()
  })

  it('shows error for empty name', async () => {
    const props = createTestProps()
    const { getByText, getByPlaceholderText } = render(<AddUserScreen {...props} />)
    const save = getByText(/save/i)
    fireEvent.press(save)
    await waitFor(() => {
      expect(getByText(/Name is required/i)).toBeTruthy()
    })
  })

  it('rejects invalid email', async () => {
    const props = createTestProps()
    const { getByText, getByPlaceholderText } = render(<AddUserScreen {...props} />)
    const nameInp = getByPlaceholderText('Full name')
    const emailInp = getByPlaceholderText('email@example.com')
    fireEvent.changeText(nameInp, 'Ravi Test')
    fireEvent.changeText(emailInp, 'bad-email')
    fireEvent.press(getByText(/save/i))
    await waitFor(() => {
      expect(getByText(/Invalid email format/i)).toBeTruthy()
    })
  })
})