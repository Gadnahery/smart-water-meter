#include "valve_controller.h"
#include "config.h"
#include "ota_update.h"
#include "api_client.h"

namespace {
bool valveOpen = false;
}

namespace ValveController {

void begin() {
  pinMode(VALVE_RELAY_PIN, OUTPUT);
  open(); // fail-open by default so a freshly installed meter doesn't cut supply
}

void open() {
  digitalWrite(VALVE_RELAY_PIN, HIGH);
  valveOpen = true;
  Serial.println("[valve] opened");
}

void close() {
  digitalWrite(VALVE_RELAY_PIN, LOW);
  valveOpen = false;
  Serial.println("[valve] closed");
}

bool isOpen() {
  return valveOpen;
}

const char *execute(const String &command) {
  if (command == "OPEN") {
    open();
    ApiClient::sendLog("INFO", "Valve opened by remote command");
    return "executed";
  }
  if (command == "CLOSE") {
    close();
    ApiClient::sendLog("WARNING", "Valve closed by remote command");
    return "executed";
  }
  if (command == "RESET") {
    open();
    Serial.println("[valve] reset to default (open) state");
    ApiClient::sendLog("INFO", "Valve reset to default (open) state");
    return "executed";
  }
  if (command == "RESTART") {
    Serial.println("[valve] restarting device...");
    ApiClient::sendLog("WARNING", "Device restarting by remote command");
    delay(200); // let the log/ack requests finish flushing before reboot
    ESP.restart();
    return "executed"; // unreachable, kept for clarity
  }
  if (command == "CALIBRATE") {
    // Real calibration needs a known reference volume run through the
    // meter; this just logs the request for a technician to action.
    Serial.println("[valve] calibration requested - needs a technician on site");
    ApiClient::sendLog("INFO", "Calibration requested - needs a technician on site");
    return "executed";
  }
  if (command == "UPDATE") {
    bool ok = OtaUpdate::checkAndApply();
    ApiClient::sendLog(ok ? "INFO" : "ERROR", ok ? "Firmware update applied" : "Firmware update check failed");
    return ok ? "executed" : "failed";
  }

  Serial.printf("[valve] unknown command: %s\n", command.c_str());
  ApiClient::sendLog("ERROR", "Unknown valve command received: " + command);
  return "failed";
}

} // namespace ValveController
