#include "lcd_display.h"
#include <Wire.h>
#include <LiquidCrystal_I2C.h>
#include "config.h"

namespace {
LiquidCrystal_I2C lcd(LCD_I2C_ADDRESS, LCD_COLUMNS, LCD_ROWS);

void printLines(const char *line1, const char *line2) {
  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print(line1);
  lcd.setCursor(0, 1);
  lcd.print(line2);
}
} // namespace

namespace LcdDisplay {

void begin() {
  Wire.begin(LCD_SDA_PIN, LCD_SCL_PIN);
  lcd.init();
  lcd.backlight();
  printLines("SafeWater", "Starting...");
}

void showMessage(const char *line1, const char *line2) {
  printLines(line1, line2);
}

void showHomeScreen(bool online, float todayUsageM3) {
  char line2[17];
  snprintf(line2, sizeof(line2), "%.1fm3  %s", todayUsageM3, online ? "Online" : "Offline");
  printLines("SafeWater", line2);
}

void showWifiScreen(const char *ipAddress, int rssi) {
  char line2[17];
  snprintf(line2, sizeof(line2), "%s %ddBm", ipAddress, rssi);
  printLines("Wi-Fi", line2);
}

void showMeterScreen(const char *meterSerial, bool valveOpen) {
  char line2[17];
  snprintf(line2, sizeof(line2), "Valve: %s", valveOpen ? "Open" : "Closed");
  printLines(meterSerial, line2);
}

void showSyncScreen(unsigned long secondsSinceLastSync) {
  char line2[17];
  snprintf(line2, sizeof(line2), "%lus ago", secondsSinceLastSync);
  printLines("Last sync", line2);
}

} // namespace LcdDisplay
