#pragma once

namespace FlowSensor {

// Attaches the pulse-counting interrupt. Call once from setup().
void begin();

// Recomputes flow_rate from pulses counted since the last call. Call this
// roughly once per second from loop() for a stable L/min reading.
void update();

// Litres per minute, based on the most recent update() window.
float getFlowRateLpm();

// Cumulative litres counted, persisted across reboots (spec section 45:
// pulses -> litres) - a restart resumes adding from here, it never resets
// back to 0.
float getTotalLitres();

// Writes the running total to flash (NVS). Call periodically from loop()
// (e.g. every 60s) rather than every update() - each write costs real
// flash-wear budget, so don't call it every second.
void persist();

} // namespace FlowSensor
