#pragma once

#include "secrets.h"

#define API_BASE_URL "https://ueeskinlxggnxqnymiqg.supabase.co/functions/v1/esp32-ingest"

#define FLOW_SENSOR_PIN 35
#define RED_LED_PIN 32
#define BLUE_LED_PIN 33
#define LCD_SDA_PIN 21
#define LCD_SCL_PIN 22
#define LCD_I2C_ADDRESS 0x27
#define LCD_COLUMNS 16
#define LCD_ROWS 2

#define PULSES_PER_LITRE 450.0f

#define WIFI_RETRY_INTERVAL_MS 5000UL
#define WIFI_BLINK_INTERVAL_MS 400UL
#define HEARTBEAT_INTERVAL_MS 60000UL
#define COMMAND_POLL_INTERVAL_MS 5000UL

#define UPLOAD_INTERVAL_MS 15000UL
#define UPLOAD_THRESHOLD_LITRES 1.0f
#define MAX_BUFFERED_READINGS 1000
