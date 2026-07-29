#pragma once

// Copy this file to secrets.h and fill in real values. secrets.h is
// gitignored - never commit real Wi-Fi credentials or device API keys to
// a public repo.

#define WIFI_SSID "YOUR_WIFI_SSID"
#define WIFI_PASSWORD "YOUR_WIFI_PASSWORD"

// meter_serial + DEVICE_API_KEY must match a smart_meters row in Supabase.
// Get both from the admin dashboard: Smart Meters -> edit meter -> Device
// API key (regenerate there any time; update this file to match).
#define DEVICE_ID "ESP32-001"
#define METER_SERIAL "WM-00001"
#define DEVICE_API_KEY "REPLACE_WITH_DEVICE_API_KEY_FROM_ADMIN_DASHBOARD"
