'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Phone, MessageCircle, Send, Loader2, CheckCircle } from 'lucide-react';
import { RecordingButton } from '@/components/RecordingButton';
import { sendReportAction } from './actions';
import { motion, AnimatePresence } from 'framer-motion';

export default function Home() {
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSendMessage = async () => {
    if (message.trim() && !isSending) {
      setIsSending(true);
      try {
        const res = await sendReportAction('text', message);
        if (res.success) {
          setMessage('');
          setShowSuccess(true);
          setTimeout(() => setShowSuccess(false), 2000);
        } else {
          alert('Failed to send report. Please check your connection.');
        }
      } catch {
        alert('An error occurred while sending the report.');
      } finally {
        setIsSending(false);
      }
    }
  };

  const handleVoiceUpload = async () => {
    setIsSending(true);
    try {
      const timestamp = new Date().toISOString();
      const content = `voice_report_${timestamp}.webm`;
      
      const res = await sendReportAction('voice', content);
      if (res.success) {
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 2000);
      } else {
        alert('Failed to log voice report.');
      }
    } catch {
      alert('Failed to record voice report.');
    } finally {
      setIsSending(false);
    }
  };

  const handleCall = () => {
    window.location.href = 'tel:+278600010111';
  };

  const openLiveChat = () => {
    window.open('https://mira-virtual-counselling.zapier.app', '_blank');
  };

  return (
    <main className="mobile-container">
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            className="fixed top-8 left-1/2 -translate-x-1/2 z-50"
          >
            <div className="glass px-6 py-3 rounded-full shadow-lg flex items-center gap-3 text-sm font-semibold text-gray-800">
              <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
                <CheckCircle className="w-4 h-4 text-white" />
              </div>
              Report Sent Successfully
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-col flex-1">
        {/* Header */}
        <header className="pt-16 pb-4 px-6 flex flex-col items-center text-center">
          <div className="w-24 h-24 mb-4 relative bg-white rounded-[2rem] shadow-premium flex items-center justify-center p-4 border border-black/5">
            <Image 
              src="/logo.png" 
              alt="MIRA Logo" 
              width={64}
              height={64}
              className="object-contain"
              priority
            />
          </div>
          <h1 className="text-2xl font-extrabold text-gray-900 leading-tight tracking-tight uppercase px-4">
            Malicious Intent Reporting App
          </h1>
          <p className="mt-2 text-[11px] font-bold text-red-500 opacity-80 tracking-widest uppercase">
            Your Voice is Your Shield
          </p>
        </header>

        {/* Recording Button - Large and Centered */}
        <div className="flex-1 flex items-center justify-center py-12">
          <RecordingButton onRecordingComplete={handleVoiceUpload} />
        </div>

        {/* Message Input - Just above footer */}
        <div className="absolute bottom-footer left-0 right-0 px-5 z-30">
          <div className="input-container">
            <input
              type="text"
              placeholder="Describe what happened..."
              className="flex-1 h-12 text-base text-gray-800 placeholder:text-gray-400"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            />
            <motion.button 
              whileTap={{ scale: 0.9 }}
              onClick={handleSendMessage}
              disabled={!message.trim() || isSending}
              className="send-button"
            >
              {isSending ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5 fill-current" />
              )}
            </motion.button>
          </div>
          <p className="text-center text-[10px] text-gray-400 mt-3 leading-relaxed px-8">
            Your report is encrypted and completely anonymous. We do not track your identity.
          </p>
        </div>
      </div>

      {/* Bottom Navigation */}
      <nav className="absolute bottom-0 left-0 w-full glass safe-area-bottom border-t border-black/5 z-40">
        <div className="flex items-center justify-between max-w-[420px] mx-auto px-8">
          {/* Call Button */}
          <button 
            onClick={handleCall}
            className="nav-item"
          >
            <div className="nav-icon-container primary">
              <Phone className="w-6 h-6 fill-current" />
            </div>
            <span className="text-[10px] font-bold text-gray-800 uppercase tracking-wider">Call Agent</span>
          </button>
          
          {/* Chat Button */}
          <button 
            onClick={openLiveChat}
            className="nav-item"
          >
            <div className="nav-icon-container secondary">
              <MessageCircle className="w-7 h-7" />
            </div>
            <span className="text-[10px] font-bold text-gray-800 uppercase tracking-wider">Live Chat</span>
          </button>
        </div>
      </nav>
    </main>
  );
}
