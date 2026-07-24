#pragma once

namespace Utilities {

constexpr const char *FIRMWARE_VERSION = "1.0.0";

constexpr float litresToCubicMetres(float litres) {
  return litres / 1000.0f;
}

// Prefixes a Serial log line with seconds-since-boot, e.g. "[12.4s] ...".
void logLine(const char *message);

} // namespace Utilities
