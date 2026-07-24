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
  pinMode(FLOW_SENSOR_PIN, INPUT_PULLUP);
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
