import { useState, useEffect, useRef, useCallback } from 'react';
import { sendChatMessage, getCallSummary } from '../services/api.js';

/**
 * Custom hook for managing the browser-based AI voice agent session.
 *
 * Key design choices:
 * - `isProcessingRef` prevents any duplicate concurrent AI requests.
 * - Every `setCallStatus('thinking')` is always followed by a reset in `finally`.
 * - `callStatusRef` exposes the current status inside closure callbacks that
 *   capture a stale value from the outer `callStatus` state variable.
 * - Post-call summary is fire-and-forget; it does NOT block the conversation.
 */
export function useVoiceAgent() {
  const [callStatus, setCallStatus] = useState('idle'); // 'idle' | 'listening' | 'thinking' | 'speaking' | 'error'
  const [isCallActive, setIsCallActive] = useState(false);
  const [transcript, setTranscript] = useState([]);
  const [summary, setSummary] = useState(null);
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const [error, setError] = useState(null);
  const [isMuted, setIsMuted] = useState(false);
  const [callDuration, setCallDuration] = useState(0);

  // Browser API capability detection
  const SpeechRecognition =
    typeof window !== 'undefined'
      ? window.SpeechRecognition || window.webkitSpeechRecognition
      : null;
  const speechSupported = Boolean(SpeechRecognition);
  const synthesisSupported = typeof window !== 'undefined' && 'speechSynthesis' in window;

  // ─── Refs ────────────────────────────────────────────────────────────────────
  const recognitionRef = useRef(null);
  const isCallActiveRef = useRef(false);
  const isMutedRef = useRef(false);
  const transcriptRef = useRef([]);
  const timerRef = useRef(null);
  const selectedVoiceRef = useRef(null);
  const callStatusRef = useRef('idle');   // mirrors callStatus for use inside closures
  const isProcessingRef = useRef(false);    // true while an AI request is in-flight
  const silenceTimerRef = useRef(null);
  const latestSpeechRef = useRef('');
  // Keep refs in sync with state
  isCallActiveRef.current = isCallActive;
  isMutedRef.current = isMuted;
  transcriptRef.current = transcript;
  callStatusRef.current = callStatus;

  // ─── Voice selection ─────────────────────────────────────────────────────────
  const loadVoices = useCallback(() => {
    if (!synthesisSupported) return;
    const voices = window.speechSynthesis.getVoices();
    if (!voices || voices.length === 0) return;

    const indianVoice =
      voices.find(
        (v) =>
          (v.lang === 'en-IN' || v.lang.startsWith('en_IN')) &&
          (v.name.toLowerCase().includes('female') ||
            v.name.toLowerCase().includes('heera') ||
            v.name.toLowerCase().includes('neerja') ||
            v.name.toLowerCase().includes('google') ||
            v.name.toLowerCase().includes('natural'))
      ) || voices.find((v) => v.lang === 'en-IN' || v.lang.startsWith('en_IN'));

    const naturalVoice = voices.find(
      (v) =>
        v.lang.startsWith('en') &&
        (v.name.toLowerCase().includes('natural') ||
          v.name.toLowerCase().includes('female') ||
          v.name.toLowerCase().includes('google'))
    );

    const defaultEnglish = voices.find((v) => v.lang.startsWith('en'));
    selectedVoiceRef.current = indianVoice || naturalVoice || defaultEnglish || voices[0];
  }, [synthesisSupported]);

  useEffect(() => {
    if (!synthesisSupported) return;
    loadVoices();
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, [loadVoices, synthesisSupported]);

  // ─── Call duration timer ──────────────────────────────────────────────────────
  useEffect(() => {
    if (isCallActive) {
      setCallDuration(0);
      timerRef.current = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isCallActive]);

  // ─── Speech synthesis ─────────────────────────────────────────────────────────
  // Speak Aria's reply without capturing her voice as customer speech
  const speakResponse = useCallback(
    (text) =>
      new Promise((resolve) => {
        if (!synthesisSupported || isMutedRef.current) {
          resolve();
          return;
        }

        // Stop recognition before Aria speaks
        if (recognitionRef.current) {
          try {
            recognitionRef.current.abort();
          } catch {
            // Recognition may already be stopped
          }
        }

        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);

        if (selectedVoiceRef.current) {
          utterance.voice = selectedVoiceRef.current;
        }

        utterance.rate = 1.0;
        utterance.pitch = 1.05;

        utterance.onstart = () => setCallStatus('speaking');

        utterance.onend = () => {
          resolve();
        };

        utterance.onerror = (event) => {
          console.warn('Speech synthesis error:', event.error);
          resolve();
        };

        window.speechSynthesis.speak(utterance);
      }),
    [synthesisSupported]
  );

  // Restart the microphone only when the customer can speak
  const restartListening = useCallback(() => {
    if (
      !isCallActiveRef.current ||
      !recognitionRef.current ||
      isProcessingRef.current
    ) {
      return;
    }

    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }

    setTimeout(() => {
      if (
        !isCallActiveRef.current ||
        !recognitionRef.current ||
        isProcessingRef.current
      ) {
        return;
      }

      try {
        recognitionRef.current.start();
        setCallStatus('listening');
      } catch (err) {
        console.debug('Recognition restart notice:', err.message);
      }
    }, 250);
  }, []);

  // ─── Core message processor ───────────────────────────────────────────────────
  /**
   * Sends a customer message to Aria and speaks the reply.
   * Guards against concurrent calls with isProcessingRef.
   * Always resets callStatus in finally so "thinking" can never get stuck.
   */
  const processCustomerMessage = useCallback(
    async (userText) => {
      if (!userText || !userText.trim()) return;

      // Guard: reject duplicate concurrent requests
      if (isProcessingRef.current) {
        console.warn('[useVoiceAgent] Request already in-flight; ignoring duplicate.');
        return;
      }

      const trimmedText = userText.trim();
      isProcessingRef.current = true;

      const userMessageObj = {
        id: `msg-${Date.now()}-user`,
        role: 'user',
        text: trimmedText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      };

      // 1. Add user message to transcript and enter thinking state
      setTranscript((prev) => [...prev, userMessageObj]);
      setCallStatus('thinking');

      // 2. Pause speech recognition to prevent Aria's voice being picked up
      if (recognitionRef.current) {
        try { recognitionRef.current.abort(); } catch { /* ignore */ }
      }

      try {
        // Send history snapshot (before this message was appended) + current message
        const historyPayload = transcriptRef.current.map((m) => ({
          role: m.role,
          text: m.text
        }));

        const result = await sendChatMessage(trimmedText, historyPayload);

        // 3. Append agent reply to transcript
        const agentMessageObj = {
          id: `msg-${Date.now()}-agent`,
          role: 'agent',
          text: result.reply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          toolUsed: result.toolUsed,
          orderId: result.orderId
        };
        setTranscript((prev) => [...prev, agentMessageObj]);

        // 4. Speak the reply if call is active
        if (isCallActiveRef.current) {
          await speakResponse(result.reply);
        }
      } catch (err) {
        console.error('[useVoiceAgent] Error handling customer message:', err);
        const rawMsg = err.message || '';
        let friendlyMsg = 'Our AI support line is temporarily unavailable. Please try again in a moment.';
        if (rawMsg.includes('503') || rawMsg.includes('UNAVAILABLE') || rawMsg.includes('high demand')) {
          friendlyMsg = 'Our AI customer support is experiencing temporary high demand. Please try again in just a moment.';
        } else if (rawMsg.includes('429') || rawMsg.includes('RESOURCE_EXHAUSTED')) {
          friendlyMsg = 'We are receiving a high volume of requests right now. Please wait a moment and try again.';
        } else if (rawMsg.includes('timeout') || rawMsg.includes('ETIMEDOUT')) {
          friendlyMsg = 'The request timed out. Please check your connection and try again.';
        } else if (rawMsg && !rawMsg.startsWith('{')) {
          friendlyMsg = rawMsg;
        }

        setError(friendlyMsg);
        setCallStatus('error');

        const errorMsgObj = {
          id: `msg-${Date.now()}-agent`,
          role: 'agent',
          text: `I apologize — ${friendlyMsg.charAt(0).toLowerCase() + friendlyMsg.slice(1)}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isError: true
        };
        setTranscript((prev) => [...prev, errorMsgObj]);
      } finally {
        // ────────────────────────────────────────────────────────────────────────
        // CRITICAL: Always release the processing guard and reset status.
        // This ensures "thinking" can never get permanently stuck.
        // ────────────────────────────────────────────────────────────────────────
        isProcessingRef.current = false;

        // Only resume listening if the call is still active and not already in error
        if (isCallActiveRef.current && callStatusRef.current !== 'error') {
          restartListening();
        } else if (!isCallActiveRef.current) {
          setCallStatus('idle');
        }
      }
    },
    [restartListening, speakResponse]
  );

  // ─── Start Call ───────────────────────────────────────────────────────────────
  const startCall = useCallback(async () => {
    setError(null);
    setSummary(null);
    setTranscript([]);
    isProcessingRef.current = false;
    latestSpeechRef.current = '';

    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }

    setIsCallActive(true);
    isCallActiveRef.current = true;

    // Greet the customer first
    setCallStatus('speaking');

    await speakResponse(
      "Hi! I'm Aria. Ask me anything about your Aura Skincare order or products."
    );

    if (!isCallActiveRef.current) return;

    if (!speechSupported) {
      setCallStatus('idle');
      setError(
        'Speech recognition is not supported by this browser. Please use the text input to test Aria.'
      );
      return;
    }

    try {
      const recognition = new SpeechRecognition();

      recognition.lang = 'en-IN';
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;
      recognition.continuous = false;

      recognition.onstart = () => {
        console.log('[Voice] Microphone recognition started');

        if (isCallActiveRef.current && !isProcessingRef.current) {
          setCallStatus('listening');
        }
      };

      recognition.onresult = (event) => {
        if (!isCallActiveRef.current || isProcessingRef.current) {
          return;
        }

        const lastResult = event.results[event.results.length - 1];

        console.log(
          '[Voice] Speech result:',
          lastResult[0].transcript,
          '| Final:',
          lastResult.isFinal
        );

        // Ignore partial results; wait for the completed sentence
        if (!lastResult.isFinal) return;

        const result = lastResult[0].transcript.trim();
        if (!result) return;

        latestSpeechRef.current = result;

        if (silenceTimerRef.current) {
          clearTimeout(silenceTimerRef.current);
        }

        silenceTimerRef.current = setTimeout(() => {
          silenceTimerRef.current = null;

          const message = latestSpeechRef.current;
          latestSpeechRef.current = '';

          if (recognitionRef.current) {
            try {
              recognitionRef.current.abort();
            } catch {
              // Recognition may already have ended
            }
          }

          if (message && isCallActiveRef.current) {
            console.log('[Voice] Final message submitted:', message);
            processCustomerMessage(message);
          }
        }, 2500);
      };

      recognition.onerror = (event) => {
        console.error('[Voice] Recognition error:', event.error);

        if (!isCallActiveRef.current || event.error === 'aborted') {
          return;
        }

        if (event.error === 'not-allowed') {
          setError(
            'Microphone permission denied. Allow microphone access or use the text input.'
          );
          setCallStatus('error');
          setIsCallActive(false);
          isCallActiveRef.current = false;
        }
      };

      recognition.onend = () => {
        console.log('[Voice] Recognition ended');

        if (silenceTimerRef.current) {
          console.log('[Voice] Waiting for silence timer');
          return;
        }

        if (
          isCallActiveRef.current &&
          !isProcessingRef.current &&
          callStatusRef.current !== 'speaking' &&
          callStatusRef.current !== 'thinking' &&
          callStatusRef.current !== 'error'
        ) {
          restartListening();
        }
      };

      recognitionRef.current = recognition;
      recognition.start();
      setCallStatus('listening');
    } catch (err) {
      console.error('Failed to initialize microphone:', err);
      setError('Could not start microphone: ' + err.message);
      setCallStatus('error');
      setIsCallActive(false);
      isCallActiveRef.current = false;
    }
  }, [
    SpeechRecognition,
    processCustomerMessage,
    restartListening,
    speakResponse,
    speechSupported
  ]);


  // ─── End Call ─────────────────────────────────────────────────────────────────
  const endCall = useCallback(async () => {
    // Immediately mark call inactive so nothing else triggers
    setIsCallActive(false);
    isCallActiveRef.current = false;
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }

    latestSpeechRef.current = '';

    isProcessingRef.current = false;
    setCallStatus('idle');

    // Stop recognition
    if (recognitionRef.current) {
      try { recognitionRef.current.abort(); } catch { /* ignore */ }
      recognitionRef.current = null;
    }

    // Cancel any ongoing speech
    if (synthesisSupported) window.speechSynthesis.cancel();

    // ──────────────────────────────────────────────────────────────────────────
    // Post-call summary: fire-and-forget so it NEVER blocks the call ending
    // or keeps any state stuck. Errors are surfaced via setError only.
    // ──────────────────────────────────────────────────────────────────────────
    const currentTranscript = transcriptRef.current;
    if (currentTranscript && currentTranscript.length > 0) {
      setIsGeneratingSummary(true);
      // Intentionally not awaited here — runs in background
      getCallSummary(currentTranscript)
        .then((generatedSummary) => {
          setSummary(generatedSummary);
        })
        .catch((err) => {
          console.error('[useVoiceAgent] Failed to generate call summary:', err);
          setError('Could not generate post-call summary: ' + err.message);
        })
        .finally(() => {
          setIsGeneratingSummary(false);
        });
    }
  }, [synthesisSupported]);

  // ─── Mute toggle ─────────────────────────────────────────────────────────────
  const toggleMute = useCallback(() => {
    setIsMuted((prev) => {
      const next = !prev;
      if (next && synthesisSupported) window.speechSynthesis.cancel();
      return next;
    });
  }, [synthesisSupported]);

  // ─── Cleanup on unmount ───────────────────────────────────────────────────────
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try { recognitionRef.current.abort(); } catch { /* ignore */ }
      }

      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
        silenceTimerRef.current = null;
      }

      if (synthesisSupported) window.speechSynthesis.cancel();
    };
  }, [synthesisSupported]);

  return {
    callStatus,
    isCallActive,
    transcript,
    summary,
    isGeneratingSummary,
    error,
    isMuted,
    callDuration,
    speechSupported,
    synthesisSupported,
    startCall,
    endCall,
    toggleMute,
    sendMessage: processCustomerMessage,
    clearError: () => setError(null)
  };
}

export default useVoiceAgent;
