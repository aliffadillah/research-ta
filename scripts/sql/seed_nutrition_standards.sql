-- Seed Nutrition Standards from MBG_Historis_Latest.json
-- Mapping: gender -> Bayi/Anak, Laki-Laki, Perempuan

TRUNCATE nutrition_standards CASCADE;

-- Bayi/Anak
INSERT INTO nutrition_standards (gender, age_group, body_weight, body_height, energy, fat, protein, carbs, fiber) VALUES
  ('bayi_anak', '0-5 Bulan', 6.0, 60.0, 550.0, 31.0, 9.0, 59.0, 0.0),
  ('bayi_anak', '6-11 Bulan', 9.0, 72.0, 800.0, 35.0, 15.0, 105.0, 11.0),
  ('bayi_anak', '1-3 Tahun', 13.0, 92.0, 1350.0, 45.0, 20.0, 215.0, 19.0),
  ('bayi_anak', '4-6 Tahun', 19.0, 113.0, 1400.0, 50.0, 25.0, 220.0, 20.0),
  ('bayi_anak', '7-9 Tahun', 27.0, 130.0, 1650.0, 55.0, 40.0, 250.0, 23.0);

-- Laki-Laki
INSERT INTO nutrition_standards (gender, age_group, body_weight, body_height, energy, fat, protein, carbs, fiber) VALUES
  ('laki_laki', '10-12 Tahun', 36.0, 145.0, 2000.0, 65.0, 50.0, 300.0, 28.0),
  ('laki_laki', '13-15 Tahun', 50.0, 163.0, 2400.0, 80.0, 70.0, 350.0, 34.0),
  ('laki_laki', '16-18 Tahun', 60.0, 168.0, 2650.0, 85.0, 75.0, 400.0, 37.0);

-- Perempuan
INSERT INTO nutrition_standards (gender, age_group, body_weight, body_height, energy, fat, protein, carbs, fiber) VALUES
  ('perempuan', '10-12 Tahun', 38.0, 147.0, 1900.0, 65.0, 55.0, 280.0, 27.0),
  ('perempuan', '13-15 Tahun', 48.0, 156.0, 2050.0, 70.0, 65.0, 300.0, 29.0),
  ('perempuan', '16-18 Tahun', 52.0, 159.0, 2100.0, 70.0, 65.0, 300.0, 29.0),
  ('perempuan', '19-29 Tahun', 55.0, 159.0, 2250.0, 65.0, 60.0, 360.0, 32.0),
  ('perempuan', '30-49 Tahun', 56.0, 158.0, 2150.0, 60.0, 60.0, 340.0, 30.0);

SELECT COUNT(*) AS nutrition_standards_inserted FROM nutrition_standards;