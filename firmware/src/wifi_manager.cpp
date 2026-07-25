#include "wifi_manager.h"
#include <WiFi.h>
#include "config.h"
#include "lcd_display.h"
#include "api_client.h"

namespace {
unsigned long lastRetryAt = 0;
bool wasConnected = false;
}

namespace WifiManager {

void begin() {
  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

  LcdDisplay::showMessage("Connecting...", "Wi-Fi");

  while (WiFi.status() != WL_CONNECTED) {
    delay(WIFI_RETRY_INTERVAL_MS);
    Serial.println("[wifi] retrying connection...");
    WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  }

  Serial.print("[wifi] connected, IP: ");
  Serial.println(WiFi.localIP());
  LcdDisplay::showMessage("Connected", WiFi.localIP().toString().c_str());
  ApiClient::sendLog("INFO", "Wi-Fi connected, IP " + WiFi.localIP().toString());
  wasConnected = true;
}

void poll() {
  if (WiFi.status() == WL_CONNECTED) {
    if (!wasConnected) {
      Serial.println("[wifi] reconnected");
      ApiClient::sendLog("WARNING", "Wi-Fi reconnected after a drop");
      wasConnected = true;
    }
    return;
  }

  if (wasConnected) {
    Serial.println("[wifi] connection lost");
    wasConnected = false;
  }

  unsigned long now = millis();
  if (now - lastRetryAt < WIFI_RETRY_INTERVAL_MS) return;
  lastRetryAt = now;

  Serial.println("[wifi] connection lost, retrying...");
  WiFi.disconnect();
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
}

bool isConnected() {
  return WiFi.status() == WL_CONNECTED;
}

} // namespace WifiManager
