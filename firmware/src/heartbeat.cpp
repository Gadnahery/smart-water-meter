#include "heartbeat.h"
#include <Arduino.h>
#include <WiFi.h>
#include "api_client.h"
#include "utilities.h"

namespace Heartbeat {

int readBatteryPercent() {
  return 100; // no battery ADC wired on the reference hardware; see header
}

bool send() {
  int battery = readBatteryPercent();
  int rssi = WiFi.RSSI();

  Serial.printf(
      "[heartbeat] battery=%d%% rssi=%ddBm heap=%uB\n",
      battery, rssi, ESP.getFreeHeap());

  return ApiClient::sendHeartbeat(battery, rssi, Utilities::FIRMWARE_VERSION);
}

} // namespace Heartbeat
