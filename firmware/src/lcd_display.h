#pragma once

namespace LcdDisplay {

void begin();

// Two-line free-form message (used during boot/Wi-Fi connect).
void showMessage(const char *line1, const char *line2);

// Steady-state screen once boot finishes: static title on line 1 (drawn
// once, not redrawn every call) + the live flow rate on line 2.
void showFlowRate(float flowRateLpm);

} // namespace LcdDisplay
