# SafeWater ESP32 firmware

PlatformIO project implementing the firmware architecture from the master
spec (sections 40-54): boots, reads the flow sensor, syncs to the cloud
over the `esp32-ingest` Supabase Edge Function, executes remote valve
commands, and shows status on an I2C LCD plus two status LEDs.

## Hardware

Current pinout (Kelvin's build, first physically flashed/verified device):

| Signal            | Pin     | Notes                                   |
| ------------------ | ------- | ---------------------------------------- |
| Flow sensor pulse   | GPIO 35 | Input-only pin - no internal pull-up, see `flow_sensor.cpp` |
| Valve relay         | GPIO 4  |                                          |
| Red LED             | GPIO 32 | On = valve closed                       |
| Blue LED            | GPIO 33 | On = Wi-Fi connected, blinks while connecting |
| LCD I2C SDA         | GPIO 21 |                                          |
| LCD I2C SCL         | GPIO 22 |                                          |

Adjust in `src/config.h` if a different board's wiring differs. The flow
sensor calibration constant `PULSES_PER_LITRE` (default 450, matching a
YF-S201) should be re-measured against a known volume for your specific
sensor.

## Provisioning a device

1. In the admin dashboard, register the meter (or use an existing one) at
   **Smart Meters**, then open it for editing to see its **Device API key**.
2. `cp src/secrets.example.h src/secrets.h`, then fill in `WIFI_SSID`,
   `WIFI_PASSWORD`, `METER_SERIAL`, and `DEVICE_API_KEY`. `secrets.h` is
   gitignored - it holds real credentials and must never be committed.
3. `pio run --target upload` to flash.

Regenerating the key from the dashboard immediately invalidates the old
one - update `secrets.h` and reflash if you do this on a live device.

## Backend contract

All device traffic goes through one Edge Function
(`supabase/functions/esp32-ingest`), authenticated per-request with
`meter_serial` + `device_api_key` rather than a Supabase Auth session
(there is no user login concept for hardware). See that function's source
for the exact request/response shape of each action: `reading`,
`heartbeat`, `get_commands`, `ack_command`, `log`.

## Known gaps

- **OTA updates** (`ota_update.cpp`): structured but not wired up - there's
  no firmware version-check endpoint or Storage bucket serving builds yet.
  `ValveController::execute("UPDATE")` currently logs and no-ops.
- **TLS**: `WiFiClientSecure::setInsecure()` skips certificate validation
  for simplicity. Pin the Supabase root CA before deploying real hardware.
- **Battery reading**: `Heartbeat::readBatteryPercent()` always returns
  100 - wire a voltage divider to an ADC pin for real battery-powered
  deployments.

## Verified on real hardware (2026-07-29)

Flashed to a physical ESP32 (Kelvin's board, Silicon Labs CP2102 USB-UART
adapter) over real Wi-Fi, not just compiled:
- Boots, connects to Wi-Fi, meter shows `online` in the dashboard with
  live battery/signal/last_seen
- Boot + Wi-Fi-connected log lines land in `device_logs`
- Remote valve OPEN/CLOSE commands issued from the live admin dashboard
  were received and executed by the device within one poll cycle
