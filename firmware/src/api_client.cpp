#include "api_client.h"
#include <WiFi.h>
#include <HTTPClient.h>
#include <WiFiClientSecure.h>
#include "config.h"

namespace {

// Shared POST helper: builds { action, meter_serial, api_key, ...extra },
// sends it to the esp32-ingest Edge Function, and parses the JSON response.
// Returns true only on HTTP 2xx with a JSON body containing "success": true.
bool postAction(const char *action, JsonDocument &extra, JsonDocument &response) {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("[api] skipped - no Wi-Fi");
    return false;
  }

  JsonDocument body;
  body["action"] = action;
  body["meter_serial"] = METER_SERIAL;
  body["api_key"] = DEVICE_API_KEY;
  for (JsonPairConst kv : extra.as<JsonObjectConst>()) {
    body[kv.key()] = kv.value();
  }

  String payload;
  serializeJson(body, payload);

  WiFiClientSecure client;
  client.setInsecure(); // simplification: no cert pinning. Pin the Supabase
                        // root CA here before shipping to production.

  HTTPClient http;
  http.begin(client, API_BASE_URL);
  http.addHeader("Content-Type", "application/json");

  int statusCode = http.POST(payload);
  bool ok = false;

  if (statusCode > 0) {
    String responseBody = http.getString();
    DeserializationError err = deserializeJson(response, responseBody);
    ok = statusCode >= 200 && statusCode < 300 && !err && response["success"] == true;

    if (!ok) {
      Serial.printf("[api] %s failed, status=%d body=%s\n", action, statusCode, responseBody.c_str());
    }
  } else {
    Serial.printf("[api] %s request failed: %s\n", action, http.errorToString(statusCode).c_str());
  }

  http.end();
  return ok;
}

} // namespace

namespace ApiClient {

bool uploadReading(float flowRate, float waterUsageLitres, int batteryPct, int wifiSignalDbm) {
  JsonDocument extra;
  extra["flow_rate"] = flowRate;
  extra["water_usage"] = waterUsageLitres;
  extra["battery"] = batteryPct;
  extra["wifi_signal"] = wifiSignalDbm;
  extra["status"] = "online";

  JsonDocument response;
  return postAction("reading", extra, response);
}

bool sendHeartbeat(int batteryPct, int wifiSignalDbm, const char *firmwareVersion) {
  JsonDocument extra;
  extra["battery"] = batteryPct;
  extra["wifi_signal"] = wifiSignalDbm;
  extra["firmware_version"] = firmwareVersion;

  JsonDocument response;
  return postAction("heartbeat", extra, response);
}

int getPendingCommands(ValveCommand *out, int maxCommands) {
  JsonDocument extra;
  JsonDocument response;

  if (!postAction("get_commands", extra, response)) return 0;

  JsonArrayConst commands = response["commands"].as<JsonArrayConst>();
  int count = 0;
  for (JsonObjectConst cmd : commands) {
    if (count >= maxCommands) break;
    out[count].id = cmd["id"].as<String>();
    out[count].command = cmd["command"].as<String>();
    count++;
  }
  return count;
}

bool acknowledgeCommand(const String &commandId, const char *status) {
  JsonDocument extra;
  extra["command_id"] = commandId;
  extra["status"] = status;

  JsonDocument response;
  return postAction("ack_command", extra, response);
}

bool sendLog(const char *level, const String &message) {
  JsonDocument extra;
  extra["level"] = level;
  extra["message"] = message;

  JsonDocument response;
  return postAction("log", extra, response);
}

} // namespace ApiClient
