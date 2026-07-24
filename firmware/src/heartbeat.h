#pragma once

namespace Heartbeat {

// Reads device health (battery, Wi-Fi signal, firmware version) and
// reports it via ApiClient::sendHeartbeat (spec section 49).
bool send();

// 0-100 estimate. Wire an actual battery voltage divider to an ADC pin for
// a real reading; without one, this reports 100 (mains/USB powered).
int readBatteryPercent();

} // namespace Heartbeat
