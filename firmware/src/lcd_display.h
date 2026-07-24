#pragma once

namespace LcdDisplay {

void begin();

// Two-line free-form message (used during boot/Wi-Fi connect).
void showMessage(const char *line1, const char *line2);

// spec section 46 home screen: company name/status + today's usage.
void showHomeScreen(bool online, float todayUsageM3);

// spec section 46 alternate screens, cycled by the caller on a timer.
void showWifiScreen(const char *ipAddress, int rssi);
void showMeterScreen(const char *meterSerial, bool valveOpen);
void showSyncScreen(unsigned long secondsSinceLastSync);

} // namespace LcdDisplay
