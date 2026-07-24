#include "ota_update.h"
#include <Arduino.h>

namespace OtaUpdate {

bool checkAndApply() {
  // TODO: once a firmware-version endpoint + Supabase Storage bucket exist,
  // implement with HTTPUpdate (see ESP32 HTTPUpdate.h):
  //   1. GET the latest version string + firmware.bin URL
  //   2. Compare against the version baked into this build
  //   3. If newer, httpUpdate.update(client, firmwareUrl) and let it reboot
  Serial.println("[ota] update check skipped - no update endpoint configured yet");
  return false;
}

} // namespace OtaUpdate
