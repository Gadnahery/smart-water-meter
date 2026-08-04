#include "utilities.h"
#include <Arduino.h>

namespace Utilities {

void logLine(const char *message) {
  Serial.printf("[%.1fs] %s\n", millis() / 1000.0f, message);
}

} // namespace Utilities
