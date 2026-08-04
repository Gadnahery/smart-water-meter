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
  // Ignore noise from an unplugged / floating input. The real flow sensor should
  // drive this pin with a valid falling edge only when connected to the circuit.
  if (digitalRead(FLOW_SENSOR_PIN) != LOW) return;
  pulseCount++;
}
} // namespace

namespace FlowSensor {

void begin() {
  pinMode(FLOW_SENSOR_PIN, INPUT_PULLUP);
  pulseCount = 0;
  lastPulseCountAtUpdate = 0;
  lastUpdateAtMs = millis();
  flowRateLpm = 0.0f;
  totalLitres = 0.0f;
  lastPersistedTotal = 0.0f;

  prefs.begin("flowsensor", false);
  /*
    This device must not report litres while it is not physically connected to
    a flow sensor. The old code restored the last saved value from flash on boot,
    which made the dashboard show litres rising even when nothing was connected.
    Clear the stale value so we start clean and only count real pulses from a
    connected sensor.
  */
  prefs.remove("total");
  Serial.println("[flow] cleared persisted total; waiting for real sensor input");

  /*
    Do not attach the interrupt on a floating input while the board is disconnected.
    If you have a real flow sensor connected, attach it after the physical wiring is
    verified and the sensor is stable.
  */
  detachInterrupt(digitalPinToInterrupt(FLOW_SENSOR_PIN));
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
