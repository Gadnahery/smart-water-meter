#include "wifi_manager.h"
#include <WiFi.h>
#include "config.h"
#include "lcd_display.h"
#include "status_leds.h"
#include "api_client.h"

namespace {
unsigned long lastRetryAt = 0;
unsigned long lastBlinkAt = 0;
bool wasConnected = false;
}

namespace WifiManager {

void begin() {
  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

  LcdDisplay::showMessage("Connecting...", "Wi-Fi");

  while (WiFi.status() != WL_CONNECTED) {
    unsigned long waitStart = millis();
    while (millis() - waitStart < WIFI_RETRY_INTERVAL_MS) {
      StatusLeds::toggleWifiBlink();
      delay(WIFI_BLINK_INTERVAL_MS);
      if (WiFi.status() == WL_CONNECTED) break;
    }
    if (WiFi.status() == WL_CONNECTED) break;
    Serial.println("[wifi] retrying connection...");
    WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  }

  Serial.print("[wifi] connected, IP: ");
  Serial.println(WiFi.localIP());
  LcdDisplay::showMessage("Connected", WiFi.localIP().toString().c_str());
  StatusLeds::setWifiConnected(true);
  ApiClient::sendLog("INFO", "Wi-Fi connected, IP " + WiFi.localIP().toString());
  wasConnected = true;
}

void poll() {
  if (WiFi.status() == WL_CONNECTED) {
    if (!wasConnected) {
      Serial.println("[wifi] reconnected");
      StatusLeds::setWifiConnected(true);
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

  if (now - lastBlinkAt >= WIFI_BLINK_INTERVAL_MS) {
    lastBlinkAt = now;
    StatusLeds::toggleWifiBlink();
  }

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
