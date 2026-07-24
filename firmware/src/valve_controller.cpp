#include "valve_controller.h"
#include "config.h"
#include "ota_update.h"

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
    return "executed";
  }
  if (command == "CLOSE") {
    close();
    return "executed";
  }
  if (command == "RESET") {
    open();
    Serial.println("[valve] reset to default (open) state");
    return "executed";
  }
  if (command == "RESTART") {
    Serial.println("[valve] restarting device...");
    delay(200); // let the ack request finish flushing before reboot
    ESP.restart();
    return "executed"; // unreachable, kept for clarity
  }
  if (command == "CALIBRATE") {
    // Real calibration needs a known reference volume run through the
    // meter; this just logs the request for a technician to action.
    Serial.println("[valve] calibration requested - needs a technician on site");
    return "executed";
  }
  if (command == "UPDATE") {
    return OtaUpdate::checkAndApply() ? "executed" : "failed";
  }

  Serial.printf("[valve] unknown command: %s\n", command.c_str());
  return "failed";
}

} // namespace ValveController
