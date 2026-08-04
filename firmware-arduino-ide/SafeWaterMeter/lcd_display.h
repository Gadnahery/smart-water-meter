#pragma once

namespace LcdDisplay {
void begin();
void showMessage(const char *line1, const char *line2);
void showFlowRate(float flowRateLpm);
} // namespace LcdDisplay
