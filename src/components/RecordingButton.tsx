'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { Mic, MicOff, Square, Waves } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';

interface RecordingButtonProps {
  onRecordingComplete: () => void;
}

export const RecordingButton: React.FC<RecordingButtonProps> = ({ onRecordingComplete }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [timer, setTimer] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const permissionChecked = useRef(false);
  const isBrowser = typeof window !== 'undefined';

  const checkPermission = () => {
    if (!isBrowser || permissionChecked.current) return;
    permissionChecked.current = true;

    navigator.mediaDevices.getUserMedia({ audio: true })
      .then(stream => {
        stream.getTracks().forEach(track => track.stop());
        setHasPermission(true);
      })
      .catch(() => {
        setHasPermission(false);
      });
  };

  const startRecording = async (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    if (isRecording) return;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (evt) => {
        if (evt.data.size > 0) {
          chunksRef.current.push(evt.data);
        }
      };

      mediaRecorder.onstop = () => {
        if (chunksRef.current.length > 0) {
          onRecordingComplete();
        }
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setTimer(0);
      intervalRef.current = setInterval(() => {
        setTimer((t) => t + 1);
      }, 1000);

      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate(30);
      }
    } catch {
      alert('Microphone access denied.');
    }
  };

  const stopRecording = (e?: React.MouseEvent | React.TouchEvent | React.FocusEvent) => {
    if (e) e.preventDefault();
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    checkPermission();
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isDisabled = hasPermission === false;

  return (
    <div className="flex flex-col items-center justify-center select-none w-full py-8">
      {/* Timer Display - Centered at top */}
      <div className="h-16 mb-2 flex items-center justify-center">
        <AnimatePresence>
          {isRecording && (
            <motion.div
              key="timer"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              className="flex flex-col items-center"
            >
              <div className="flex items-end gap-1.5 h-6 mb-2">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <motion.span
                    key={i}
                    animate={{ height: ['40%', '100%', '40%'] }}
                    transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.1 }}
                    className="w-1.5 bg-red-500 rounded-full"
                  />
                ))}
              </div>
              <span className="text-4xl font-extrabold text-gray-900 tabular-nums">
                {formatTime(timer)}
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Button Section */}
      <div className="relative flex flex-col items-center justify-center">
        {/* BIG GLOWING RECORD BUTTON */}
        <div className="relative w-96 h-96 flex items-center justify-center">
          {/* Animated Pulse Rings */}
          <AnimatePresence>
            {isRecording && (
              <>
                {[1, 2, 3].map((i) => (
                  <motion.div
                    key={i}
                    initial={{ scale: 0.6, opacity: 0.5 }}
                    animate={{ scale: 3.5, opacity: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeOut", delay: i * 0.4 }}
                    className="absolute w-72 h-72 rounded-full bg-red-500 pointer-events-none"
                    style={{ filter: 'blur(20px)' }}
                  />
                ))}
              </>
            )}
          </AnimatePresence>

          {/* Ambient Glow */}
          {!isRecording && (
            <motion.div
              animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.5, 0.3] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="absolute inset-4 bg-red-500/30 rounded-full blur-[80px] border border-red-500/10"
            />
          )}

          {/* MAIN BUTTON */}
          <motion.button
            whileTap={{ scale: 0.95 }}
            onMouseDown={startRecording}
            onMouseUp={stopRecording}
            onMouseLeave={stopRecording}
            onTouchStart={startRecording}
            onTouchEnd={stopRecording}
            disabled={isDisabled || !isBrowser}
            className={`relative w-80 h-80 rounded-full flex items-center justify-center shadow-massive transition-transform duration-100 ${
              isDisabled ? 'grayscale' : ''
            }`}
            style={{
              background: !isBrowser || isDisabled
                ? '#E5E5EA'
                : isRecording
                  ? 'linear-gradient(180deg, #FF3B30 0%, #D72A22 100%)'
                  : 'linear-gradient(180deg, #FFFFFF 0%, #F9F9F9 100%)',
              boxShadow: isRecording
                ? '0 0 0 15px rgba(255,59,48,0.1), 0 30px 60px -15px rgba(255,59,48,0.5), inset 0 2px 5px rgba(255,255,255,0.5)'
                : '0 20px 50px -15px rgba(0,0,0,0.2), 0 8px 12px -4px rgba(0,0,0,0.1), inset 0 -6px 10px rgba(0,0,0,0.05)',
            }}
          >
            <div 
              className={`w-72 h-72 rounded-full flex items-center justify-center border-4 ${
                isRecording ? 'border-white/20' : 'border-gray-50'
              }`}
            >
              <div className="relative z-10 flex flex-col items-center">
                {isRecording ? (
                  <div className="flex flex-col items-center gap-6">
                    <Square className="w-20 h-20 text-white fill-white shadow-2xl" />
                    <motion.div animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 1, repeat: Infinity }}>
                      <Waves className="w-14 h-14 text-white/60" />
                    </motion.div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center">
                    <div className="w-32 h-32 rounded-full bg-red-500 ring-[16px] ring-red-500/10 flex items-center justify-center shadow-premium mb-4">
                      <Mic className="w-16 h-16 text-white" />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.button>
        </div>

        {/* Status Text Area - Directly below button with fixed spacing */}
        <div className="mt-12 flex flex-col items-center text-center">
          <span className={`text-2xl font-extrabold tracking-tighter uppercase ${
            isRecording ? 'text-red-500' : 'text-gray-900'
          }`}>
            {isRecording ? 'Listening...' : isDisabled ? 'Mic Unavailable' : 'Hold to Record'}
          </span>
          <span className="text-sm font-semibold text-gray-500 mt-2 uppercase tracking-wide">
            {isRecording ? 'Release to finish recording' : 'Press and hold to start reporting'}
          </span>
        </div>
      </div>
    </div>
  );
};
