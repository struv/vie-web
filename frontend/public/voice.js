// Vie Voice Interface - Web Speech API integration
// Push-to-talk voice input + TTS output

class VieVoice {
  constructor(app) {
    this.app = app;
    this.isListening = false;
    this.isProcessing = false;
    this.isSpeaking = false;
    this.ttsEnabled = false;
    
    // Web Speech API
    this.recognition = null;
    this.synthesis = window.speechSynthesis;
    this.currentUtterance = null;
    
    // Voice settings
    this.selectedVoice = null;
    this.speechRate = 1.0;
    this.speechVolume = 1.0;
    
    // Transcription buffer
    this.transcriptBuffer = '';
    
    // Check browser support
    this.isSupported = this.checkSupport();
    
    if (this.isSupported) {
      this.initRecognition();
      this.loadVoicePreferences();
    }
  }

  checkSupport() {
    const hasRecognition = 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
    const hasSynthesis = 'speechSynthesis' in window;
    
    if (!hasRecognition || !hasSynthesis) {
      console.warn('Web Speech API not fully supported:', {
        recognition: hasRecognition,
        synthesis: hasSynthesis
      });
    }
    
    return hasRecognition && hasSynthesis;
  }

  initRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    this.recognition = new SpeechRecognition();
    
    this.recognition.continuous = false; // Single utterance mode for push-to-talk
    this.recognition.interimResults = true; // Show interim transcription
    this.recognition.lang = 'en-US';
    
    this.recognition.onstart = () => {
      this.isListening = true;
      this.updateVoiceUI('listening');
      console.log('Voice recognition started');
    };
    
    this.recognition.onresult = (event) => {
      const results = event.results;
      const latestResult = results[results.length - 1];
      
      if (latestResult.isFinal) {
        this.transcriptBuffer = latestResult[0].transcript;
        this.displayTranscript(this.transcriptBuffer, true);
      } else {
        // Show interim results
        const interim = latestResult[0].transcript;
        this.displayTranscript(interim, false);
      }
    };
    
    this.recognition.onend = () => {
      this.isListening = false;
      
      if (this.transcriptBuffer) {
        // Send the transcribed message
        this.sendTranscript();
      } else {
        this.updateVoiceUI('idle');
        this.clearTranscript();
      }
    };
    
    this.recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      this.isListening = false;
      this.handleRecognitionError(event.error);
      this.updateVoiceUI('error');
    };
  }

  loadVoicePreferences() {
    // Load saved preferences
    const savedVoice = localStorage.getItem('vie-voice-name');
    const savedRate = localStorage.getItem('vie-voice-rate');
    const savedVolume = localStorage.getItem('vie-voice-volume');
    const savedTTSEnabled = localStorage.getItem('vie-tts-enabled');
    
    if (savedRate) this.speechRate = parseFloat(savedRate);
    if (savedVolume) this.speechVolume = parseFloat(savedVolume);
    if (savedTTSEnabled !== null) this.ttsEnabled = savedTTSEnabled === 'true';
    
    // Wait for voices to load
    if (this.synthesis.getVoices().length > 0) {
      this.selectVoice(savedVoice);
    } else {
      this.synthesis.onvoiceschanged = () => {
        this.selectVoice(savedVoice);
      };
    }
  }

  selectVoice(voiceName) {
    const voices = this.synthesis.getVoices();
    
    if (voiceName) {
      this.selectedVoice = voices.find(v => v.name === voiceName);
    }
    
    // Default to first English voice if not found
    if (!this.selectedVoice) {
      this.selectedVoice = voices.find(v => v.lang.startsWith('en')) || voices[0];
    }
  }

  startListening() {
    if (!this.isSupported || this.isListening || this.isProcessing) return;
    
    this.transcriptBuffer = '';
    this.clearTranscript();
    
    try {
      this.recognition.start();
    } catch (error) {
      console.error('Failed to start recognition:', error);
      this.showError('Microphone access denied or already in use');
    }
  }

  stopListening() {
    if (!this.isListening) return;
    
    try {
      this.recognition.stop();
    } catch (error) {
      console.error('Failed to stop recognition:', error);
    }
  }

  displayTranscript(text, isFinal) {
    const transcriptEl = document.getElementById('voice-transcript');
    if (!transcriptEl) return;
    
    transcriptEl.textContent = text;
    transcriptEl.className = 'voice-transcript' + (isFinal ? ' final' : ' interim');
    transcriptEl.style.display = text ? 'block' : 'none';
  }

  clearTranscript() {
    const transcriptEl = document.getElementById('voice-transcript');
    if (transcriptEl) {
      transcriptEl.textContent = '';
      transcriptEl.style.display = 'none';
    }
  }

  async sendTranscript() {
    const message = this.transcriptBuffer.trim();
    this.transcriptBuffer = '';
    
    if (!message) {
      this.updateVoiceUI('idle');
      this.clearTranscript();
      return;
    }
    
    this.isProcessing = true;
    this.updateVoiceUI('processing');
    
    // Add to text input so user can see what was sent
    const input = document.getElementById('message-input');
    if (input) {
      input.value = message;
    }
    
    // Send via app's sendMessage
    await this.app.sendMessage();
    
    this.isProcessing = false;
    this.updateVoiceUI('idle');
    this.clearTranscript();
  }

  speak(text) {
    if (!this.isSupported || !this.ttsEnabled || !text) return;
    
    // Stop any ongoing speech
    this.stopSpeaking();
    
    this.currentUtterance = new SpeechSynthesisUtterance(text);
    this.currentUtterance.voice = this.selectedVoice;
    this.currentUtterance.rate = this.speechRate;
    this.currentUtterance.volume = this.speechVolume;
    
    this.currentUtterance.onstart = () => {
      this.isSpeaking = true;
      this.updateSpeakerUI(true);
    };
    
    this.currentUtterance.onend = () => {
      this.isSpeaking = false;
      this.updateSpeakerUI(false);
      this.currentUtterance = null;
    };
    
    this.currentUtterance.onerror = (event) => {
      console.error('Speech synthesis error:', event);
      this.isSpeaking = false;
      this.updateSpeakerUI(false);
    };
    
    this.synthesis.speak(this.currentUtterance);
  }

  stopSpeaking() {
    if (this.synthesis.speaking) {
      this.synthesis.cancel();
    }
    this.isSpeaking = false;
    this.updateSpeakerUI(false);
  }

  toggleTTS() {
    this.ttsEnabled = !this.ttsEnabled;
    localStorage.setItem('vie-tts-enabled', this.ttsEnabled);
    
    if (!this.ttsEnabled) {
      this.stopSpeaking();
    }
    
    this.updateTTSToggleUI();
  }

  updateVoiceUI(state) {
    const micBtn = document.getElementById('voice-mic-btn');
    const statusEl = document.getElementById('voice-status');
    
    if (!micBtn || !statusEl) return;
    
    // Remove all state classes
    micBtn.className = 'voice-mic-btn';
    
    switch (state) {
      case 'listening':
        micBtn.classList.add('listening');
        statusEl.textContent = 'Listening...';
        statusEl.className = 'voice-status listening';
        break;
      case 'processing':
        micBtn.classList.add('processing');
        statusEl.textContent = 'Processing...';
        statusEl.className = 'voice-status processing';
        break;
      case 'error':
        micBtn.classList.add('error');
        statusEl.textContent = 'Error - try again';
        statusEl.className = 'voice-status error';
        setTimeout(() => {
          if (!this.isListening) {
            statusEl.textContent = '';
            statusEl.className = 'voice-status';
          }
        }, 3000);
        break;
      default: // idle
        statusEl.textContent = '';
        statusEl.className = 'voice-status';
    }
  }

  updateSpeakerUI(speaking) {
    const speakerIndicator = document.getElementById('voice-speaker-indicator');
    if (speakerIndicator) {
      speakerIndicator.style.display = speaking ? 'block' : 'none';
    }
  }

  updateTTSToggleUI() {
    const ttsBtn = document.getElementById('voice-tts-toggle');
    if (ttsBtn) {
      ttsBtn.textContent = this.ttsEnabled ? '🔊 TTS On' : '🔇 TTS Off';
      ttsBtn.className = 'voice-tts-toggle' + (this.ttsEnabled ? ' active' : '');
    }
  }

  handleRecognitionError(error) {
    const messages = {
      'no-speech': 'No speech detected. Please try again.',
      'audio-capture': 'Microphone not found or access denied.',
      'not-allowed': 'Microphone access denied. Please allow microphone access.',
      'network': 'Network error. Check your connection.',
      'aborted': 'Recognition aborted.',
    };
    
    this.showError(messages[error] || `Recognition error: ${error}`);
  }

  showError(message) {
    const statusEl = document.getElementById('voice-status');
    if (statusEl) {
      statusEl.textContent = message;
      statusEl.className = 'voice-status error';
      
      setTimeout(() => {
        if (!this.isListening) {
          statusEl.textContent = '';
          statusEl.className = 'voice-status';
        }
      }, 5000);
    }
  }

  renderControls() {
    if (!this.isSupported) {
      return `
        <div class="voice-controls unsupported">
          <div class="voice-unsupported-message">
            ⚠️ Voice features require Chrome, Edge, or Safari
          </div>
        </div>
      `;
    }
    
    return `
      <div class="voice-controls">
        <div class="voice-input-section">
          <button id="voice-mic-btn" class="voice-mic-btn" title="Hold to speak">
            <span class="mic-icon">🎤</span>
            <span class="pulse-ring"></span>
            <span class="pulse-ring"></span>
          </button>
          <div id="voice-status" class="voice-status"></div>
          <div id="voice-transcript" class="voice-transcript"></div>
        </div>
        
        <div class="voice-output-section">
          <button id="voice-tts-toggle" class="voice-tts-toggle">
            ${this.ttsEnabled ? '🔊 TTS On' : '🔇 TTS Off'}
          </button>
          <div id="voice-speaker-indicator" class="voice-speaker-indicator">
            <span class="speaker-pulse"></span>
            <span class="speaker-pulse"></span>
            <span class="speaker-pulse"></span>
          </div>
        </div>
      </div>
    `;
  }

  attachEventListeners() {
    if (!this.isSupported) return;
    
    const micBtn = document.getElementById('voice-mic-btn');
    const ttsToggle = document.getElementById('voice-tts-toggle');
    
    if (micBtn) {
      // Push-to-talk: hold to speak, release to send
      let isMouseDown = false;
      
      micBtn.addEventListener('mousedown', (e) => {
        e.preventDefault();
        isMouseDown = true;
        this.startListening();
      });
      
      micBtn.addEventListener('mouseup', (e) => {
        e.preventDefault();
        if (isMouseDown) {
          isMouseDown = false;
          this.stopListening();
        }
      });
      
      micBtn.addEventListener('mouseleave', (e) => {
        if (isMouseDown) {
          isMouseDown = false;
          this.stopListening();
        }
      });
      
      // Touch support for mobile
      micBtn.addEventListener('touchstart', (e) => {
        e.preventDefault();
        this.startListening();
      });
      
      micBtn.addEventListener('touchend', (e) => {
        e.preventDefault();
        this.stopListening();
      });
    }
    
    if (ttsToggle) {
      ttsToggle.addEventListener('click', () => {
        this.toggleTTS();
      });
    }
  }
}

// Export for use in app.js
window.VieVoice = VieVoice;
