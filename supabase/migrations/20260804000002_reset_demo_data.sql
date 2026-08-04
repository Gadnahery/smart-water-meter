-- One-off cleanup: wipe every bit of demo/seed data so the dashboards
-- start from a real, empty baseline and only ever show numbers that came
-- from an actual physical ESP32 upload.
--
-- Customers, profiles, smart_meters (registration + device_api_key), and
-- system_settings are left completely intact - only accumulated
-- readings/usage/alerts/bills/logs are cleared.
--
-- Safe to run more than once. Run this AFTER
-- 20260804000001_realtime_usage_and_billing.sql and BEFORE you start
-- testing with real hardware.

-- `payments` references `bills`, so the child table must be truncated
-- before the parent, or both must be cleared in one CASCADE statement.
truncate table public.payments, public.bills restart identity cascade;
truncate table public.monthly_usage, public.daily_usage, public.alerts, public.notifications, public.device_logs, public.valve_commands, public.meter_readings restart identity cascade;

-- Every meter goes back to a truthful "never heard from" state. It will
-- flip to online/populate battery+signal the moment a real device sends
-- its first heartbeat or reading again.
update public.smart_meters
set status = 'offline',
    last_seen = null,
    battery_level = null,
    wifi_signal = null;
