-- Switch consumption units from m3 to litres and pricing to TSh
-- (1 litre = 100 TSh). Existing rows are rescaled x1000 so they keep the
-- same real-world meaning, just expressed in litres instead of m3;
-- already-charged bill totals are left untouched (they were correct
-- under the old pricing at the time they were generated) - only the
-- displayed consumption quantity is relabeled.

update public.daily_usage set consumption = consumption * 1000;
update public.monthly_usage set total_consumption = total_consumption * 1000, average_daily = average_daily * 1000;
update public.bills set consumption = consumption * 1000;

update public.system_settings set currency = 'TSh', water_tariff = 100;
