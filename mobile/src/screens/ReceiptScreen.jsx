import React, { useEffect, useState } from 'react';
import { View, Text, Button, ActivityIndicator, StyleSheet, ScrollView, Alert } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { fetchTransaction } from '../api/api';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';

export default function ReceiptScreen({ route, navigation }) {
  const { transactionId } = route.params || {};
  const { token } = useAuth();
  const [receipt, setReceipt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadReceipt = async () => {
      if (!token || !transactionId) return;
      setLoading(true);
      try {
        const data = await fetchTransaction(transactionId, token);
        setReceipt(data.transaction);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    loadReceipt();
  }, [token, transactionId]);

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color="#0a71ff" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.error}>{error}</Text>
      </View>
    );
  }

  if (!receipt) {
    return (
      <View style={styles.container}>
        <Text style={styles.empty}>Receipt not available.</Text>
      </View>
    );
  }

  const buildReceiptHtml = () => {
    return `
      <html>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; padding: 24px;">
          <h1>MoBooka Receipt</h1>
          <p><strong>Receipt #: </strong>${receipt.receiptNumber || 'N/A'}</p>
          <p><strong>Reference: </strong>${receipt.reference}</p>
          <p><strong>Status: </strong>${receipt.status}</p>
          <p><strong>Provider: </strong>${receipt.provider}</p>
          <p><strong>Amount: </strong>UGX ${receipt.amount.toFixed(2)}</p>
          <p><strong>Commission: </strong>UGX ${receipt.commission.toFixed(2)}</p>
          <p><strong>Paid at: </strong>${receipt.paidAt ? new Date(receipt.paidAt).toLocaleString() : 'Pending'}</p>
          <h2>Book</h2>
          <p><strong>Title: </strong>${receipt.book?.title || 'N/A'}</p>
          <p><strong>Category: </strong>${receipt.book?.category || 'N/A'}</p>
          <p><strong>Price: </strong>UGX ${receipt.book?.price?.toFixed(2) || '0.00'}</p>
          <h2>Buyer</h2>
          <p><strong>Name: </strong>${receipt.buyer?.name || 'N/A'}</p>
          <p><strong>Email: </strong>${receipt.buyer?.email || 'N/A'}</p>
          <p><strong>Phone: </strong>${receipt.buyer?.phone || 'N/A'}</p>
        </body>
      </html>
    `;
  };

  const handleExportPDF = async () => {
    try {
      const html = buildReceiptHtml();
      const { uri } = await Print.printToFileAsync({ html });
      if (!uri) throw new Error('Could not create receipt PDF');

      const available = await Sharing.isAvailableAsync();
      if (!available) {
        Alert.alert('Export unavailable', 'Sharing is not available on this device.');
        return;
      }

      await Sharing.shareAsync(uri, {
        mimeType: 'application/pdf',
        dialogTitle: 'Share MoBooka receipt',
      });
    } catch (err) {
      Alert.alert('Export failed', err.message);
    }
  };

  const handlePreviewPDF = async () => {
    try {
      const html = buildReceiptHtml();
      await Print.printAsync({ html });
    } catch (err) {
      Alert.alert('Preview failed', err.message);
    }
  };

  const handleExportJSON = async () => {
    try {
      const jsonContent = JSON.stringify(receipt, null, 2);
      const fileName = `receipt-${receipt._id || receipt.receiptNumber || 'export'}.json`;
      const fileUri = `${FileSystem.documentDirectory}${fileName}`;

      await FileSystem.writeAsStringAsync(fileUri, jsonContent, {
        encoding: FileSystem.EncodingType.UTF8,
      });

      const available = await Sharing.isAvailableAsync();
      if (!available) {
        Alert.alert('Export unavailable', 'Sharing is not available on this device.');
        return;
      }

      await Sharing.shareAsync(fileUri, {
        mimeType: 'application/json',
        dialogTitle: 'Share receipt JSON',
      });
    } catch (err) {
      Alert.alert('JSON export failed', err.message);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Receipt</Text>
      <View style={styles.card}>
        <Text style={styles.heading}>Transaction details</Text>
        <Text>Receipt #: {receipt.receiptNumber || 'N/A'}</Text>
        <Text>Reference: {receipt.reference}</Text>
        <Text>Status: {receipt.status}</Text>
        <Text>Provider: {receipt.provider}</Text>
        <Text>Amount: UGX {receipt.amount.toFixed(2)}</Text>
        <Text>Commission: UGX {receipt.commission.toFixed(2)}</Text>
        <Text>Paid at: {receipt.paidAt ? new Date(receipt.paidAt).toLocaleString() : 'Pending'}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.heading}>Book</Text>
        <Text>Title: {receipt.book?.title}</Text>
        <Text>Category: {receipt.book?.category}</Text>
        <Text>Price: UGX {receipt.book?.price?.toFixed(2) || '0.00'}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.heading}>Buyer</Text>
        <Text>Name: {receipt.buyer?.name}</Text>
        <Text>Email: {receipt.buyer?.email}</Text>
        <Text>Phone: {receipt.buyer?.phone || 'Not provided'}</Text>
      </View>

      <Button title="Preview receipt PDF" onPress={handlePreviewPDF} />
      <View style={{ height: 12 }} />
      <Button title="Export receipt PDF" onPress={handleExportPDF} />
      <View style={{ height: 12 }} />
      <Button title="Export receipt as JSON" onPress={handleExportJSON} />
      <View style={{ height: 12 }} />
      <Button title="Back to dashboard" onPress={() => navigation.navigate('Dashboard')} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: '#fff', flexGrow: 1 },
  centered: { justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 26, fontWeight: '700', marginBottom: 20 },
  card: { backgroundColor: '#f4f7ff', padding: 16, borderRadius: 14, marginBottom: 16, borderWidth: 1, borderColor: '#dfe5f5' },
  heading: { fontSize: 18, fontWeight: '700', marginBottom: 10 },
  error: { color: '#d32f2f', fontSize: 16 },
  empty: { color: '#666', fontSize: 16 },
});
