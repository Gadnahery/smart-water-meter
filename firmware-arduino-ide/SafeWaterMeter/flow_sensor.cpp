#include "flow_sensor.h"
#include <Arduino.h>
#include <Preferences.h>
#include "config.h"

namespace {
volatile unsigned long pulseCount = 0;
unsigned long lastPulseCountAtUpdate = 0;
unsigned long lastUpdateAtMs = 0;
float flowRateLpm = 0.0f;
float totalLitres = 0.0f;
float lastPersistedTotal = 0.0f;
Preferences prefs;

void IRAM_ATTR onPulse() {
  pulseCount++;
}
} // namespace

namespace FlowSensor {

void begin() {
  pinMode(FLOW_SENSOR_PIN, INPUT);
  attachInterrupt(digitalPinToInterrupt(FLOW_SENSOR_PIN), onPulse, FALLING);
  lastUpdateAtMs = millis();

  prefs.begin("flowsensor", false);
  totalLitres = prefs.getFloat("total", 0.0f);
  lastPersistedTotal = totalLitres;
  Serial.printf("[flow] restored cumulative total from flash: %.2f L\n", totalLitres);
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

void persist() {
  if (totalLitres == lastPersistedTotal) return;
  prefs.putFloat("total", totalLitres);
  lastPersistedTotal = totalLitres;
}

} // namespace FlowSensor
