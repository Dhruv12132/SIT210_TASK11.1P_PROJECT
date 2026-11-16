
const express = require("express");
const mqtt = require("mqtt");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);

app.use(cors());
app.use(express.json());

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

const PORT = 3000;
const MQTT_URL = "mqtt://localhost:1883";

const mqttClient = mqtt.connect(MQTT_URL);

let sensorData = {
  mq135: null,
  temperature: null,
  humidity: null,
  pir: 0,
  fan: "OFF",
  mode: "MANUAL"
};

mqttClient.on("connect", () => {
  console.log("Connected to MQTT broker");

  mqttClient.subscribe("smartair/#");
});

mqttClient.on("message", (topic, message) => {
  const value = message.toString();

  console.log(topic, value);

  switch (topic) {
    case "smartair/mq135":
      sensorData.mq135 = Number(value);
      break;

    case "smartair/temperature":
      sensorData.temperature = Number(value);
      break;

    case "smartair/humidity":
      sensorData.humidity = Number(value);
      break;

    case "smartair/pir":
      sensorData.pir = Number(value);
      break;

    case "smartair/fan/status":
      sensorData.fan = value;
      break;
  }

  io.emit("sensorUpdate", sensorData);
});

io.on("connection", (socket) => {
  console.log("Dashboard connected");

  socket.emit("sensorUpdate", sensorData);
});

app.get("/api/sensors", (req, res) => {
  res.json(sensorData);
});

app.post("/api/fan", (req, res) => {
  const { state } = req.body;

  if (state !== "ON" && state !== "OFF") {
    return res.status(400).json({
      error: "State must be ON or OFF"
    });
  }

  if (!mqttClient.connected) {
    return res.status(503).json({
      error: "MQTT broker is not connected"
    });
  }

  mqttClient.publish("smartair/fan/control", state, { qos: 1 });

  sensorData.fan = state;
  io.emit("sensorUpdate", sensorData);

  res.json({
    message: `Fan command sent: ${state}`,
    fan: state
  });
});

app.get("/", (req, res) => {
  res.send("Smart Air Quality Dashboard Backend Running");
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});
