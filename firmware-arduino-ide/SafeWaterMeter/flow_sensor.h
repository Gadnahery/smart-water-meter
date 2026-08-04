#pragma once

namespace FlowSensor {
void begin();
void update();
float getFlowRateLpm();
float getTotalLitres();
void persist();
} // namespace FlowSensor
