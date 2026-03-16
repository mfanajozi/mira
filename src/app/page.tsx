'use client';

import React, { useState, useCallback } from 'react';
import Image from 'next/image';
import { Phone, MessageCircle, Send, Loader2 } from 'lucide-react';
import { RecordingButton } from '@/components/RecordingButton';
import { sendReportAction } from './actions';

export default function Home() {
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);

  const handleSendMessage = async () => {
    if (message.trim() && !isSending) {
      setIsSending(true);
      try {
        const res = await sendReportAction('text', message);
        if (res.success) {
          setMessage('');
        } else {
          alert('Failed to send report. Please check your connection.');
        }
      } catch (err) {
        console.error(err);
        alert('An error occurred while sending the report.');
      } finally {
        setIsSending(false);
      }
    }
  };

  const handleVoiceUpload = async (blob: Blob) => {
    setIsSending(true);
    try {
      // Simulating a voice report save. 
      // In a production Next.js app, you'd likely upload this to S3/Cloudinary 
      // and then save the URL to the DB. For now, we'll store the filename/timestamp.
      const timestamp = new Date().toISOString();
      const content = `voice_report_${timestamp}.webm`;
      
      const res = await sendReportAction('voice', content);
      if (res.success) {
        // Here you would normally finish the actual file upload logic
        alert('Anonymous voice report sent to database!');
      } else {
        alert('Failed to log voice report.');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSending(false);
    }
  };

  const handleCall = () => {
    window.location.href = 'tel:+27860010111';
  };

  const openLiveChat = () => {
    window.open('https://mira-virtual-counselling.zapier.app', '_blank');
  };

  return (
    <main className="mobile-container overflow-hidden flex flex-col">
      <div className="flex flex-col items-center px-6 pb-10 flex-1 overflow-y-auto">
        {/* Top Logo Section */}
        <header className="pt-12 mb-6 flex flex-col items-center">
          <div className="relative w-20 h-20 mb-2">
            <Image 
              src="/logo.png" 
              alt="MIRA Logo" 
              width={80}
              height={80}
              className="object-contain"
              priority
            />
          </div>
          {/* MIRA text removed as per previous request */}
        </header>

        {/* Title Section */}
        <section className="text-center mb-10 w-full">
          <h1 className="text-3xl font-bold leading-tight mb-2 tracking-tight">
            Malicious Intent Reporting App
          </h1>
          <p className="text-gray-600 text-lg">Report malicious activity anonymously</p>
        </section>

        {/* Middle Recording Section */}
        <section className="flex-1 flex flex-col items-center justify-center w-full py-6">
          <RecordingButton onRecordingComplete={handleVoiceUpload} />
          <p className="text-sm text-gray-400 mt-6 tracking-wide">
            Tap & hold to record; release to send
          </p>
        </section>

        {/* Input Section */}
        <section className="w-full py-4 mt-auto">
          <div className="flex items-center bg-gray-100 rounded-full px-5 py-1 border border-gray-200 shadow-sm focus-within:border-red-400 transition-all duration-300">
            <input
              type="text"
              placeholder="Type message here..."
              className="flex-1 bg-transparent outline-none h-12 text-base"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            />
            <button 
              onClick={handleSendMessage}
              disabled={!message.trim() || isSending}
              className={`p-2 rounded-full transition-transform active:scale-95 ${message.trim() ? 'text-red-500' : 'text-gray-400'}`}
            >
              {isSending ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                <Send className="w-6 h-6" />
              )}
            </button>
          </div>
        </section>

        {/* Footer Buttons */}
        <footer className="flex justify-center gap-12 w-full pt-6 pb-8">
          <button 
            onClick={handleCall}
            className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center border border-gray-200 shadow-sm hover:bg-gray-200 active:scale-90 transition-all"
          >
            <Phone className="w-8 h-8 text-black" />
          </button>
          
          <button 
            onClick={openLiveChat}
            className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center border border-gray-200 shadow-sm hover:bg-gray-200 active:scale-90 transition-all"
          >
            <MessageCircle className="w-8 h-8 text-black" />
          </button>
        </footer>
      </div>

      {/* Standard Home Indicator bar to mimic mobile look */}
      <div className="h-1.5 w-32 bg-black/10 rounded-full self-center mb-2" />
    </main>
  );
}
