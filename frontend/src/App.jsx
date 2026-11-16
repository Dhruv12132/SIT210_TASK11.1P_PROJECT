
import { useEffect, useState } from "react";
import { io } from "socket.io-client";

import {
  Wind,
  Thermometer,
  Droplets,
  Activity,
  Fan,
  Wifi,
  Power,
  Gauge,
  UserRound
} from "lucide-react";

import "./App.css";

const socket = io(`http://${window.location.hostname}:3000`);

function App() {

  const [sensorData, setSensorData] = useState({
    mq135: null,
    temperature: null,
    humidity: null,
    fan: "OFF",
    mode: "AUTOMATIC"
  });

  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(false);

  // Connect to Raspberry Pi and receive sensor data
  useEffect(() => {

    socket.on("connect", () => {
      setConnected(true);
    });

    socket.on("disconnect", () => {
      setConnected(false);
    });

    socket.on("sensorUpdate", (data) => {

      setSensorData((previous) => ({
        ...previous,
        ...data
      }));

    });

    // Get the latest sensor readings
    fetch(`http://${window.location.hostname}:3000/api/sensors`)
      .then((response) => response.json())
      .then((data) => {

        setSensorData((previous) => ({
          ...previous,
          ...data
        }));

      })
      .catch((error) => {
        console.error("Sensor API error:", error);
      });

    return () => {
      socket.off("connect");
      socket.off("disconnect");
      socket.off("sensorUpdate");
    };

  }, []);

  // Control the exhaust fan
  const controlFan = async (state) => {

    setLoading(true);

    try {

      const response = await fetch(
        `http://${window.location.hostname}:3000/api/fan`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json"
          },

          body: JSON.stringify({ state })
        }
      );

      const result = await response.json();

      if (!response.ok) {
        alert(result.error || "Unable to control fan");
      }

    } catch (error) {

      console.error("Fan control error:", error);
      alert("Could not connect to the server.");

    } finally {

      setLoading(false);

    }
  };

  // Display sensor readings
  const displayValue = (value, unit = "") => {

    if (value === null || value === undefined || value === "") {
      return "--";
    }

    return `${value}${unit}`;
  };

  // Sensor information
  const sensors = [

    {
      title: "AIR QUALITY",
      value: displayValue(sensorData.mq135),
      description: "MQ135 raw reading",
      icon: Activity,
      color: "cyan"
    },

    {
      title: "TEMPERATURE",
      value: displayValue(sensorData.temperature, " °C"),
      description: "Room temperature",
      icon: Thermometer,
      color: "orange"
    },

    {
      title: "HUMIDITY",
      value: displayValue(sensorData.humidity, " %"),
      description: "Relative humidity",
      icon: Droplets,
      color: "blue"
    }

  ];

  return (

    <div className="dashboard">

      {/* Sidebar */}

      <aside className="sidebar">

        <div className="brand">

          <div className="brand-icon">
            <Wind size={26} />
          </div>

          <div>
            <h2>AirSense</h2>
            <span>SMART ENVIRONMENT</span>
          </div>

        </div>

        <div className="sidebar-navigation">

          <div className="nav-item active">
            <Gauge size={19} />
            Dashboard
          </div>

        </div>

        <div className="sidebar-bottom">

          <span className={`status-dot ${connected ? "online" : ""}`}></span>

          <span>
            {connected ? "System Connected" : "Connecting..."}
          </span>

          <p>AirSense Monitoring System</p>

        </div>

      </aside>

      {/* Main Dashboard */}

      <main className="main-content">

        {/* Header */}

        <header className="topbar">

          <div>

            <p className="eyebrow">
              ENVIRONMENT MONITORING
            </p>

            <h1>Air Quality Dashboard</h1>

            <p className="subtitle">
              Monitor your environment and manage ventilation.
            </p>

          </div>

          <div className={`connection ${connected ? "connected" : "offline"}`}>

            <Wifi size={17} />

            {connected ? "Live Connection" : "Offline"}

          </div>

        </header>

        {/* Welcome Section */}

        <section className="welcome-panel">

          <div>

            <p className="eyebrow">
              SMART MONITORING SYSTEM
            </p>

            <h2>Welcome to AirSense</h2>

            <p>
              Real-time environmental monitoring and ventilation control.
            </p>

          </div>

          <div className="welcome-icon">
            <Wind size={58} />
          </div>

        </section>

        {/* Sensor Overview */}

        <section className="section-heading">

          <div>

            <h2>Sensor Overview</h2>

            <p>Current readings from connected sensors</p>

          </div>

          <div className="live-label">

            <span className="status-dot online"></span>
            LIVE DATA

          </div>

        </section>

        <section className="sensor-grid">

          {/* Sensor Cards */}

          {sensors.map((sensor) => {

            const Icon = sensor.icon;

            return (

              <article className="sensor-card" key={sensor.title}>

                <div className={`sensor-icon ${sensor.color}`}>
                  <Icon size={23} />
                </div>

                <p className="sensor-title">
                  {sensor.title}
                </p>

                <h3>
                  {sensor.value}
                </h3>

                <p className="sensor-description">
                  {sensor.description}
                </p>

              </article>

            );

          })}

          {/* Static Motion Detection Card */}

          <article className="sensor-card">

            <div className="sensor-icon purple">
              <UserRound size={23} />
            </div>

            <p className="sensor-title">
              MOTION DETECTED
            </p>

            <h3 className="text-green">
              YES
            </h3>

            <p className="sensor-description">
              Motion detection enabled
            </p>

          </article>

        </section>

        {/* Fan Control */}

        <section className="control-section">

          <article className="panel fan-panel">

            <div className="panel-heading">

              <div>

                <p className="eyebrow">
                  VENTILATION MANAGEMENT
                </p>

                <h2>Exhaust Fan Control</h2>

                <p>
                  Manage your connected ventilation fan.
                </p>

              </div>

              <div className="panel-icon">
                <Fan size={23} />
              </div>

            </div>

            <div className="fan-content">

              <div className={`fan-visual ${
                sensorData.fan === "ON" ? "fan-running" : ""
              }`}>

                <Fan size={58} />

              </div>

              <div className="fan-status">

                <span>Current fan status</span>

                <strong className={
                  sensorData.fan === "ON" ? "text-green" : ""
                }>

                  {sensorData.fan || "OFF"}

                </strong>

              </div>

            </div>

            {/* Manual Fan Buttons */}

            <div className="fan-buttons">

              <button
                className="fan-on"
                onClick={() => controlFan("ON")}
                disabled={loading || sensorData.fan === "ON"}
              >

                <Power size={17} />
                Turn ON

              </button>

              <button
                className="fan-off"
                onClick={() => controlFan("OFF")}
                disabled={loading || sensorData.fan === "OFF"}
              >

                <Power size={17} />
                Turn OFF

              </button>

            </div>

            <div className="mode-info">

              <span>Control mode</span>

              <strong>
                {sensorData.mode || "AUTOMATIC"}
              </strong>

            </div>

          </article>

        </section>

        {/* Footer */}

        <footer className="dashboard-footer">

          <span>
            AirSense | Smart Air Quality Monitoring System
          </span>

          <span>
            Raspberry Pi 4 · Arduino Nano 33 IoT
          </span>

        </footer>

      </main>

    </div>

  );

}

export default App;
