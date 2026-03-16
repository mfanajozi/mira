import React, { useState, useRef, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Alert } from 'react-native';
import { Audio } from 'expo-av';
import * as Haptics from 'expo-haptics';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withRepeat, 
  withTiming, 
  withSpring,
  interpolate,
  Extrapolate
} from 'react-native-reanimated';
import { saveAudioToLocal, logToDatabase } from '../scripts/Storage';

interface RecordingButtonProps {
  onRecordingComplete: (uri: string | null) => void;
}

const PulseRing = React.memo(({ isRecording }: { isRecording: boolean }) => {
  const pulse = useSharedValue(0);

  useEffect(() => {
    if (isRecording) {
      pulse.value = withRepeat(
        withTiming(1, { duration: 1500 }),
        -1,
        false
      );
    } else {
      pulse.value = 0;
    }
  }, [isRecording, pulse]);

  const animatedStyle = useAnimatedStyle(() => {
    const scale = interpolate(pulse.value, [0, 1], [1, 2.5]);
    const opacity = interpolate(pulse.value, [0, 0.5, 1], [0.6, 0.3, 0]);
    
    return {
      transform: [{ scale }],
      opacity: isRecording ? opacity : 0,
    };
  });

  return <Animated.View style={[styles.pulseRing, animatedStyle]} />;
});

export const RecordingButton: React.FC<RecordingButtonProps> = ({ onRecordingComplete }) => {
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [timer, setTimer] = useState(0);
  const timerInterval = useRef<any>(null);
  const buttonScale = useSharedValue(1);

  async function startRecording() {
    try {
      const permission = await Audio.requestPermissionsAsync();
      if (permission.status !== 'granted') return;

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      
      setRecording(recording);
      setIsRecording(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      
      buttonScale.value = withSpring(1.2);

      setTimer(0);
      timerInterval.current = setInterval(() => {
        setTimer((t) => t + 1);
      }, 1000);

    } catch (err) {
      console.error('Failed to start recording', err);
    }
  }

  async function stopRecording() {
    if (!recording) return;

    setIsRecording(false);
    if (timerInterval.current) clearInterval(timerInterval.current);
    
    buttonScale.value = withSpring(1);

    try {
      await recording.stopAndUnloadAsync();
      const tempUri = recording.getURI();
      setRecording(null);
      
      if (tempUri) {
        Alert.alert(
          "Voice Report",
          "Send this anonymous voice report?",
          [
            { text: "Cancel", style: "cancel", onPress: () => onRecordingComplete(null) },
            { text: "Send", onPress: async () => {
              try {
                const permanentUri = await saveAudioToLocal(tempUri);
                await logToDatabase('voice', permanentUri);
                onRecordingComplete(permanentUri);
              } catch (err) {
                console.error("Failed to save report:", err);
              }
            }}
          ]
        );
      }
    } catch (error) {
      console.error('Failed to stop recording', error);
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const animatedButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  return (
    <View style={styles.container}>
      <View style={styles.timerContainer}>
        {isRecording ? (
          <Text style={styles.timerText}>{formatTime(timer)}</Text>
        ) : (
          <View style={{ height: 32 }} /> // Static spacer
        )}
      </View>
      
      <View style={styles.buttonWrapper}>
        <PulseRing isRecording={isRecording} />
        <PulseRing isRecording={isRecording} />
        
        <TouchableOpacity
          activeOpacity={0.9}
          onLongPress={startRecording}
          onPressOut={() => {
            if (isRecording) stopRecording();
          }}
          delayLongPress={200}
        >
          <Animated.View style={[styles.mainButton, animatedButtonStyle]}>
            <View style={styles.innerContent}>
              {isRecording ? (
                 <View style={styles.stopIcon} />
              ) : (
                <View style={styles.micIcon} />
              )}
            </View>
          </Animated.View>
        </TouchableOpacity>
      </View>
      
      <View style={styles.labelContainer}>
        <Text style={styles.label}>RECORD</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    width: '100%',
  },
  timerContainer: {
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonWrapper: {
    width: 140,
    height: 140,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pulseRing: {
    position: 'absolute',
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: '#FF0000',
  },
  mainButton: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: '#FF0000', // Solid Red
    justifyContent: 'center',
    alignItems: 'center',
    // 3D Shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
    borderBottomWidth: 5,
    borderBottomColor: '#CC0000',
  },
  innerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  micIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.4)',
  },
  stopIcon: {
    width: 24,
    height: 24,
    borderRadius: 4,
    backgroundColor: '#FFF',
  },
  labelContainer: {
    height: 40,
    justifyContent: 'center',
  },
  label: {
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 4,
    color: '#FF0000',
  },
  timerText: {
    fontSize: 24,
    color: '#FF0000',
    fontWeight: 'bold',
  }
});

