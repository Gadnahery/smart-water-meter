// SafeWater smart water meter firmware - main entry point.
// Implements the boot sequence and main loop from spec sections 41 and 44.

#include <Arduino.h>
#include <WiFi.h>
#include <time.h>
#include "config.h"
#include "wifi_manager.h"
#include "api_client.h"
#include "flow_sensor.h"
#include "ota_update.h"
#include "lcd_display.h"
#include "status_leds.h"
#include "heartbeat.h"
#include "utilities.h"

namespace {

// ---------- offline reading buffer (spec section 52) ----------
struct BufferedReading {
  float flowRate;
  float waterUsageLitres;
};

BufferedReading readingBuffer[MAX_BUFFERED_READINGS];
int bufferedCount = 0;

void bufferReading(float flowRate, float waterUsageLitres) {
  if (bufferedCount >= MAX_BUFFERED_READINGS) {
    // Buffer full: drop the oldest reading to make room for the newest.
    memmove(&readingBuffer[0], &readingBuffer[1], sizeof(BufferedReading) * (MAX_BUFFERED_READINGS - 1));
    bufferedCount--;
  }
  readingBuffer[bufferedCount++] = {flowRate, waterUsageLitres};
}

void flushBufferedReadings(int batteryPct, int wifiSignal) {
  int i = 0;
  while (i < bufferedCount) {
    if (!ApiClient::uploadReading(readingBuffer[i].flowRate, readingBuffer[i].waterUsageLitres, batteryPct, wifiSignal)) {
      break; // still offline or server error - stop and retry next cycle
    }
    i++;
  }
  if (i > 0) {
    memmove(&readingBuffer[0], &readingBuffer[i], sizeof(BufferedReading) * (bufferedCount - i));
    bufferedCount -= i;
  }
}

// ---------- periodic task timers ----------
unsigned long lastReadingUploadAt = 0;
unsigned long lastHeartbeatAt = 0;
unsigned long lastCommandPollAt = 0;
unsigned long lastFlowUpdateAt = 0;
unsigned long lastSyncAt = 0;

// This hardware has no relay/valve - OPEN/CLOSE/RESET are meaningless
// here and just get acknowledged as failed. RESTART/CALIBRATE/UPDATE are
// device-level operations that still apply to a flow-sensor-only meter.
const char *executeCommand(const String &command) {
  if (command == "RESTART") {
    Serial.println("[device] restarting by remote command...");
    FlowSensor::persist(); // don't lose accumulated flow to the reboot
    ApiClient::sendLog("WARNING", "Device restarting by remote command");
    delay(200); // let the log/ack requests finish flushing before reboot
    ESP.restart();
    return "executed"; // unreachable, kept for clarity
  }
  if (command == "CALIBRATE") {
    // Real calibration needs a known reference volume run through the
    // meter; this just logs the request for a technician to action.
    Serial.println("[device] calibration requested - needs a technician on site");
    ApiClient::sendLog("INFO", "Calibration requested - needs a technician on site");
    return "executed";
  }
  if (command == "UPDATE") {
    bool ok = OtaUpdate::checkAndApply();
    ApiClient::sendLog(ok ? "INFO" : "ERROR", ok ? "Firmware update applied" : "Firmware update check failed");
    return ok ? "executed" : "failed";
  }

  Serial.printf("[device] command not supported on this hardware (no valve): %s\n", command.c_str());
  ApiClient::sendLog("ERROR", "Command not supported - no valve hardware: " + command);
  return "failed";
}

void pollAndExecuteCommands() {
  ApiClient::ValveCommand commands[4];
  int count = ApiClient::getPendingCommands(commands, 4);

  for (int i = 0; i < count; i++) {
    Utilities::logLine(("Executing command: " + commands[i].command).c_str());
    const char *result = executeCommand(commands[i].command);
    ApiClient::acknowledgeCommand(commands[i].id, result);
  }
}

} // namespace

void setup() {
  Serial.begin(115200);
  delay(200);
  Serial.println("\n[boot] SafeWater firmware " + String(Utilities::FIRMWARE_VERSION));

  LcdDisplay::begin();
  StatusLeds::begin();
  FlowSensor::begin();

  WifiManager::begin(); // blocks with retries until connected (spec 42)

  configTime(0, 0, "pool.ntp.org", "time.nist.gov"); // sync time (spec 41 step 8)

  Utilities::logLine("Sensor reading started");
  Utilities::logLine("Beginning cloud synchronization");

  Heartbeat::send();
  ApiClient::sendLog("INFO", "Device booted, firmware " + String(Utilities::FIRMWARE_VERSION));
  lastSyncAt = millis();
}

void loop() {
  WifiManager::poll();

  unsigned long now = millis();

  if (now - lastFlowUpdateAt >= 1000) {
    lastFlowUpdateAt = now;
    FlowSensor::update();
    float flowRate = FlowSensor::getFlowRateLpm();
    LcdDisplay::showFlowRate(flowRate);
    Serial.printf("[flow] %.2f L/min (total %.2f L)\n", flowRate, FlowSensor::getTotalLitres());
  }

  if (now - lastReadingUploadAt >= READING_UPLOAD_INTERVAL_MS) {
    lastReadingUploadAt = now;

    int battery = Heartbeat::readBatteryPercent();
    int rssi = WiFi.RSSI();
    float totalLitres = FlowSensor::getTotalLitres();

    if (!ApiClient::uploadReading(FlowSensor::getFlowRateLpm(), totalLitres, battery, rssi)) {
      Utilities::logLine("Reading upload failed - buffering for retry");
      ApiClient::sendLog("WARNING", "Reading upload failed, buffering for retry");
      bufferReading(FlowSensor::getFlowRateLpm(), totalLitres);
    } else {
      lastSyncAt = now;
      flushBufferedReadings(battery, rssi);
    }

    FlowSensor::persist(); // save the running total to flash on the same cadence
  }

  if (now - lastHeartbeatAt >= HEARTBEAT_INTERVAL_MS) {
    lastHeartbeatAt = now;
    if (Heartbeat::send()) lastSyncAt = now;
  }

  if (now - lastCommandPollAt >= COMMAND_POLL_INTERVAL_MS) {
    lastCommandPollAt = now;
    pollAndExecuteCommands();
  }
}
