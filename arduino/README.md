# SafeWater ESP32 Smart Water Meter — Hardware & Arduino IDE Guide

This guide explains how to wire, configure, calibrate, and flash the unified firmware to your ESP32 microcontroller using the **Arduino IDE**.

---

## 1. Hardware Pinout & Wiring Diagram

| Component | Component Pin | ESP32 Pin | Notes |
| :--- | :--- | :--- | :--- |
| **YF-S201 Flow Sensor** | VCC (Red) | **5V / VIN** | Powered by 5V rail |
| | GND (Black) | **GND** | Common ground |
| | Signal (Yellow) | **GPIO 35** | Interrupt pin (Add 10kΩ pull-up to 3.3V) |
| **Solenoid Valve Relay** | VCC | **5V / VIN** | 5V Relay Module |
| | GND | **GND** | Common ground |
| | IN (Signal) | **GPIO 23** | Configurable active HIGH / LOW |
| **Red Status LED** | Anode (+) | **GPIO 32** | Offline / Alert indicator (via 220Ω resistor) |
| | Cathode (-) | **GND** | Ground |
| **Blue Status LED** | Anode (+) | **GPIO 33** | Connected / Flow indicator (via 220Ω resistor) |
| | Cathode (-) | **GND** | Ground |
| **I2C LCD (16x2)** *(Optional)* | SDA | **GPIO 21** | Default ESP32 I2C Data |
| | SCL | **GPIO 22** | Default ESP32 I2C Clock |
| | VCC / GND | **5V / GND** | Standard I2C backpack |

> [!NOTE]
> GPIO 35 is an input-only pin on the ESP32 without internal pull-ups. For reliable pulse detection with Hall-effect sensors, ensure a 10kΩ pull-up resistor is placed between GPIO 35 and 3.3V (or use a sensor module with built-in pullup).

---

## 2. Arduino IDE Setup

1. **Install Arduino IDE 2.x** from [arduino.cc](https://www.arduino.cc/en/software).
2. **Add ESP32 Board URL**:
   - Go to *File* -> *Preferences*.
   - In *Additional Board Manager URLs*, add:
     `https://raw.githubusercontent.com/espressif/arduino-esp32/gh-pages/package_esp32_index.json`
3. **Install ESP32 Board Package**:
   - Go to *Tools* -> *Board* -> *Boards Manager...*
   - Search for **esp32** by *Espressif Systems* and click **Install**.
4. **Install Required Libraries**:
   - Go to *Tools* -> *Manage Libraries...*
   - Install **ArduinoJson** (by Benoit Blanchon, v7.x or v6.x).
   - Install **LiquidCrystal_I2C** (by Frank de Brabander - optional for LCD).

---

## 3. Flash the Firmware

1. Open `arduino/SafeWater_ESP32/SafeWater_ESP32.ino` in Arduino IDE.
2. Edit your Wi-Fi and Device Credentials near line 55:
   ```cpp
   const char* WIFI_SSID     = "Your_WiFi_Network";
   const char* WIFI_PASSWORD = "Your_WiFi_Password";
   const char* METER_SERIAL   = "SWM-000124";
   const char* DEVICE_API_KEY = "YOUR_DEVICE_API_KEY";
   ```
3. Connect your ESP32 via USB cable.
4. Select **Tools** -> **Board** -> **ESP32 Arduino** -> **ESP32 Dev Module**.
5. Select the correct **Port** (e.g. `COM3` on Windows).
6. Click **Upload** (Arrow icon).

---

## 4. Flow Sensor Calibration Method

The YF-S201 nominal calibration is:
$$\text{Pulses Per Litre} = 450.0$$
$$\text{Flow Rate (L/min)} = \frac{\text{Pulses per Second}}{7.5}$$

### To fine-tune on physical water line:
1. Open the Arduino IDE **Serial Monitor** at `115200 baud`.
2. Pour exactly **$1.0\text{ Litre}$** of water through the sensor into a graduated measuring jug.
3. Check the counted pulses printed on the Serial Monitor.
4. If it reads e.g. `462 pulses`, update line 71:
   ```cpp
   const float PULSES_PER_LITRE = 462.0f;
   ```
5. Re-upload for 100% volumetric accuracy!

---

## 5. Web App & Cloud Integration

- Telemetry is securely transmitted over HTTPS to:
  `https://ueeskinlxggnxqnymiqg.supabase.co/functions/v1/esp32-ingest`
- When a customer purchases a token or starts a session:
  1. The server queues an `OPEN` valve command.
  2. The ESP32 polls and opens the solenoid valve.
  3. Flow pulses increment consumption and deduct from the active token in real-time.
  4. When remaining volume hits $0.000\text{ L}$, the Supabase database trigger automatically issues a `CLOSE` valve command to prevent over-drafting.
