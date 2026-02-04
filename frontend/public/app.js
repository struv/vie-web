// Vie Web Frontend - Main App (OPTIMIZED)
// Black void aesthetic - fast, intuitive, clean

class VieApp {
  constructor() {
    this.messages = [];
    this.isTyping = false;
    this.avatar = null;
    this.voice = null;
    
    // Backend API configuration
    this.API_BASE = '/api';
    
    // Load auth token from environment or localStorage
    this.AUTH_TOKEN = this.getAuthToken();
    
    // Debounce timers
    this.resizeTimer = null;
    
    this.init();
  }

  getAuthToken() {
    // Check localStorage first (for user-provided tokens)
    const stored = localStorage.getItem('vie-auth-token');
    if (stored) return stored;
    
    // Default fallback (should be set via environment in production)
    return 'vie_web_2026_secure_token_replace_in_production';
  }

  async init() {
    // Render initial UI
    this.render();
    
    // Initialize psychedelic fractal avatar
    this.initAvatar();
    
    // Initialize voice interface
    this.initVoice();
    
    // Set up event listeners
    this.setupEventListeners();
    
    // Test connection to backend
    try {
      const response = await fetch('/health');
      const data = await response.json();
      
      if (data.status === 'ok') {
        this.updateStatus('connected');
        
        // Check gateway connection
        const gatewayRes = await fetch('/health/gateway');
        const gatewayData = await gatewayRes.json();
        
        if (gatewayData.gateway && gatewayData.gateway.connected) {
          this.updateStatus('ready');
        } else {
          this.updateStatus('offline');
        }
      }
    } catch (error) {
      console.error('Backend connection failed:', error);
      this.updateStatus('error');
    }
    
    // Focus input
    const input = document.getElementById('message-input');
    if (input) input.focus();
  }

  updateStatus(state) {
    const statusLine = document.querySelector('.status-line');
    if (!statusLine) return;
    
    const states = {
      'connected': 'vie • connected',
      'ready': 'vie • ready',
      'offline': 'vie • offline',
      'error': 'vie • error',
      'thinking': 'vie • thinking',
      'listening': 'vie • listening'
    };
    
    statusLine.textContent = states[state] || state;
  }
  
  initAvatar() {
    const container = document.querySelector('.avatar-container');
    if (container && window.VieAvatar) {
      this.avatar = new window.VieAvatar(container);
    }
  }

  initVoice() {
    if (window.VieVoice) {
      this.voice = new window.VieVoice(this);
      
      // Render voice controls
      const inputContainer = document.querySelector('.input-container');
      if (inputContainer) {
        const voiceControlsHTML = this.voice.renderControls();
        inputContainer.insertAdjacentHTML('beforebegin', voiceControlsHTML);
        
        // Attach event listeners
        this.voice.attachEventListeners();
      }
    }
  }

  render() {
    const root = document.getElementById('root');
    root.innerHTML = `
      <div class="avatar-container">
        <!-- Avatar canvas created by VieAvatar -->
      </div>
      <div class="status-line">vie • connecting</div>
      
      <div class="chat-container">
        <div class="messages" id="messages">
          <!-- Messages appear here -->
        </div>
        
        <div class="input-container">
          <div class="input-wrapper">
            <textarea 
              id="message-input" 
              class="message-input" 
              placeholder="message vie..."
              rows="1"
            ></textarea>
          </div>
          <button id="send-button" class="send-button">send</button>
        </div>
      </div>
    `;
  }

  setupEventListeners() {
    const input = document.getElementById('message-input');
    const sendButton = document.getElementById('send-button');

    if (!input || !sendButton) return;

    // Send on Enter (Shift+Enter for new line)
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        this.sendMessage();
      }
    });

    // OPTIMIZED: Debounced auto-resize textarea
    // Prevents excessive reflows on every keystroke
    input.addEventListener('input', () => {
      if (this.resizeTimer) {
        clearTimeout(this.resizeTimer);
      }
      
      this.resizeTimer = setTimeout(() => {
        input.style.height = 'auto';
        input.style.height = Math.min(input.scrollHeight, 150) + 'px';
      }, 50); // 50ms debounce
    });

    // Send button click
    sendButton.addEventListener('click', () => this.sendMessage());
  }

  async sendMessage() {
    const input = document.getElementById('message-input');
    const message = input.value.trim();
    
    if (!message) return;

    // Add user message to UI
    this.addMessage('user', message);
    
    // Clear input
    input.value = '';
    input.style.height = 'auto';
    
    // Show typing indicator
    this.setTyping(true);
    this.updateStatus('thinking');

    try {
      // Send to backend API
      const response = await fetch(`${this.API_BASE}/chat/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-web-auth-token': this.AUTH_TOKEN
        },
        body: JSON.stringify({ message })
      });

      const data = await response.json();
      
      if (response.ok && data.success) {
        this.addMessage('assistant', data.reply);
      } else {
        this.addMessage('assistant', `error: ${data.error || data.message || 'unknown error'}`);
      }
      
    } catch (error) {
      console.error('Error sending message:', error);
      this.addMessage('assistant', `connection error: ${error.message}`);
    } finally {
      this.setTyping(false);
      this.updateStatus('ready');
    }
  }

  addMessage(role, content) {
    const messagesContainer = document.getElementById('messages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${role}`;
    
    const time = new Date().toLocaleTimeString('en-US', { 
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
    
    messageDiv.innerHTML = `
      <div class="message-content">${this.escapeHtml(content)}</div>
      <div class="message-time">${time}</div>
    `;
    
    messagesContainer.appendChild(messageDiv);
    
    // OPTIMIZED: Use instant scroll for better performance
    // Smooth scroll can cause layout thrashing with many messages
    // Only use smooth on desktop, instant on mobile
    const isMobile = window.innerWidth < 768;
    messagesContainer.scrollTo({
      top: messagesContainer.scrollHeight,
      behavior: isMobile ? 'auto' : 'smooth'
    });
    
    this.messages.push({ role, content, timestamp: Date.now() });
    
    // Speak assistant messages if TTS is enabled
    if (role === 'assistant' && this.voice) {
      this.voice.speak(content);
    }
  }

  setTyping(typing) {
    this.isTyping = typing;
    const messagesContainer = document.getElementById('messages');
    const sendButton = document.getElementById('send-button');
    
    if (!messagesContainer || !sendButton) return;
    
    // Remove existing typing indicator
    const existingIndicator = document.querySelector('.typing-indicator-container');
    if (existingIndicator) {
      existingIndicator.remove();
    }
    
    if (typing) {
      const indicator = document.createElement('div');
      indicator.className = 'message assistant typing-indicator-container';
      indicator.innerHTML = `
        <div class="typing-indicator">
          <span></span>
          <span></span>
          <span></span>
        </div>
      `;
      messagesContainer.appendChild(indicator);
      
      messagesContainer.scrollTo({
        top: messagesContainer.scrollHeight,
        behavior: 'auto' // Instant scroll for typing indicator
      });
      
      sendButton.disabled = true;
    } else {
      sendButton.disabled = false;
    }
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
  
  // Cleanup method for proper teardown
  destroy() {
    // Clean up avatar
    if (this.avatar && this.avatar.destroy) {
      this.avatar.destroy();
    }
    
    // Clean up voice
    if (this.voice && this.voice.stopSpeaking) {
      this.voice.stopSpeaking();
    }
    
    // Clear debounce timer
    if (this.resizeTimer) {
      clearTimeout(this.resizeTimer);
    }
  }
}

// Initialize app when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.vieApp = new VieApp();
  });
} else {
  window.vieApp = new VieApp();
}

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
  if (window.vieApp && window.vieApp.destroy) {
    window.vieApp.destroy();
  }
});
