import AsyncStorage from '@react-native-async-storage/async-storage';

export async function setStorageItem<T>(key: string, value: T) {
  await AsyncStorage.setItem(key, JSON.stringify(value));
}

export async function getStorageItem<T>(key: string): Promise<T | null> {
  const value = await AsyncStorage.getItem(key);
  if (!value) {
    return null;
  }

  try {
    return JSON.parse(value) as T;
  } catch (error) {
    console.warn(`Error parsing storage item ${key}:`, error);
    return null;
  }
}

export async function removeStorageItem(key: string) {
  await AsyncStorage.removeItem(key);
}

export async function clearStorage() {
  await AsyncStorage.clear();
}
