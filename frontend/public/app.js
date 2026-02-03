// Vie Web Frontend - Main App (Vanilla JS)
// Ported from Vie Desktop, Electron IPC replaced with backend API calls

class VieApp {
  constructor() {
    this.messages = [];
    this.isTyping = false;
    this.avatar = null;
    this.voice = null;
    
    // Backend API configuration
    this.API_BASE = '/api'; // Proxied through same origin
    
    // Auth token - in production, get from environment or config
    // For now, using the default from backend .env
    this.AUTH_TOKEN = 'vie_web_2026_secure_token_replace_in_production';
    
    this.init();
  }

  async init() {
    // Render initial UI
    this.render();
    
    // Initialize procedural avatar
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
        this.updateStatus('⟢ Connected to Vie Backend ⟢');
        
        // Check gateway connection
        const gatewayRes = await fetch('/health/gateway');
        const gatewayData = await gatewayRes.json();
        
        if (gatewayData.gateway && gatewayData.gateway.connected) {
          this.updateStatus('⟢ Ready to help ⟢');
        } else {
          this.updateStatus('⚠️ Gateway offline - limited functionality');
        }
      }
    } catch (error) {
      console.error('Backend connection failed:', error);
      this.updateStatus('⚠️ Backend connection failed');
    }
    
    // Focus input
    document.getElementById('message-input').focus();
    
    console.log('Vie Web initialized');
  }

  updateStatus(text) {
    const statusLine = document.querySelector('.status-line');
    if (statusLine) {
      statusLine.textContent = text;
    }
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
        <!-- Avatar will be dynamically created by VieAvatar -->
      </div>
      <div class="status-line">⟢ Connecting... ⟢</div>
      
      <div class="chat-container">
        <div class="messages" id="messages">
          <!-- Messages will be appended here -->
        </div>
        
        <div class="input-container">
          <div class="input-wrapper">
            <textarea 
              id="message-input" 
              class="message-input" 
              placeholder="Type your message... (Enter to send, Shift+Enter for new line)"
              rows="1"
            ></textarea>
          </div>
          <button id="send-button" class="send-button">Send ⟢</button>
        </div>
      </div>
    `;
  }

  setupEventListeners() {
    const input = document.getElementById('message-input');
    const sendButton = document.getElementById('send-button');

    // Send on Enter (but not Shift+Enter)
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        this.sendMessage();
      }
    });

    // Auto-resize textarea
    input.addEventListener('input', () => {
      input.style.height = 'auto';
      input.style.height = Math.min(input.scrollHeight, 150) + 'px';
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
        this.addMessage('assistant', `⚠️ Error: ${data.error || data.message || 'Unknown error'}`);
      }
      
    } catch (error) {
      console.error('Error sending message:', error);
      this.addMessage('assistant', `⚠️ Connection error: ${error.message}`);
    } finally {
      this.setTyping(false);
    }
  }

  addMessage(role, content) {
    const messagesContainer = document.getElementById('messages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${role}`;
    
    const time = new Date().toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit' 
    });
    
    messageDiv.innerHTML = `
      <div class="message-content">${this.escapeHtml(content)}</div>
      <div class="message-time">${time}</div>
    `;
    
    messagesContainer.appendChild(messageDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
    
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
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
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
}

// Initialize app when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => new VieApp());
} else {
  new VieApp();
}
