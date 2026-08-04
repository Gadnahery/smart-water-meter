#include <Arduino.h>
#include <WiFi.h>
#include <time.h>
#include "config.h"
#include "wifi_manager.h"
#include "api_client.h"
#include "flow_sensor.h"
#include "lcd_display.h"
#include "status_leds.h"
#include "heartbeat.h"
#include "utilities.h"

namespace {
struct BufferedReading {
  float flowRate;
  float waterUsageLitres;
};

BufferedReading readingBuffer[MAX_BUFFERED_READINGS];
int bufferedCount = 0;

void bufferReading(float flowRate, float waterUsageLitres) {
  if (bufferedCount >= MAX_BUFFERED_READINGS) {
    memmove(&readingBuffer[0], &readingBuffer[1], sizeof(BufferedReading) * (MAX_BUFFERED_READINGS - 1));
    bufferedCount--;
  }
  readingBuffer[bufferedCount++] = {flowRate, waterUsageLitres};
}

void flushBufferedReadings(int batteryPct, int wifiSignal) {
  int i = 0;
  while (i < bufferedCount) {
    if (!ApiClient::uploadReading(readingBuffer[i].flowRate, readingBuffer[i].waterUsageLitres, batteryPct, wifiSignal)) {
      break;
    }
    i++;
  }
  if (i > 0) {
    memmove(&readingBuffer[0], &readingBuffer[i], sizeof(BufferedReading) * (bufferedCount - i));
    bufferedCount -= i;
  }
}

unsigned long lastFlowUpdateAt = 0;
unsigned long lastHeartbeatAt = 0;
unsigned long lastReadingUploadAt = 0;
float lastUploadedTotalLitres = 0.0f;

void sendReadingIfDue() {
  float totalLitres = FlowSensor::getTotalLitres();
  float deltaSinceLastUpload = totalLitres - lastUploadedTotalLitres;

  bool dueByThreshold = deltaSinceLastUpload >= UPLOAD_THRESHOLD_LITRES;
  bool dueByTime = (millis() - lastReadingUploadAt) >= UPLOAD_INTERVAL_MS;

  if (!dueByThreshold && !dueByTime) return;

  int battery = Heartbeat::readBatteryPercent();
  int rssi = WiFi.RSSI();
  float flowRate = FlowSensor::getFlowRateLpm();

  if (!ApiClient::uploadReading(flowRate, totalLitres, battery, rssi)) {
    Utilities::logLine("Reading upload failed - buffering for retry");
    ApiClient::sendLog("WARNING", "Reading upload failed, buffering for retry");
    bufferReading(flowRate, totalLitres);
    return;
  }

  lastUploadedTotalLitres = totalLitres;
  lastReadingUploadAt = millis();
  flushBufferedReadings(battery, rssi);
  FlowSensor::persist();
}

} // namespace

void setup() {
  Serial.begin(115200);
  delay(200);
  Serial.println("\n[boot] SafeWater firmware " + String(Utilities::FIRMWARE_VERSION));

  LcdDisplay::begin();
  StatusLeds::begin();
  FlowSensor::begin();

  WifiManager::begin();
  configTime(0, 0, "pool.ntp.org", "time.nist.gov");

  Utilities::logLine("Sensor reading started");
  Utilities::logLine("Beginning cloud synchronization");

  Heartbeat::send();
  ApiClient::sendLog("INFO", "Device booted, firmware " + String(Utilities::FIRMWARE_VERSION));
}

void loop() {
  WifiManager::poll();

  unsigned long now = millis();

  if (now - lastFlowUpdateAt >= 1000UL) {
    lastFlowUpdateAt = now;
    FlowSensor::update();
    float flowRate = FlowSensor::getFlowRateLpm();
    LcdDisplay::showFlowRate(flowRate);
    Serial.printf("[flow] %.2f L/min (total %.2f L)\n", flowRate, FlowSensor::getTotalLitres());
  }

  if (now - lastHeartbeatAt >= HEARTBEAT_INTERVAL_MS) {
    lastHeartbeatAt = now;
    Heartbeat::send();
  }

  sendReadingIfDue();
}
