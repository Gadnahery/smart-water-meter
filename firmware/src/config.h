#pragma once

// Wi-Fi credentials + device identity live in secrets.h, which is
// gitignored so real Wi-Fi passwords and API keys never reach the
// (public) repo. Copy secrets.example.h to secrets.h and fill it in.
#include "secrets.h"

// ---------- Backend ----------
// Supabase Edge Function that authenticates this device and writes to the
// database on its behalf (see supabase/functions/esp32-ingest).
#define API_BASE_URL "https://ueeskinlxggnxqnymiqg.supabase.co/functions/v1/esp32-ingest"

// ---------- GPIO pins ----------
// Matches Kelvin's built hardware - flow sensor + LCD + 2 status LEDs,
// no relay/valve:
//   Flow sensor -> GPIO 35 (input-only pin, see flow_sensor.cpp note)
//   Red LED     -> GPIO 32 (on = Wi-Fi offline / attention needed)
//   Blue LED    -> GPIO 33 (on = Wi-Fi connected, blinks while connecting)
//   LCD 16x2 I2C -> SDA GPIO 21, SCL GPIO 22
#define FLOW_SENSOR_PIN 35
#define RED_LED_PIN 32
#define BLUE_LED_PIN 33
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
#define WIFI_BLINK_INTERVAL_MS 400UL         // blue LED blink rate while connecting

// ---------- Offline buffering ----------
#define MAX_BUFFERED_READINGS 1000 // spec section 52
