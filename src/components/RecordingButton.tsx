'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, Square } from 'lucide-react';

interface RecordingButtonProps {
  onRecordingComplete: (blob: Blob) => void;
}

export const RecordingButton: React.FC<RecordingButtonProps> = ({ onRecordingComplete }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [timer, setTimer] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const startRecording = async (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    if (isRecording) return;
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
        onRecordingComplete(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setTimer(0);
      intervalRef.current = setInterval(() => {
        setTimer((t) => t + 1);
      }, 1000);
      
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate(50);
      }
    } catch (err) {
      console.error('Failed to start recording', err);
      alert('Microphone access denied or not supported.');
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
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  return (
    <div className="flex flex-col items-center select-none">
      <div className="h-10 flex items-center justify-center mb-2">
        <AnimatePresence>
          {isRecording && (
            <motion.span 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="text-2xl font-bold text-red-600"
            >
              {formatTime(timer)}
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      <div className="relative w-36 h-36 flex items-center justify-center">
        {/* Pulse Rings */}
        <AnimatePresence>
          {isRecording && (
            <>
              {[1, 2].map((i) => (
                <motion.div
                  key={i}
                  initial={{ scale: 0.8, opacity: 0.6 }}
                  animate={{ scale: 2.5, opacity: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "easeOut", delay: i * 0.5 }}
                  className="absolute w-24 h-24 rounded-full bg-red-600 pointer-events-none"
                />
              ))}
            </>
          )}
        </AnimatePresence>

        <motion.button
          whileTap={{ scale: 0.9 }}
          onMouseDown={startRecording}
          onMouseUp={stopRecording}
          onMouseLeave={stopRecording}
          onTouchStart={startRecording}
          onTouchEnd={stopRecording}
          className={`relative w-28 h-28 rounded-full bg-red-600 flex items-center justify-center shadow-lg border-b-[6px] border-[#CC0000] focus:outline-none transition-all duration-75
            ${isRecording ? 'scale-110' : 'scale-100'}`}
          style={{ 
            boxShadow: isRecording ? 'none' : '0 6px 0 #CC0000, 0 12px 15px rgba(0,0,0,0.2)',
            transform: isRecording ? 'translateY(4px)' : 'none',
            borderBottom: isRecording ? '2px solid #CC0000' : '6px solid #CC0000'
          }}
        >
          {isRecording ? (
            <Square className="w-10 h-10 text-white fill-white" />
          ) : (
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
              <Mic className="w-6 h-6 text-white" />
            </div>
          )}
        </motion.button>
      </div>

      <div className="h-10 flex items-center">
        <span className="mt-5 text-sm font-black tracking-[4px] text-red-600 uppercase">
          {isRecording ? 'Recording...' : 'Record'}
        </span>
      </div>
    </div>
  );
};
