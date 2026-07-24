#pragma once

namespace FlowSensor {

// Attaches the pulse-counting interrupt. Call once from setup().
void begin();

// Recomputes flow_rate from pulses counted since the last call. Call this
// roughly once per second from loop() for a stable L/min reading.
void update();

// Litres per minute, based on the most recent update() window.
float getFlowRateLpm();

// Cumulative litres counted since boot (spec section 45: pulses -> litres).
float getTotalLitres();

} // namespace FlowSensor
