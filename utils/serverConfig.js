// Server configuration utility
class ServerConfig {
  constructor() {
    this.baseURL = null;
    this.serverIP = null;
    this.port = 4000;
  }

  // Try to detect server IP automatically
  async detectServerIP() {
    // Try common local IP patterns
    const commonIPs = [
      '192.168.68.51', // Your current IP
    ];

    for (const ip of commonIPs) {
      try {
        const response = await fetch(`http://${ip}:${this.port}/api/server-info`, {
          method: 'GET',
          timeout: 2000 // 2 second timeout
        });
        
        if (response.ok) {
          const data = await response.json();
          this.serverIP = data.ip;
          this.baseURL = `http://${this.serverIP}:${this.port}`;
          console.log(`✅ Server detected at: ${this.baseURL}`);
          return this.baseURL;
        }
      } catch (error) {
        console.log(`❌ Failed to connect to ${ip}:${this.port}`);
        continue;
      }
    }

    // Fallback to localhost for web development
    this.serverIP = 'localhost';
    this.baseURL = `http://localhost:${this.port}`;
    console.log(`⚠️ Using fallback: ${this.baseURL}`);
    return this.baseURL;
  }

  // Get the current server URL
  getServerURL() {
    return this.baseURL || `http://localhost:${this.port}`;
  }

  // Get the plan generation endpoint
  getPlanEndpoint() {
    return `${this.getServerURL()}/api/plan`;
  }

  // Get the server info endpoint
  getServerInfoEndpoint() {
    return `${this.getServerURL()}/api/server-info`;
  }

  // Manual override for server IP
  setServerIP(ip) {
    this.serverIP = ip;
    this.baseURL = `http://${ip}:${this.port}`;
    console.log(`🔧 Manually set server IP to: ${this.baseURL}`);
  }
}

// Create and export a singleton instance
const serverConfig = new ServerConfig();
export default serverConfig;
