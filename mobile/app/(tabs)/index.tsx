import React, { useState } from 'react';
import { Button, View, Text, Image, StyleSheet, ActivityIndicator, Alert, ScrollView } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';

// --- Configuration ---
// !!! IMPORTANT: REPLACE WITH YOUR ACTUAL LOCAL IP ADDRESS !!!
// Example: const API_URL = 'http://192.168.1.5:5000/api/analyze-crop';
const API_URL = 'http://10.118.56.60:5000/api/analyze-crop'; 
// !!!                                                     !!!
// --- End Configuration ---

export default function HomeScreen() { // Use 'HomeScreen' or 'App' depending on your file name
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const pickImage = async () => {
    // Request permissions
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission required', 'Need access to your photos to pick an image.');
      return;
    }

    // Pick the image
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.5, // Keep quality low for fast upload
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
      setResult(null); // Clear previous result
    }
  };

  const uploadImage = async () => {
    if (!image) {
      Alert.alert('Error', 'Please select an image first.');
      return;
    }

    setLoading(true);
    setResult(null);

    // 1. Create FormData object for image upload
    const formData = new FormData();
    
    // Get the file extension and type
    const uriParts = image.split('.');
    const fileType = uriParts[uriParts.length - 1];
    
    formData.append('image', {
      uri: image,
      type: `image/${fileType === 'jpg' ? 'jpeg' : fileType}`, 
      name: `leaf_image.${fileType}`,
    });

    try {
      // 2. Send the image to the Flask API
      const response = await axios.post(API_URL, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 15000 // 15 second timeout
      });

      // 3. Process the dummy result from the backend
      setResult(response.data.detection_result);
      
    } catch (error) {
      console.error('API Error:', error.response || error.message);
      Alert.alert(
        'API Error', 
        `Could not connect to the backend. Check your IP and server status: ${error.message}`
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>KrishiSense Prototype (RGB Demo)</Text>

      {/* 1. Image Picker Button */}
      <Button title="1. Pick RGB Crop Leaf Image" onPress={pickImage} />

      {/* 2. Display Image */}
      {image && <Image source={{ uri: image }} style={styles.image} />}

      {/* 3. Upload/Analyze Button */}
      <View style={{ marginTop: 20 }}>
        <Button
          title={loading ? "Analyzing..." : "2. Analyze Image"}
          onPress={uploadImage}
          disabled={loading || !image}
          color="#4CAF50"
        />
      </View>

      {/* 4. Results Section */}
      {loading && <ActivityIndicator size="large" color="#0000ff" style={{ marginTop: 20 }} />}
      {result && (
        <View style={styles.resultBox}>
          <Text style={styles.resultTitle}>✅ AI Detection Result (Demo)</Text>
          <Text style={styles.resultText}>• **Disease:** {result.disease}</Text>
          <Text style={styles.resultText}>• **Confidence:** {result.confidence}</Text>
          <Text style={styles.resultText}>• **Suggestion:** {result.suggestion}</Text>
          <Text style={[styles.resultText, { marginTop: 10, fontWeight: 'bold', color: 'red' }]}>
             (Prototype uses DUMMY data to demo the pipeline.)
          </Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, alignItems: 'center', justifyContent: 'center', padding: 20 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 30 },
  image: { width: 300, height: 200, marginVertical: 20, borderRadius: 10, resizeMode: 'contain' },
  resultBox: { marginTop: 30, padding: 15, borderWidth: 2, borderColor: '#4CAF50', borderRadius: 8, width: '100%' },
  resultTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 5, color: '#4CAF50' },
  resultText: { fontSize: 16, marginBottom: 4 }
});