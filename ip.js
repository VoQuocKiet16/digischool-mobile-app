const os = require('os');

function getLocalIP() {
  const interfaces = os.networkInterfaces();
  
  for (const name of Object.keys(interfaces)) {
    for (const interface of interfaces[name]) {
      // Bỏ qua IPv6 và loopback
      if (interface.family === 'IPv4' && !interface.internal) {
        return interface.address;
      }
    }
  }
  
  return 'localhost'; // Fallback nếu không tìm thấy IP
}

const localIP = getLocalIP();
console.log(`Local IP: ${localIP}`);
console.log(`API URL: http://${localIP}:8080`);

module.exports = { getLocalIP }; 