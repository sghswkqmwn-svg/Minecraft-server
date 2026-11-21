let config;
let toastTimer;

const colors = {
  blue: "#3b82f6",
  red: "#ef4444",
  yellow: "#eab308",
  purple: "#a855f7",
  white: "#f8fafc",
  pink: "#ec4899",
  orange: "#f97316"
};

async function start() {
  try {
    const res = await fetch("./config.json");

    if (!res.ok) throw new Error("Config not found");

    config = await res.json();

    setupWebsite();
    checkStatus();

  } catch (error) {
    console.error(error);
    document.getElementById("onlineBadge").textContent =
      "Config Error";
  }
}

function setupWebsite() {
  const name = config.serverName || "ENDERFORGESMP";
  const ip = config.serverIp || "";
  const port = config.bedrockPort || 19132;
  const color = colors[
    (config.defaultColour || "blue").toLowerCase()
  ] || colors.blue;

  document.documentElement.style.setProperty(
    "--accent", color
  );

  document.getElementById("navName").textContent = name;
  document.getElementById("name").textContent = name;
  document.getElementById("footerName").textContent = name;

  document.getElementById("ip").textContent = ip;
  document.getElementById("javaIP").textContent = ip;
  document.getElementById("bedrockIP").textContent = ip;
  document.getElementById("port").textContent = "Port: " + port;

  document.getElementById("logo").src =
    config.logoPath || "images-2.jpg";

  document.getElementById("discord").href =
    config.discordLink || "#";

  document.getElementById("discord2").href =
    config.discordLink || "#";

  document.getElementById("year").textContent =
    new Date().getFullYear();

  if (!config.bedrockPlayersCanJoin) {
    document.getElementById("bedrockStatus").textContent =
      "Not supported";
  }
}

// COPY IP

async function copyIP() {
  if (!config?.serverIp) {
    showToast("Server IP missing!");
    return;
  }

  try {
    await navigator.clipboard.writeText(config.serverIp);
    showToast("IP Copied!");

  } catch (e) {
    showToast("Copy failed!");
  }
}

document.getElementById("copyIP").onclick = copyIP;
document.getElementById("navCopy").onclick = copyIP;
document.getElementById("joinCopy").onclick = copyIP;

// TOAST

function showToast(message) {
  const toast = document.getElementById("toast");

  toast.textContent = message;
  toast.classList.add("show");

  clearTimeout(toastTimer);

  toastTimer = setTimeout(() => {
    toast.classList.remove("show");
  }, 2500);
}

// STATUS

async function checkStatus() {
  if (!config?.serverIp) return;

  const badge = document.getElementById("onlineBadge");
  const java = document.getElementById("javaStatus");
  const bedrock = document.getElementById("bedrockStatus");
  const players = document.getElementById("players");

  badge.textContent = "Checking...";
  java.textContent = "Checking...";
  players.textContent = "--";

  const address = encodeURIComponent(config.serverIp);

  try {
    const response = await fetch(
      `https://api.mcstatus.io/v2/status/java/${address}`
    );

    if (!response.ok) throw new Error("API Error");

    const data = await response.json();

    if (data.online) {
      badge.textContent = "ONLINE";
      badge.style.color = "#22c55e";

      java.textContent = "ONLINE";

      players.textContent =
        `${data.players.online} / ${data.players.max}`;

    } else {
      badge.textContent = "OFFLINE";
      badge.style.color = "#ef4444";

      java.textContent = "OFFLINE";
      players.textContent = "0";
    }

  } catch (error) {
    badge.textContent = "UNKNOWN";
    java.textContent = "UNKNOWN";
  }

  // Bedrock Status

  if (config.bedrockPlayersCanJoin) {
    try {
      const bedrockAddress = encodeURIComponent(
        `${config.serverIp}:${config.bedrockPort}`
      );

      const response = await fetch(
        `https://api.mcstatus.io/v2/status/bedrock/${bedrockAddress}`
      );

      if (!response.ok) throw new Error("Bedrock API Error");

      const data = await response.json();

      bedrock.textContent = data.online
        ? "ONLINE"
        : "OFFLINE";

    } catch (error) {
      bedrock.textContent = "UNKNOWN";
    }
  }
}

document.getElementById("refresh").onclick = checkStatus;

start();
