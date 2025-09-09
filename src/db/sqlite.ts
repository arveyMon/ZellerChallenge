import SQLite, { SQLiteDatabase } from 'react-native-sqlite-storage';

SQLite.DEBUG(false);
SQLite.enablePromise(true);

export type UserType = 'Admin' | 'Manager' | 'Other';

export interface UserRecord {
  id: string;
  name: string;
  email?: string | null;
  userType?: UserType;
  createdAt?: string;
  updatedAt?: string;
}

let dbInstance: SQLiteDatabase | null = null;

export async function openDB(): Promise<SQLiteDatabase> {
  if (dbInstance) return dbInstance;
  dbInstance = await SQLite.openDatabase({ name: 'ZellerChallengeDB.db', location: 'default' });
  await dbInstance.executeSql(
    `CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY NOT NULL,
      name TEXT NOT NULL,
      email TEXT,
      userType TEXT,
      createdAt TEXT,
      updatedAt TEXT
    );`
  );
  return dbInstance;
}

export async function closeDB() {
  if (dbInstance) {
    await dbInstance.close();
    dbInstance = null;
  }
}

function normType(t?: string | null) {
  if (!t) return 'Other';
  const v = t.trim().toLowerCase();
  return v === 'admin' ? 'Admin' : v === 'manager' ? 'Manager' : 'Other';
}

export async function getAllUsers(): Promise<UserRecord[]> {
  const db = await openDB();
  const [res] = await db.executeSql(`SELECT * FROM users ORDER BY name COLLATE NOCASE ASC;`);
  const out: UserRecord[] = [];
  for (let i = 0; i < res.rows.length; i++) out.push(res.rows.item(i));
  return out;
}

export async function getUsersByType(type: UserType): Promise<UserRecord[]> {
  const db = await openDB();
  const [res] = await db.executeSql(
    `SELECT * FROM users WHERE LOWER(TRIM(userType)) = LOWER(TRIM(?)) ORDER BY name COLLATE NOCASE ASC;`,
    [type]
  );
  const out: UserRecord[] = [];
  for (let i = 0; i < res.rows.length; i++) out.push(res.rows.item(i));
  return out;
}

export async function searchUsersByName(qtext: string): Promise<UserRecord[]> {
  const db = await openDB();
  const [res] = await db.executeSql(
    `SELECT * FROM users WHERE name LIKE ? ORDER BY name COLLATE NOCASE ASC;`,
    [`%${qtext}%`]
  );
  const out: UserRecord[] = [];
  for (let i = 0; i < res.rows.length; i++) out.push(res.rows.item(i));
  return out;
}

export async function insertUser(user: UserRecord): Promise<void> {
  const db = await openDB();
  const now = new Date().toISOString();
  await db.executeSql(
    `INSERT INTO users (id, name, email, userType, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?);`,
    [user.id, user.name, user.email || null, normType(user.userType), now, now]
  );
}

export async function updateUser(user: UserRecord): Promise<void> {
  const db = await openDB();
  const now = new Date().toISOString();
  await db.executeSql(
    `UPDATE users SET name = ?, email = ?, userType = ?, updatedAt = ? WHERE id = ?;`,
    [user.name, user.email || null, normType(user.userType), now, user.id]
  );
}

export async function deleteUser(id: string): Promise<void> {
  const db = await openDB();
  await db.executeSql(`DELETE FROM users WHERE id = ?;`, [id]);
}

export async function bulkUpsertUsers(users: UserRecord[]): Promise<void> {
  const db = await openDB();
  await db.transaction(async (tx) => {
    for (const u of users) {
      const now = new Date().toISOString();
      await tx.executeSql(
        `INSERT OR REPLACE INTO users (id, name, email, userType, createdAt, updatedAt)
         VALUES (?, ?, ?, ?, ?, ?);`,
        [u.id, u.name, u.email || null, normType(u.userType), u.createdAt || now, u.updatedAt || now]
      );
    }
  });
}