import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  KeyboardAvoidingView,
  Linking,
  Platform,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

import { RecordingButton } from '@/components/RecordingButton';
import { APP_CONFIG } from '@/constants/Config';
import { logToDatabase } from '@/scripts/Storage';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function HomeScreen() {
  const [message, setMessage] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const router = useRouter();

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 1500);
  }, []);

  const handleSendMessage = async () => {
    if (message.trim() && !isSending) {
      setIsSending(true);
      try {
        await logToDatabase('text', message);
        setMessage('');
      } finally {
        setIsSending(false);
      }
    }
  };

  const handleCall = () => {
    Linking.openURL(`tel:${APP_CONFIG.EMERGENCY_NUMBER}`);
  };

  const handleRecordingComplete = (uri: string | null) => {
    if (uri) {
      // Logic handled in separate recording flow
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          bounces={true}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {/* Top Logo Section */}
          <View style={styles.header}>
            <Image
              source={require('@/assets/images/logo.png')}
              style={styles.logo}
              contentFit="contain"
            />
            {/* Removed MIRA text as requested */}
          </View>

          {/* Title Section */}
          <View style={styles.titleSection}>
            <Text style={styles.title}>{APP_CONFIG.APP_FULL_NAME}</Text>
            <Text style={styles.subtitle}>Report malicious activity anonymously</Text>
          </View>

          {/* Fixed Spacer Section - Prevents jumpiness */}
          <View style={styles.body}>
            <View style={styles.middleSection}>
              <RecordingButton onRecordingComplete={handleRecordingComplete} />
              <Text style={styles.helperText}>Tap & hold to record; release to send</Text>
            </View>

            {/* Input Section */}
            <View style={styles.inputContainer}>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.input}
                  placeholder="Type message here..."
                  placeholderTextColor="#999"
                  value={message}
                  onChangeText={setMessage}
                  onSubmitEditing={handleSendMessage}
                  returnKeyType="send"
                  blurOnSubmit={false}
                />
                <TouchableOpacity
                  onPress={handleSendMessage}
                  style={styles.sendIconButton}
                  disabled={!message.trim() || isSending}
                >
                  {isSending ? (
                    <ActivityIndicator size="small" color="#FF0000" />
                  ) : (
                    <Ionicons
                      name="send"
                      size={22}
                      color={message.trim() ? "#FF0000" : "#999"}
                    />
                  )}
                </TouchableOpacity>
              </View>
            </View>

            {/* Bottom Icons Section */}
            <View style={styles.footer}>
              <TouchableOpacity onPress={handleCall} style={styles.footerButton}>
                <Ionicons name="call" size={28} color="#000" />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => router.push('/livechat')}
                style={styles.footerButton}
              >
                <Ionicons name="chatbubble" size={28} color="#000" />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.homeIndicator} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  header: {
    paddingTop: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 80,
    height: 80,
  },
  titleSection: {
    marginTop: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: SCREEN_HEIGHT < 700 ? 24 : 28,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#000',
    lineHeight: 34,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 8,
    textAlign: 'center',
  },
  body: {
    flex: 1,
    justifyContent: 'space-around', // Distribute space evenly to stop jumping
    minHeight: 400,
  },
  middleSection: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  helperText: {
    fontSize: 14,
    color: '#999',
    marginTop: 10,
    textAlign: 'center',
  },
  inputContainer: {
    width: '100%',
    paddingVertical: 10,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 30,
    paddingHorizontal: 20,
    height: 56,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#000',
    paddingRight: 10,
    // Disable some auto-corrects that can cause height changes on some devices
    includeFontPadding: false,
  },
  sendIconButton: {
    padding: 4,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '60%',
    alignSelf: 'center',
    paddingBottom: 20,
  },
  footerButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  homeIndicator: {
    height: 5,
    width: 134,
    backgroundColor: '#000',
    borderRadius: 100,
    alignSelf: 'center',
    opacity: 0.1,
  },
});
