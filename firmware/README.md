# SafeWater ESP32 firmware

PlatformIO project implementing the firmware architecture from the master
spec (sections 40-54): boots, reads the flow sensor, syncs to the cloud
over the `esp32-ingest` Supabase Edge Function, executes remote valve
commands, and shows status on an I2C LCD.

## Hardware

| Signal            | Default pin |
| ------------------ | ----------- |
| Flow sensor pulse   | GPIO 27     |
| Valve relay         | GPIO 26     |
| LCD I2C SDA         | GPIO 21     |
| LCD I2C SCL         | GPIO 22     |

Adjust in `src/config.h` if your wiring differs. The flow sensor
calibration constant `PULSES_PER_LITRE` (default 450, matching a YF-S201)
should be re-measured against a known volume for your specific sensor.

## Provisioning a device

1. In the admin dashboard, register the meter (or use an existing one) at
   **Smart Meters**, then open it for editing to see its **Device API key**.
2. Copy `WIFI_SSID`, `WIFI_PASSWORD`, `METER_SERIAL`, and `DEVICE_API_KEY`
   into `src/config.h`.
3. `pio run --target upload` to flash.

Regenerating the key from the dashboard immediately invalidates the old
one - update `config.h` and reflash if you do this on a live device.

## Backend contract

All device traffic goes through one Edge Function
(`supabase/functions/esp32-ingest`), authenticated per-request with
`meter_serial` + `device_api_key` rather than a Supabase Auth session
(there is no user login concept for hardware). See that function's source
for the exact request/response shape of each action: `reading`,
`heartbeat`, `get_commands`, `ack_command`.

## Known gaps

- **OTA updates** (`ota_update.cpp`): structured but not wired up - there's
  no firmware version-check endpoint or Storage bucket serving builds yet.
  `ValveController::execute("UPDATE")` currently logs and no-ops.
- **TLS**: `WiFiClientSecure::setInsecure()` skips certificate validation
  for simplicity. Pin the Supabase root CA before deploying real hardware.
- **Battery reading**: `Heartbeat::readBatteryPercent()` always returns
  100 - wire a voltage divider to an ADC pin for real battery-powered
  deployments.
- Not hardware-tested (no physical ESP32/sensor available in this
  environment) - verified with `pio run` against the `esp32dev` target:
  builds clean, RAM 17% (55.7KB/320KB), Flash 73% (961KB/1.31MB). Also
  verified the backend contract directly against the deployed Edge
  Function (reading upload, heartbeat, command polling/ack, and API-key
  rejection all round-tripped correctly).
