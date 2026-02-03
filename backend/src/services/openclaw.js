// OpenClaw Gateway Service
// Proxies requests to the local OpenClaw gateway

const fetch = require('node-fetch');

class OpenClawService {
  constructor(config) {
    this.gatewayUrl = config.gatewayUrl;
    this.gatewayToken = config.gatewayToken;
    this.connected = false;
  }

  /**
   * Test connection to gateway
   */
  async testConnection() {
    try {
      const response = await fetch(`${this.gatewayUrl}/v1/responses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.gatewayToken}`,
          'x-openclaw-agent-id': 'main'
        },
        body: JSON.stringify({
          model: 'openclaw',
          input: 'ping'
        })
      });

      if (response.ok) {
        this.connected = true;
        console.log('✓ Connected to OpenClaw gateway');
        return true;
      }

      throw new Error(`Gateway returned ${response.status}`);
    } catch (error) {
      console.error('✗ Failed to connect to OpenClaw gateway:', error.message);
      this.connected = false;
      return false;
    }
  }

  /**
   * Send a message to Clawd and get response
   */
  async sendMessage(message) {
    try {
      const response = await fetch(`${this.gatewayUrl}/v1/responses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.gatewayToken}`,
          'x-openclaw-agent-id': 'main'
        },
        body: JSON.stringify({
          model: 'openclaw',
          input: message
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Gateway error: ${response.status} ${errorText}`);
      }

      const data = await response.json();

      // Parse OpenResponses format
      let replyText = 'No response';

      if (data.output && data.output.length > 0) {
        const outputItem = data.output[0];
        if (outputItem.content && outputItem.content.length > 0) {
          const textPart = outputItem.content.find(part => part.type === 'output_text');
          if (textPart && textPart.text) {
            replyText = textPart.text;
          }
        }
      }

      return {
        success: true,
        reply: replyText,
        usage: data.usage || null
      };

    } catch (error) {
      console.error('Error sending message to gateway:', error);
      return {
        success: false,
        error: error.message,
        reply: `Connection error: ${error.message}`
      };
    }
  }

  /**
   * Stream a message (SSE)
   * For Phase 3 - voice with streaming responses
   */
  async streamMessage(message, onChunk) {
    try {
      const response = await fetch(`${this.gatewayUrl}/v1/responses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.gatewayToken}`,
          'x-openclaw-agent-id': 'main'
        },
        body: JSON.stringify({
          model: 'openclaw',
          input: message,
          stream: true
        })
      });

      if (!response.ok) {
        throw new Error(`Gateway error: ${response.status}`);
      }

      // Parse SSE stream
      const reader = response.body;
      let buffer = '';

      for await (const chunk of reader) {
        buffer += chunk.toString();
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') {
              return { success: true };
            }
            try {
              const parsed = JSON.parse(data);
              onChunk(parsed);
            } catch (e) {
              // Skip malformed JSON
            }
          }
        }
      }

      return { success: true };

    } catch (error) {
      console.error('Error streaming from gateway:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

module.exports = OpenClawService;
