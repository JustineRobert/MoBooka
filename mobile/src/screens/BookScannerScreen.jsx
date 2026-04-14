import React, { useEffect, useState } from 'react';
import { View, Text, Button, ActivityIndicator, Alert, StyleSheet } from 'react-native';
import { BarCodeScanner } from 'expo-barcode-scanner';
import * as Network from 'expo-network';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../context/AuthContext';
import { fetchBookByBarcode } from '../api/api';

export default function BookScannerScreen({ navigation }) {
  const { user, token } = useAuth();
  const [hasPermission, setHasPermission] = useState(null);
  const [scanning, setScanning] = useState(true);
  const [book, setBook] = useState(null);
  const [connected, setConnected] = useState(true);

  useEffect(() => {
    const requestPermission = async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync();
      setHasPermission(status === 'granted');
      const state = await Network.getNetworkStateAsync();
      setConnected(state.isConnected && state.isInternetReachable);
    };
    requestPermission();
  }, []);

  const handleBarCodeScanned = async ({ data }) => {
    setScanning(false);

    if (!data) {
      Alert.alert('Scan failed', 'No barcode data was read.');
      setScanning(true);
      return;
    }

    if (!connected) {
      Alert.alert('Offline mode', 'You are offline. Please rescan when online to load book details.');
      setScanning(true);
      return;
    }

    try {
      const response = await fetchBookByBarcode(data);
      if (!response) throw new Error('Book not found');
      setBook(response);
      navigation.navigate('BookDetail', { bookId: response._id });
    } catch (err) {
      Alert.alert('Book lookup failed', err.message);
    } finally {
      setScanning(true);
    }
  };

  if (hasPermission === null) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color="#0a71ff" />
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View style={styles.container}>
        <Text style={styles.error}>Camera access is required for barcode scanning.</Text>
        <Button title="Go back" onPress={() => navigation.goBack()} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Scan book barcode</Text>
      <View style={styles.scannerBox}>
        <BarCodeScanner
          onBarCodeScanned={scanning ? handleBarCodeScanned : undefined}
          style={StyleSheet.absoluteFillObject}
        />
      </View>
      <Text style={styles.helpText}>{connected ? 'Ready to scan' : 'Offline: connect to internet to fetch book details'}</Text>
      <Button title="Back to store" onPress={() => navigation.navigate('BookList')} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 20 },
  centered: { justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 24, fontWeight: '700', marginBottom: 16 },
  scannerBox: { flex: 1, borderRadius: 18, overflow: 'hidden', borderWidth: 2, borderColor: '#0a71ff' },
  helpText: { marginTop: 16, fontSize: 16, color: '#555', textAlign: 'center' },
  error: { color: '#d32f2f', marginBottom: 16 },
});
