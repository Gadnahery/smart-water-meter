#pragma once

// Two status LEDs (see config.h for pins) alongside the 16x2 LCD.

namespace StatusLeds {

void begin();

// Blue LED: solid on once Wi-Fi is connected, off otherwise.
// Also drives the red LED to the opposite state (red = offline/attention
// needed), since there's no valve on this hardware for red to reflect.
void setWifiConnected(bool connected);

// Blue LED blink toggle, used by WifiManager while a connection attempt
// is in progress (called on a timer, not every loop iteration).
void toggleWifiBlink();

} // namespace StatusLeds
