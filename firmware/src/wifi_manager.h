#pragma once

#include <Arduino.h>

namespace WifiManager {

// Starts the connection attempt. Blocks with retries (spec section 42:
// unlimited retries every WIFI_RETRY_INTERVAL_MS) until connected.
void begin();

// Call every loop() iteration; reconnects automatically if the link drops.
void poll();

bool isConnected();

} // namespace WifiManager
