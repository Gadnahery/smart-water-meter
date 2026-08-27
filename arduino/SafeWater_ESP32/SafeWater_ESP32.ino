/*
 * ==============================================================================
 *  SafeWater Smart Water Meter - Complete ESP32 Firmware for Arduino IDE
 * ==============================================================================
 *  
 *  Target Board: ESP32 Dev Module / ESP32-WROOM-32 / ESP32-S3
 *  IDE: Arduino IDE 2.x or 1.8.x
 * 
 *  Required Arduino Libraries (Install via Arduino Library Manager):
 *  1. ArduinoJson (v7.x or v6.x by Benoit Blanchon)
 *  2. LiquidCrystal_I2C (by Frank de Brabander or Marco Schwartz) - Optional for LCD
 * 
 *  Hardware Connections:
 *  - Water Flow Sensor (YF-S201 / Hall Effect):
 *      VCC -> 5V (or 3.3V)
 *      GND -> GND
 *      Signal -> GPIO 35 (or GPIO 4, 18, etc.) [Note: GPIO 35 requires a 10k pullup to 3.3V]
 *  - Solenoid Valve Relay (Optional / Recommended):
 *      VCC -> 5V
 *      GND -> GND
 *      IN  -> GPIO 23 (Active HIGH or LOW configurable below)
 *  - Red Status LED:
 *      Anode (+) -> 220 ohm resistor -> GPIO 32
 *      Cathode (-) -> GND
 *  - Blue Status LED:
 *      Anode (+) -> 220 ohm resistor -> GPIO 33
 *      Cathode (-) -> GND
 *  - I2C 16x2 LCD Display (Optional):
 *      SDA -> GPIO 21
 *      SCL -> GPIO 22
 *      VCC -> 5V, GND -> GND
 * 
 *  Flow Sensor Calibration (YF-S201 Standard):
 *  - Nominal pulses per liter: 450.0 pulses/L
 *  - Frequency Formula: Frequency (Hz) = 7.5 * Flow Rate (L/min)
 *  - Flow Rate Formula: Flow Rate (L/min) = (Pulses per second) / 7.5
 *  - Volume Formula: Litres = Total Pulses / 450.0
 * 
 * ==============================================================================
 */

#include <Arduino.h>
#include <WiFi.h>
#include <HTTPClient.h>
#include <WiFiClientSecure.h>
#include <ArduinoJson.h>
#include <Wire.h>
#include <LiquidCrystal_I2C.h>
#include <Preferences.h>
#include <time.h>

// ==============================================================================
//  1. CONFIGURATION & DEVICE IDENTIFIERS (EDIT THESE)
// ==============================================================================

// --- Wi-Fi Credentials ---
const char* WIFI_SSID     = "YOUR_WIFI_SSID";
const char* WIFI_PASSWORD = "YOUR_WIFI_PASSWORD";

// --- Device Credentials (from Supabase smart_meters table) ---
const char* METER_SERIAL   = "SWM-000124";
const char* DEVICE_API_KEY = "CHANGE_ME_DEVICE_API_KEY";
const char* FIRMWARE_VER   = "1.2.0";

// --- Supabase Edge Function Ingest URL ---
const char* API_BASE_URL = "https://ueeskinlxggnxqnymiqg.supabase.co/functions/v1/esp32-ingest";

// --- GPIO Pin Definitions ---
#define FLOW_SENSOR_PIN   35    // Flow sensor pulse signal pin
#define VALVE_RELAY_PIN   23    // Solenoid valve relay control pin
#define RED_LED_PIN       32    // Red LED (Offline / Alert)
#define BLUE_LED_PIN      33    // Blue LED (Wi-Fi connected / Active)
#define LCD_SDA_PIN       21    // I2C SDA
#define LCD_SCL_PIN       22    // I2C SCL
#define LCD_I2C_ADDR      0x27  // Typically 0x27 or 0x3F

// --- Flow Sensor Calibration Constants ---
// YF-S201 nominal is 450 pulses/L, K-factor = 7.5
// For fine-tuning: run 1.0 Litre into a measuring jug, if you count 460 pulses, set to 460.0f
const float PULSES_PER_LITRE    = 450.0f;
const float CALIBRATION_FACTOR  = 7.5f;

// Relay Active State (true = HIGH turns valve ON, false = LOW turns valve ON)
const bool VALVE_ACTIVE_HIGH = true;

// --- Timing Intervals (milliseconds) ---
const unsigned long FLOW_CALC_INTERVAL_MS      = 1000UL;   // Recalculate flow velocity every 1s
const unsigned long READING_UPLOAD_INTERVAL_MS = 30000UL;  // Upload meter telemetry every 30s
const unsigned long HEARTBEAT_INTERVAL_MS      = 60000UL;  // Send health heartbeat every 60s
const unsigned long COMMAND_POLL_INTERVAL_MS   = 5000UL;   // Poll for valve/system commands every 5s
const unsigned long MAX_BUFFERED_READINGS      = 100;

// ==============================================================================
//  2. GLOBAL STATE & OBJECTS
// ==============================================================================

LiquidCrystal_I2C lcd(LCD_I2C_ADDR, 16, 2);
Preferences preferences;

// Pulse measurement state
volatile unsigned long pulseCount = 0;
unsigned long lastPulseCount = 0;
unsigned long lastFlowCalcTime = 0;

float currentFlowRateLpm = 0.0f;
float totalLitresConsumed = 0.0f;
float lastPersistedTotal = 0.0f;
bool isValveOpen = true;
bool hasLcd = false;

// Task timers
unsigned long lastUploadTime = 0;
unsigned long lastHeartbeatTime = 0;
unsigned long lastCommandPollTime = 0;
unsigned long lastWifiBlinkTime = 0;
bool wifiBlinkState = false;

// Offline reading buffer
struct OfflineReading {
  float flowRate;
  float totalLitres;
  time_t timestamp;
};
OfflineReading readingBuffer[MAX_BUFFERED_READINGS];
int bufferedCount = 0;

struct RemoteCommand {
  String id;
  String command;
};

// ==============================================================================
//  3. HARDWARE INTERRUPT SERVICE ROUTINE (ISR)
// ==============================================================================

void IRAM_ATTR onFlowSensorPulse() {
  pulseCount++;
}

// ==============================================================================
//  4. VALVE CONTROL
// ==============================================================================

void setValveState(bool open) {
  isValveOpen = open;
  if (VALVE_ACTIVE_HIGH) {
    digitalWrite(VALVE_RELAY_PIN, open ? HIGH : LOW);
  } else {
    digitalWrite(VALVE_RELAY_PIN, open ? LOW : HIGH);
  }
  Serial.printf("[valve] State updated: %s\n", open ? "OPEN (Flow enabled)" : "CLOSED (Shutoff)");
}

// ==============================================================================
//  5. LCD DISPLAY HELPER
// ==============================================================================

void updateLcdDisplay() {
  if (!hasLcd) return;

  lcd.setCursor(0, 0);
  if (WiFi.status() == WL_CONNECTED) {
    lcd.printf("Flow: %4.1f L/m  ", currentFlowRateLpm);
  } else {
    lcd.print("WiFi: Connect... ");
  }

  lcd.setCursor(0, 1);
  lcd.printf("Tot:%6.1fL %s", totalLitresConsumed, isValveOpen ? "ON " : "OFF");
}

// ==============================================================================
//  6. API CLIENT (SUPABASE EDGE FUNCTION)
// ==============================================================================

bool sendApiRequest(const char* action, JsonDocument& extraData, JsonDocument& responseDoc) {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.printf("[api] Skip %s - Wi-Fi disconnected\n", action);
    return false;
  }

  JsonDocument requestBody;
  requestBody["action"] = action;
  requestBody["meter_serial"] = METER_SERIAL;
  requestBody["api_key"] = DEVICE_API_KEY;

  for (JsonPairConst kv : extraData.as<JsonObjectConst>()) {
    requestBody[kv.key()] = kv.value();
  }

  String jsonPayload;
  serializeJson(requestBody, jsonPayload);

  WiFiClientSecure secureClient;
  secureClient.setInsecure(); // Uses SSL encryption

  HTTPClient http;
  http.begin(secureClient, API_BASE_URL);
  http.addHeader("Content-Type", "application/json");
  http.setTimeout(8000);

  int httpCode = http.POST(jsonPayload);
  bool success = false;

  if (httpCode >= 200 && httpCode < 300) {
    String responseString = http.getString();
    DeserializationError err = deserializeJson(responseDoc, responseString);
    if (!err && responseDoc["success"] == true) {
      success = true;
    } else {
      Serial.printf("[api] Response error for %s: %s\n", action, responseString.c_str());
    }
  } else {
    Serial.printf("[api] HTTP Error for %s: code %d (%s)\n", action, httpCode, http.errorToString(httpCode).c_str());
  }

  http.end();
  return success;
}

bool uploadReading(float flowRate, float litres, int batteryPct, int rssiDbm) {
  JsonDocument extra;
  extra["flow_rate"] = flowRate;
  extra["water_usage"] = litres;
  extra["battery"] = batteryPct;
  extra["wifi_signal"] = rssiDbm;
  extra["status"] = isValveOpen ? "online" : "disabled";

  JsonDocument response;
  bool ok = sendApiRequest("reading", extra, response);
  if (ok) {
    Serial.printf("[telemetry] Uploaded: Flow=%.2f L/min, Total=%.2f L, RSSI=%d dBm\n", flowRate, litres, rssiDbm);
  }
  return ok;
}

bool sendHeartbeat(int batteryPct, int rssiDbm) {
  JsonDocument extra;
  extra["battery"] = batteryPct;
  extra["wifi_signal"] = rssiDbm;
  extra["firmware_version"] = FIRMWARE_VER;

  JsonDocument response;
  return sendApiRequest("heartbeat", extra, response);
}

int fetchPendingCommands(RemoteCommand* cmdBuffer, int maxCmds) {
  JsonDocument extra;
  JsonDocument response;

  if (!sendApiRequest("get_commands", extra, response)) {
    return 0;
  }

  JsonArrayConst arr = response["commands"].as<JsonArrayConst>();
  int count = 0;
  for (JsonObjectConst item : arr) {
    if (count >= maxCmds) break;
    cmdBuffer[count].id = item["id"].as<String>();
    cmdBuffer[count].command = item["command"].as<String>();
    count++;
  }
  return count;
}

void acknowledgeCommand(const String& cmdId, const char* status) {
  JsonDocument extra;
  extra["command_id"] = cmdId;
  extra["status"] = status;

  JsonDocument response;
  sendApiRequest("ack_command", extra, response);
}

void sendDeviceLog(const char* level, const String& msg) {
  JsonDocument extra;
  extra["level"] = level;
  extra["message"] = msg;

  JsonDocument response;
  sendApiRequest("log", extra, response);
}

// ==============================================================================
//  7. COMMAND DISPATCHER
// ==============================================================================

const char* processCommand(const String& cmd) {
  Serial.printf("[command] Processing: %s\n", cmd.c_str());

  if (cmd == "OPEN") {
    setValveState(true);
    sendDeviceLog("INFO", "Valve OPENED by remote server command");
    return "executed";
  }
  else if (cmd == "CLOSE") {
    setValveState(false);
    sendDeviceLog("INFO", "Valve CLOSED by remote server command");
    return "executed";
  }
  else if (cmd == "RESET") {
    totalLitresConsumed = 0.0f;
    pulseCount = 0;
    preferences.putFloat("total_litres", 0.0f);
    sendDeviceLog("WARNING", "Cumulative consumption RESET to 0.0 L");
    return "executed";
  }
  else if (cmd == "RESTART") {
    sendDeviceLog("WARNING", "Device restarting remotely");
    preferences.putFloat("total_litres", totalLitresConsumed);
    delay(500);
    ESP.restart();
    return "executed";
  }
  else if (cmd == "CALIBRATE") {
    sendDeviceLog("INFO", "Flow sensor calibration flag set. K=7.5 (450 p/L)");
    return "executed";
  }

  sendDeviceLog("ERROR", "Unknown command: " + cmd);
  return "failed";
}

void checkRemoteCommands() {
  RemoteCommand commands[4];
  int count = fetchPendingCommands(commands, 4);

  for (int i = 0; i < count; i++) {
    const char* result = processCommand(commands[i].command);
    acknowledgeCommand(commands[i].id, result);
  }
}

// ==============================================================================
//  8. PERSISTENCE & OFFLINE BUFFERING
// ==============================================================================

void persistTotalToFlash() {
  if (abs(totalLitresConsumed - lastPersistedTotal) > 0.05f) {
    preferences.putFloat("total_litres", totalLitresConsumed);
    lastPersistedTotal = totalLitresConsumed;
  }
}

void bufferCurrentReading(float flowRate, float litres) {
  if (bufferedCount < MAX_BUFFERED_READINGS) {
    readingBuffer[bufferedCount].flowRate = flowRate;
    readingBuffer[bufferedCount].totalLitres = litres;
    readingBuffer[bufferedCount].timestamp = time(nullptr);
    bufferedCount++;
  } else {
    // Shift buffer if full
    for (int i = 0; i < MAX_BUFFERED_READINGS - 1; i++) {
      readingBuffer[i] = readingBuffer[i + 1];
    }
    readingBuffer[MAX_BUFFERED_READINGS - 1].flowRate = flowRate;
    readingBuffer[MAX_BUFFERED_READINGS - 1].totalLitres = litres;
    readingBuffer[MAX_BUFFERED_READINGS - 1].timestamp = time(nullptr);
  }
}

void flushOfflineBuffer(int battery, int rssi) {
  int sent = 0;
  for (int i = 0; i < bufferedCount; i++) {
    if (uploadReading(readingBuffer[i].flowRate, readingBuffer[i].totalLitres, battery, rssi)) {
      sent++;
    } else {
      break; // Still offline
    }
  }
  if (sent > 0) {
    for (int i = sent; i < bufferedCount; i++) {
      readingBuffer[i - sent] = readingBuffer[i];
    }
    bufferedCount -= sent;
    Serial.printf("[buffer] Flushed %d offline readings, remaining: %d\n", sent, bufferedCount);
  }
}

// ==============================================================================
//  9. WI-FI MANAGEMENT
// ==============================================================================

void connectToWiFi() {
  Serial.printf("\n[wifi] Connecting to SSID: %s\n", WIFI_SSID);
  digitalWrite(RED_LED_PIN, HIGH);
  digitalWrite(BLUE_LED_PIN, LOW);

  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

  int retries = 0;
  while (WiFi.status() != WL_CONNECTED && retries < 25) {
    delay(400);
    digitalWrite(BLUE_LED_PIN, !digitalRead(BLUE_LED_PIN));
    Serial.print(".");
    retries++;
  }

  if (WiFi.status() == WL_CONNECTED) {
    digitalWrite(RED_LED_PIN, LOW);
    digitalWrite(BLUE_LED_PIN, HIGH);
    Serial.printf("\n[wifi] Connected! IP: %s, RSSI: %d dBm\n", WiFi.localIP().toString().c_str(), WiFi.RSSI());
  } else {
    digitalWrite(RED_LED_PIN, HIGH);
    digitalWrite(BLUE_LED_PIN, LOW);
    Serial.println("\n[wifi] Connection failed. Will retry in loop.");
  }
}

void checkWiFiHealth() {
  if (WiFi.status() == WL_CONNECTED) {
    digitalWrite(RED_LED_PIN, LOW);
    digitalWrite(BLUE_LED_PIN, HIGH);
  } else {
    digitalWrite(RED_LED_PIN, HIGH);
    // Blink blue LED
    if (millis() - lastWifiBlinkTime >= 400) {
      lastWifiBlinkTime = millis();
      wifiBlinkState = !wifiBlinkState;
      digitalWrite(BLUE_LED_PIN, wifiBlinkState ? HIGH : LOW);
    }
  }
}

// ==============================================================================
//  10. ARDUINO SETUP & LOOP
// ==============================================================================

void setup() {
  Serial.begin(115200);
  delay(300);

  Serial.println("\n==================================================");
  Serial.printf("  SafeWater ESP32 Smart Water Meter v%s\n", FIRMWARE_VER);
  Serial.printf("  Meter Serial: %s\n", METER_SERIAL);
  Serial.println("==================================================");

  // Initialize GPIO
  pinMode(FLOW_SENSOR_PIN, INPUT);
  pinMode(VALVE_RELAY_PIN, OUTPUT);
  pinMode(RED_LED_PIN, OUTPUT);
  pinMode(BLUE_LED_PIN, OUTPUT);

  setValveState(true); // Default valve open on startup

  // Initialize I2C LCD
  Wire.begin(LCD_SDA_PIN, LCD_SCL_PIN);
  Wire.beginTransmission(LCD_I2C_ADDR);
  if (Wire.endTransmission() == 0) {
    hasLcd = true;
    lcd.init();
    lcd.backlight();
    lcd.setCursor(0, 0);
    lcd.print("SafeWater Meter");
    lcd.setCursor(0, 1);
    lcd.printf("v%s Starting...", FIRMWARE_VER);
    delay(1000);
  }

  // Restore non-volatile memory (total litres)
  preferences.begin("safewater", false);
  totalLitresConsumed = preferences.getFloat("total_litres", 0.0f);
  lastPersistedTotal = totalLitresConsumed;
  Serial.printf("[memory] Restored cumulative total: %.2f Litres\n", totalLitresConsumed);

  // Attach flow sensor pulse interrupt
  attachInterrupt(digitalPinToInterrupt(FLOW_SENSOR_PIN), onFlowSensorPulse, FALLING);
  lastFlowCalcTime = millis();

  // Connect to Wi-Fi
  connectToWiFi();

  // Sync NTP Time
  configTime(0, 0, "pool.ntp.org", "time.nist.gov");

  // Initial cloud sync
  if (WiFi.status() == WL_CONNECTED) {
    sendHeartbeat(100, WiFi.RSSI());
    sendDeviceLog("INFO", "SafeWater ESP32 booted successfully. Firmware v" + String(FIRMWARE_VER));
  }
}

void loop() {
  unsigned long now = millis();

  // Check Wi-Fi connectivity
  checkWiFiHealth();

  // -------------------------------------------------------------
  // Task 1: Flow Sensor Velocity Calculation (Every 1 Second)
  // -------------------------------------------------------------
  if (now - lastFlowCalcTime >= FLOW_CALC_INTERVAL_MS) {
    unsigned long elapsedMs = now - lastFlowCalcTime;
    lastFlowCalcTime = now;

    // Atomically copy & reset pulse count
    noInterrupts();
    unsigned long currentPulses = pulseCount;
    pulseCount = 0;
    interrupts();

    // Pulses in this 1-second interval
    float pulseFrequencyHz = (float)currentPulses / (elapsedMs / 1000.0f);

    // Flow rate (L/min) = Frequency / 7.5
    currentFlowRateLpm = pulseFrequencyHz / CALIBRATION_FACTOR;

    // Litres consumed in this interval
    float litresDelta = (float)currentPulses / PULSES_PER_LITRE;
    totalLitresConsumed += litresDelta;

    // If flow is active, output to Serial
    if (currentFlowRateLpm > 0.05f) {
      Serial.printf("[flow] Velocity: %.2f L/min | Interval Pulses: %lu | Total: %.3f L\n",
                    currentFlowRateLpm, currentPulses, totalLitresConsumed);
    }

    updateLcdDisplay();
  }

  // -------------------------------------------------------------
  // Task 2: Upload Live Telemetry Reading (Every 30 Seconds)
  // -------------------------------------------------------------
  if (now - lastUploadTime >= READING_UPLOAD_INTERVAL_MS) {
    lastUploadTime = now;

    int rssi = (WiFi.status() == WL_CONNECTED) ? WiFi.RSSI() : -100;
    int battery = 100; // 100% on mains power, or analogRead(ADC_PIN) / battery formula

    if (!uploadReading(currentFlowRateLpm, totalLitresConsumed, battery, rssi)) {
      bufferCurrentReading(currentFlowRateLpm, totalLitresConsumed);
    } else {
      flushOfflineBuffer(battery, rssi);
    }

    persistTotalToFlash();
  }

  // -------------------------------------------------------------
  // Task 3: Remote Valve / Device Command Polling (Every 5 Seconds)
  // -------------------------------------------------------------
  if (now - lastCommandPollTime >= COMMAND_POLL_INTERVAL_MS) {
    lastCommandPollTime = now;
    if (WiFi.status() == WL_CONNECTED) {
      checkRemoteCommands();
    }
  }

  // -------------------------------------------------------------
  // Task 4: System Health Heartbeat (Every 60 Seconds)
  // -------------------------------------------------------------
  if (now - lastHeartbeatTime >= HEARTBEAT_INTERVAL_MS) {
    lastHeartbeatTime = now;
    if (WiFi.status() == WL_CONNECTED) {
      sendHeartbeat(100, WiFi.RSSI());
    }
  }
}
