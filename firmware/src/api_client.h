#pragma once

#include <Arduino.h>
#include <ArduinoJson.h>

namespace ApiClient {

struct ValveCommand {
  String id;
  String command;
};

// spec section 48: upload a meter reading.
bool uploadReading(float flowRate, float waterUsageLitres, int batteryPct, int wifiSignalDbm);

// spec section 49: device health heartbeat.
bool sendHeartbeat(int batteryPct, int wifiSignalDbm, const char *firmwareVersion);

// spec section 50: poll for pending valve commands. Returns the number of
// commands written into `out` (max `maxCommands`).
int getPendingCommands(ValveCommand *out, int maxCommands);

// Acknowledge a command as executed/failed after acting on it.
bool acknowledgeCommand(const String &commandId, const char *status);

} // namespace ApiClient
