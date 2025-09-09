import React, { useEffect, useState } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native'
import { useForm, Controller } from 'react-hook-form'
import { useUsersStore } from '../store/useUsers'
import type { UserRecord } from '../db/sqlite'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import type { RootStackParamList } from '../../App'

type Props = NativeStackScreenProps<RootStackParamList, 'AddUser'>

type FormValues = {
  name: string
  email?: string
}

const nameRegex = /^[A-Za-z ]+$/

export default function AddUserScreen({ route, navigation }: Props) {
  const addUser = useUsersStore((s) => s.addUser)
  const updateUser = useUsersStore((s) => s.updateUser)
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({ defaultValues: { name: '', email: '' } })

  const [userType, setUserType] = useState<UserRecord['userType']>('Manager')
  const editingUser = route.params?.user

  useEffect(() => {
    if (editingUser) {
      reset({ name: editingUser.name ?? '', email: editingUser.email ?? '' })
      setUserType(editingUser.userType ?? 'Manager')
    } else {
      reset({ name: '', email: '' })
      setUserType('Manager')
    }
  }, [editingUser, reset])

  const onSubmit = async (vals: FormValues) => {
    const trimmedName = vals.name.trim()
    const trimmedEmail = vals.email?.trim() || null
    if (editingUser) {
      const user: UserRecord = {
        id: editingUser.id,
        name: trimmedName,
        email: trimmedEmail,
        userType,
      }
      try {
        await updateUser(user)
        Alert.alert('Saved', 'User updated', [{ text: 'OK', onPress: () => navigation.goBack() }])
      } catch {
        Alert.alert('Error', 'Failed to update user')
      }
    } else {
      const id = Date.now().toString()
      const user: UserRecord = {
        id,
        name: trimmedName,
        email: trimmedEmail,
        userType,
      }
      try {
        await addUser(user)
        Alert.alert('Saved', 'User added locally', [{ text: 'OK', onPress: () => navigation.goBack() }])
        reset()
      } catch {
        Alert.alert('Error', 'Failed to save user')
      }
    }
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.select({ ios: 'padding', android: undefined })}
      style={styles.container}
    >
      <View style={styles.form}>
        <Text style={styles.label}>Name</Text>
        <Controller
          control={control}
          name="name"
          rules={{
            required: 'Name is required',
            maxLength: { value: 50, message: 'Max 50 characters' },
            validate: (v) => (nameRegex.test(v) ? true : 'Only alphabets and spaces allowed'),
          }}
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              value={value}
              onBlur={onBlur}
              onChangeText={onChange}
              placeholder="Full name"
              style={[styles.input, errors.name && styles.inputError]}
              returnKeyType="next"
            />
          )}
        />
        {errors.name && <Text style={styles.error}>{errors.name.message}</Text>}

        <Text style={styles.label}>Email (optional)</Text>
        <Controller
          control={control}
          name="email"
          rules={{
            validate: (v) =>
              !v || /^\S+@\S+\.\S+$/.test(v) ? true : 'Invalid email format',
          }}
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              value={value}
              onBlur={onBlur}
              onChangeText={onChange}
              placeholder="email@example.com"
              keyboardType="email-address"
              style={[styles.input, errors.email && styles.inputError]}
            />
          )}
        />
        {errors.email && <Text style={styles.error}>{errors.email.message}</Text>}

        <Text style={styles.label}>User type</Text>
        <View style={styles.typeRow}>
          {(['Admin', 'Manager', 'Other'] as Array<UserRecord['userType']>).map((t) => (
            <TouchableOpacity
              key={t}
              onPress={() => setUserType(t)}
              style={[styles.typeBtn, userType === t && styles.typeActive]}
            >
              <Text style={userType === t ? styles.typeActiveText : styles.typeText}>{t}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity onPress={handleSubmit(onSubmit)} style={styles.saveBtn}>
          <Text style={styles.saveText}>{editingUser ? 'Update' : 'Save'}</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  form: { padding: 16 },
  label: { fontSize: 14, marginBottom: 6, color: '#222' },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 8,
  },
  inputError: { borderColor: '#ff4d4f' },
  error: { color: '#ff4d4f', marginBottom: 8 },
  typeRow: { flexDirection: 'row', marginBottom: 18 },
  typeBtn: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    marginRight: 8,
  },
  typeActive: { backgroundColor: '#007AFF', borderColor: '#007AFF' },
  typeText: { color: '#333' },
  typeActiveText: { color: '#fff' },
  saveBtn: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveText: { color: '#fff', fontWeight: '600' },
})