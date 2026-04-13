import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthProvider } from './src/context/AuthContext';
import LoginScreen from './src/screens/LoginScreen';
import SignupScreen from './src/screens/SignupScreen';
import BookListScreen from './src/screens/BookListScreen';
import BookDetailScreen from './src/screens/BookDetailScreen';
import DashboardScreen from './src/screens/DashboardScreen';
import { StatusBar } from 'expo-status-bar';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <AuthProvider>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="BookList">
          <Stack.Screen name="BookList" component={BookListScreen} options={{ title: 'MoBooka' }} />
          <Stack.Screen name="BookDetail" component={BookDetailScreen} options={{ title: 'Book details' }} />
          <Stack.Screen name="Login" component={LoginScreen} options={{ title: 'Login' }} />
          <Stack.Screen name="Signup" component={SignupScreen} options={{ title: 'Sign up' }} />
          <Stack.Screen name="Dashboard" component={DashboardScreen} options={{ title: 'Dashboard' }} />
        </Stack.Navigator>
      </NavigationContainer>
      <StatusBar style="light" />
    </AuthProvider>
  );
}
