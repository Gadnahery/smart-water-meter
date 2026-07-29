#include "status_leds.h"
#include <Arduino.h>
#include "config.h"

namespace {
bool blueState = false;
}

namespace StatusLeds {

void begin() {
  pinMode(RED_LED_PIN, OUTPUT);
  pinMode(BLUE_LED_PIN, OUTPUT);
  digitalWrite(RED_LED_PIN, LOW);
  digitalWrite(BLUE_LED_PIN, LOW);
}

void setWifiConnected(bool connected) {
  blueState = connected;
  digitalWrite(BLUE_LED_PIN, connected ? HIGH : LOW);
}

void toggleWifiBlink() {
  blueState = !blueState;
  digitalWrite(BLUE_LED_PIN, blueState ? HIGH : LOW);
}

void setValveClosed(bool closed) {
  digitalWrite(RED_LED_PIN, closed ? HIGH : LOW);
}

} // namespace StatusLeds
