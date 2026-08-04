#pragma once

#include <Arduino.h>
#include <ArduinoJson.h>

namespace ApiClient {

struct ValveCommand {
  String id;
  String command;
};

bool uploadReading(float flowRate, float waterUsageLitres, int batteryPct, int wifiSignalDbm);
bool sendHeartbeat(int batteryPct, int wifiSignalDbm, const char *firmwareVersion);
int getPendingCommands(ValveCommand *out, int maxCommands);
bool acknowledgeCommand(const String &commandId, const char *status);
bool sendLog(const char *level, const String &message);

} // namespace ApiClient
