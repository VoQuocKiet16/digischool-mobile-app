const os = require("os");

function getLocalIP() {
  const interfaces = os.networkInterfaces();

  for (const iface of Object.values(interfaces).flat()) {
    if (iface.family === "IPv4" && !iface.internal) {
      console.log(`📡 API URL: http://${iface.address}:8080`);
      return iface.address;
    }
  }

  console.log("❌ Không tìm thấy IP");
  return null;
}

getLocalIP();
