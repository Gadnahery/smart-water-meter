#pragma once

// Kelvin's hardware has no LCD - status is shown on two LEDs instead
// (see config.h for pins).

namespace StatusLeds {

void begin();

// Blue LED: solid on once Wi-Fi is connected, off otherwise.
void setWifiConnected(bool connected);

// Blue LED blink toggle, used by WifiManager while a connection attempt
// is in progress (called on a timer, not every loop iteration).
void toggleWifiBlink();

// Red LED: on when the valve is closed (water off), off when open.
void setValveClosed(bool closed);

} // namespace StatusLeds
