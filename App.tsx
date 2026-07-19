import "./global.css";
import { StatusBar } from 'expo-status-bar';
import AppNavigator from './src/navigation/AppNavigator';
import InstallPromptWeb from './src/components/InstallPromptWeb';

export default function App() {
  return (
    <>
      <AppNavigator />
      <InstallPromptWeb />
      <StatusBar style="light" />
    </>
  );
}
