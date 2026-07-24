#pragma once

#include <Arduino.h>

namespace ValveController {

void begin();

void open();
void close();
bool isOpen();

// Runs one of the spec-section-50 commands (OPEN/CLOSE/RESET/RESTART/
// CALIBRATE/UPDATE). Returns the status string to report back via
// ApiClient::acknowledgeCommand ("executed" or "failed").
const char *execute(const String &command);

} // namespace ValveController
