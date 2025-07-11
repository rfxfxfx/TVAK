import { useColorScheme as useNativewindColorScheme } from "nativewind";
import AsyncStorage from '@react-native-async-storage/async-storage';

export function useColorScheme() {
  const { colorScheme, setColorScheme, toggleColorScheme } = useNativewindColorScheme();

  const setAndStoreColorScheme = (newScheme) => {
    setColorScheme(newScheme);
    AsyncStorage.setItem('colorScheme', newScheme);
  };

  return { colorScheme, setColorScheme: setAndStoreColorScheme, toggleColorScheme };
}