export interface UserAccount {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  createdAt: string;
  role: string;
}

const STORAGE_USERS_KEY = 'argus_registered_users';
const STORAGE_CURRENT_USER_KEY = 'argus_user';
const AUTH_COOKIE_NAME = 'argus_auth';

export const validatePassword = (password: string): { isValid: boolean; message?: string } => {
  if (password.length < 8) {
    return { isValid: false, message: 'Password must be at least 8 characters long.' };
  }
  if (!/[A-Z]/.test(password)) {
    return { isValid: false, message: 'Password must contain at least 1 uppercase letter (A-Z).' };
  }
  if (!/[0-9]/.test(password)) {
    return { isValid: false, message: 'Password must contain at least 1 number (0-9).' };
  }
  if (!/[^a-zA-Z0-9]/.test(password)) {
    return { isValid: false, message: 'Password must contain at least 1 special character (!@#$%^&*).' };
  }
  return { isValid: true };
};

export const getRegisteredUsers = (): UserAccount[] => {
  if (typeof window === 'undefined') return [];
  try {
    const data = localStorage.getItem(STORAGE_USERS_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

export const saveRegisteredUsers = (users: UserAccount[]): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(users));
};

export const registerUser = (name: string, email: string, password: string): { success: boolean; user?: UserAccount; error?: string } => {
  const cleanEmail = email.trim().toLowerCase();
  const cleanName = name.trim();

  if (!cleanName || !cleanEmail || !password) {
    return { success: false, error: 'All fields are required.' };
  }

  const passVal = validatePassword(password);
  if (!passVal.isValid) {
    return { success: false, error: passVal.message };
  }

  const users = getRegisteredUsers();
  const existing = users.find((u) => u.email.toLowerCase() === cleanEmail);
  if (existing) {
    return { success: false, error: 'An account with this email already exists. Please log in.' };
  }

  const newUser: UserAccount = {
    id: `usr_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
    name: cleanName,
    email: cleanEmail,
    passwordHash: btoa(password), // simple base64 hash simulation
    createdAt: new Date().toISOString().split('T')[0],
    role: 'Enterprise Security Analyst',
  };

  users.push(newUser);
  saveRegisteredUsers(users);

  // Auto session establishment
  setCurrentUserSession(newUser);

  return { success: true, user: newUser };
};

export const loginUser = (email: string, password: string): { success: boolean; user?: UserAccount; error?: string } => {
  const cleanEmail = email.trim().toLowerCase();
  if (!cleanEmail || !password) {
    return { success: false, error: 'Invalid email or password.' };
  }

  const users = getRegisteredUsers();
  const foundUser = users.find((u) => u.email.toLowerCase() === cleanEmail);

  if (!foundUser) {
    return { success: false, error: 'Invalid email or password.' };
  }

  if (foundUser.passwordHash !== btoa(password)) {
    return { success: false, error: 'Invalid email or password.' };
  }

  setCurrentUserSession(foundUser);
  return { success: true, user: foundUser };
};

export const setCurrentUserSession = (user: UserAccount): void => {
  if (typeof window === 'undefined') return;
  const sessionUser = { id: user.id, name: user.name, email: user.email, role: user.role };
  localStorage.setItem(STORAGE_CURRENT_USER_KEY, JSON.stringify(sessionUser));
  document.cookie = `${AUTH_COOKIE_NAME}=true; path=/; max-age=86400`;
};

export const clearCurrentUserSession = (): void => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_CURRENT_USER_KEY);
  document.cookie = `${AUTH_COOKIE_NAME}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
};

export const getCurrentUserSession = (): { id?: string; name: string; email: string; role?: string } | null => {
  if (typeof window === 'undefined') return null;
  const data = localStorage.getItem(STORAGE_CURRENT_USER_KEY);
  const authCookie = document.cookie.split('; ').find(row => row.startsWith(`${AUTH_COOKIE_NAME}=`));
  if (data && authCookie) {
    try {
      return JSON.parse(data);
    } catch {
      return null;
    }
  }
  return null;
};
