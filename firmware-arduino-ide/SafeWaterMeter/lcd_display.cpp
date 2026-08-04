#include "lcd_display.h"
#include <Wire.h>
#include <LiquidCrystal_I2C.h>
#include <string.h>
#include "config.h"

namespace {
LiquidCrystal_I2C lcd(LCD_I2C_ADDRESS, LCD_COLUMNS, LCD_ROWS);
bool titleDrawn = false;

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
  titleDrawn = false;
}

void showFlowRate(float flowRateLpm) {
  if (!titleDrawn) {
    lcd.clear();
    lcd.setCursor(0, 0);
    lcd.print("Smart Water Mtr");
    titleDrawn = true;
  }

  char line2[17];
  snprintf(line2, sizeof(line2), "Flow: %.1f L/min", flowRateLpm);
  while (strlen(line2) < LCD_COLUMNS) strcat(line2, " ");

  lcd.setCursor(0, 1);
  lcd.print(line2);
}

} // namespace LcdDisplay
