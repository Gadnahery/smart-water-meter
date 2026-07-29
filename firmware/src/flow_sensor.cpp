#include "flow_sensor.h"
#include <Arduino.h>
#include "config.h"

namespace {

volatile unsigned long pulseCount = 0;
unsigned long lastPulseCountAtUpdate = 0;
unsigned long lastUpdateAtMs = 0;

float flowRateLpm = 0.0f;
float totalLitres = 0.0f;

void IRAM_ATTR onPulse() {
  pulseCount++;
}

} // namespace

namespace FlowSensor {

void begin() {
  // GPIO 34-39 (including FLOW_SENSOR_PIN=35 on Kelvin's board) are
  // input-only on the ESP32 and have no internal pull-up/pull-down -
  // INPUT_PULLUP would silently do nothing here. Most Hall-effect flow
  // sensors (YF-S201 etc.) already pull their own signal line up
  // internally; if the pulse count looks stuck at 0 or noisy, add a real
  // 10k pull-up resistor from this pin to 3.3V.
  pinMode(FLOW_SENSOR_PIN, INPUT);
  attachInterrupt(digitalPinToInterrupt(FLOW_SENSOR_PIN), onPulse, FALLING);
  lastUpdateAtMs = millis();
}

void update() {
  noInterrupts();
  unsigned long currentPulses = pulseCount;
  interrupts();

  unsigned long now = millis();
  unsigned long elapsedMs = now - lastUpdateAtMs;
  if (elapsedMs == 0) return;

  unsigned long newPulses = currentPulses - lastPulseCountAtUpdate;
  float litresSinceLastUpdate = newPulses / PULSES_PER_LITRE;

  // L/min = litres counted / (elapsed minutes)
  flowRateLpm = litresSinceLastUpdate / (elapsedMs / 60000.0f);
  totalLitres += litresSinceLastUpdate;

  lastPulseCountAtUpdate = currentPulses;
  lastUpdateAtMs = now;
}

float getFlowRateLpm() {
  return flowRateLpm;
}

float getTotalLitres() {
  return totalLitres;
}

} // namespace FlowSensor
