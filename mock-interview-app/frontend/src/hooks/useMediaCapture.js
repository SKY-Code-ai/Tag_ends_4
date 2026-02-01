import { useState, useRef, useEffect, useCallback } from 'react';

/**
 * Hook for speech-to-text using Web Speech API
 */
export const useSpeechToText = () => {
  const [transcript, setTranscript] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState(null);
  const recognitionRef = useRef(null);

  useEffect(() => {
    // Check for browser support
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      setError('Speech recognition not supported in this browser');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event) => {
      let finalTranscript = '';
      let interimTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcriptPart = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcriptPart + ' ';
        } else {
          interimTranscript += transcriptPart;
        }
      }

      setTranscript(prev => prev + finalTranscript);
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      setError(event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      if (isListening) {
        // Restart if still supposed to be listening
        recognition.start();
      }
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const startListening = useCallback(() => {
    if (recognitionRef.current && !isListening) {
      setError(null);
      setTranscript('');
      recognitionRef.current.start();
      setIsListening(true);
    }
  }, [isListening]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  }, [isListening]);

  const resetTranscript = useCallback(() => {
    setTranscript('');
  }, []);

  return {
    transcript,
    isListening,
    error,
    startListening,
    stopListening,
    resetTranscript,
    isSupported: !!recognitionRef.current
  };
};

/**
 * Hook for webcam/camera access
 */
export const useCamera = () => {
  const [stream, setStream] = useState(null);
  const [isEnabled, setIsEnabled] = useState(false);
  const [error, setError] = useState(null);
  const videoRef = useRef(null);

  const startCamera = useCallback(async () => {
    try {
      setError(null);
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { 
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user'
        },
        audio: false
      });
      
      setStream(mediaStream);
      setIsEnabled(true);

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.error('Camera error:', err);
      setError(err.message || 'Failed to access camera');
      setIsEnabled(false);
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
      setIsEnabled(false);
    }
  }, [stream]);

  const captureFrame = useCallback(() => {
    if (!videoRef.current || !isEnabled) return null;

    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    
    const ctx = canvas.getContext('2d');
    ctx.drawImage(videoRef.current, 0, 0);
    
    return canvas.toDataURL('image/jpeg', 0.8);
  }, [isEnabled]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  return {
    videoRef,
    stream,
    isEnabled,
    error,
    startCamera,
    stopCamera,
    captureFrame
  };
};

/**
 * Simple focus detection (without MediaPipe for now)
 * Tracks if user is looking at screen based on periodic checks
 */
export const useFocusDetection = (videoRef, isEnabled) => {
  const [focusScore, setFocusScore] = useState(100);
  const [focusEvents, setFocusEvents] = useState([]);
  const lastActiveRef = useRef(Date.now());

  useEffect(() => {
    if (!isEnabled) return;

    // Track mouse/keyboard activity as proxy for focus
    const handleActivity = () => {
      lastActiveRef.current = Date.now();
    };

    // Track visibility changes
    const handleVisibility = () => {
      if (document.hidden) {
        setFocusEvents(prev => [...prev, { type: 'tab_hidden', time: Date.now() }]);
      }
    };

    document.addEventListener('mousemove', handleActivity);
    document.addEventListener('keydown', handleActivity);
    document.addEventListener('visibilitychange', handleVisibility);

    // Periodic focus check
    const interval = setInterval(() => {
      const timeSinceActive = Date.now() - lastActiveRef.current;
      
      // If no activity for 30 seconds, reduce focus score
      if (timeSinceActive > 30000) {
        setFocusScore(prev => Math.max(50, prev - 5));
      } else if (timeSinceActive < 5000) {
        setFocusScore(prev => Math.min(100, prev + 2));
      }
    }, 5000);

    return () => {
      document.removeEventListener('mousemove', handleActivity);
      document.removeEventListener('keydown', handleActivity);
      document.removeEventListener('visibilitychange', handleVisibility);
      clearInterval(interval);
    };
  }, [isEnabled]);

  const resetFocus = useCallback(() => {
    setFocusScore(100);
    setFocusEvents([]);
    lastActiveRef.current = Date.now();
  }, []);

  return {
    focusScore,
    focusEvents,
    resetFocus
  };
};

export default {
  useSpeechToText,
  useCamera,
  useFocusDetection
};
