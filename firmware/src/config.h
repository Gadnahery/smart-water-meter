#pragma once

// ---------- Wi-Fi ----------
#define WIFI_SSID "YOUR_WIFI_SSID"
#define WIFI_PASSWORD "YOUR_WIFI_PASSWORD"

// ---------- Device identity ----------
// meter_serial + DEVICE_API_KEY must match a smart_meters row in Supabase.
// Get both from the admin dashboard: Smart Meters -> edit meter -> Device
// API key (regenerate there any time; update this file to match).
#define DEVICE_ID "ESP32-001"
#define METER_SERIAL "WM-00001"
#define DEVICE_API_KEY "REPLACE_WITH_DEVICE_API_KEY_FROM_ADMIN_DASHBOARD"

// ---------- Backend ----------
// Supabase Edge Function that authenticates this device and writes to the
// database on its behalf (see supabase/functions/esp32-ingest).
#define API_BASE_URL "https://ueeskinlxggnxqnymiqg.supabase.co/functions/v1/esp32-ingest"

// ---------- GPIO pins ----------
#define FLOW_SENSOR_PIN 27
#define VALVE_RELAY_PIN 26
#define LCD_SDA_PIN 21
#define LCD_SCL_PIN 22
#define LCD_I2C_ADDRESS 0x27
#define LCD_COLUMNS 16
#define LCD_ROWS 2

// ---------- Flow sensor calibration ----------
// Pulses per litre for the specific flow sensor model in use (e.g. a
// YF-S201 is ~450 pulses/L; recalibrate against a known volume).
#define PULSES_PER_LITRE 450.0f

// ---------- Timing (milliseconds) ----------
#define READING_UPLOAD_INTERVAL_MS 60000UL   // spec section 47: default 60s
#define HEARTBEAT_INTERVAL_MS 60000UL        // spec section 49
#define COMMAND_POLL_INTERVAL_MS 5000UL      // spec section 47: realtime commands ~5s
#define WIFI_RETRY_INTERVAL_MS 5000UL        // spec section 42
#define LCD_SCREEN_CYCLE_MS 4000UL           // spec section 46: alternate screens

// ---------- Offline buffering ----------
#define MAX_BUFFERED_READINGS 1000 // spec section 52
