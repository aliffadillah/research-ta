-- ============================================================
-- SEED DATA FOR MBG MOBILE APP - SUPABASE
-- Run: psql $DATABASE_URL -f seed_all.sql
-- ============================================================

\echo '=========================================='
\echo 'Seeding Nutrition Standards...'
\echo '=========================================='

-- Seed Nutrition Standards from MBG AKG Data
TRUNCATE nutrition_standards CASCADE;

INSERT INTO nutrition_standards (gender, age_group, body_weight, body_height, energy, fat, protein, carbs, fiber) VALUES
  ('bayi_anak', '0-5 Bulan', 6.0, 60.0, 550.0, 31.0, 9.0, 59.0, 0.0),
  ('bayi_anak', '6-11 Bulan', 9.0, 72.0, 800.0, 35.0, 15.0, 105.0, 11.0),
  ('bayi_anak', '1-3 Tahun', 13.0, 92.0, 1350.0, 45.0, 20.0, 215.0, 19.0),
  ('bayi_anak', '4-6 Tahun', 19.0, 113.0, 1400.0, 50.0, 25.0, 220.0, 20.0),
  ('bayi_anak', '7-9 Tahun', 27.0, 130.0, 1650.0, 55.0, 40.0, 250.0, 23.0),
  ('laki_laki', '10-12 Tahun', 36.0, 145.0, 2000.0, 65.0, 50.0, 300.0, 28.0),
  ('laki_laki', '13-15 Tahun', 50.0, 163.0, 2400.0, 80.0, 70.0, 350.0, 34.0),
  ('laki_laki', '16-18 Tahun', 60.0, 168.0, 2650.0, 85.0, 75.0, 400.0, 37.0),
  ('perempuan', '10-12 Tahun', 38.0, 147.0, 1900.0, 65.0, 55.0, 280.0, 27.0),
  ('perempuan', '13-15 Tahun', 48.0, 156.0, 2050.0, 70.0, 65.0, 300.0, 29.0),
  ('perempuan', '16-18 Tahun', 52.0, 159.0, 2100.0, 70.0, 65.0, 300.0, 29.0),
  ('perempuan', '19-29 Tahun', 55.0, 159.0, 2250.0, 65.0, 60.0, 360.0, 32.0),
  ('perempuan', '30-49 Tahun', 56.0, 158.0, 2150.0, 60.0, 60.0, 340.0, 30.0);

\echo 'Nutrition Standards: ' || (SELECT COUNT(*) FROM nutrition_standards) || ' rows inserted'

\echo ''
\echo '=========================================='
\echo 'Seeding Menu Recommendations...'
\echo '=========================================='

-- Seed Menu Recommendations from MBG Historis Data
TRUNCATE menu_recommendations CASCADE;

INSERT INTO menu_recommendations (name, name_id, description, calories, protein, carbs, fat, fiber, category, tags, is_active) VALUES
  ('Menu 1', 'Menu 1', 'Nasi Hainan, Ayam kukus Jahe, Kacang Bogor, Pakcoy Saus Garlic, Anggur', 545.0, 16.0, 75.0, 19.0, 0.0, 'breakfast', ARRAY['balanced'], true),
  ('Menu 2', 'Menu 2', 'Bihun Goreng, Telur Saus Tiram, Tahu Crispiy, Selada Timun, jeruk', 595.0, 17.0, 85.0, 16.0, 0.0, 'lunch', ARRAY['balanced'], true),
  ('Menu 3', 'Menu 3', 'Nasi, Ayam Saus Lada Hitam, Kripik Tempe, Mix Vegetable, Pisang', 595.0, 15.0, 85.0, 22.0, 0.0, 'dinner', ARRAY['balanced'], true),
  ('Menu 4', 'Menu 4', 'Nasi, Ayam Opor Kuning, Bakwan Jaggung, Tumis Kembang Kol & Wortel, Pisang', 680.0, 17.0, 105.0, 21.0, 0.0, 'snack', ARRAY['balanced'], true),
  ('Menu 5', 'Menu 5', 'Roti Tawar, Chicken Katsu, Keju Slice, Ketimun & Selada, Anggur', 554.0, 19.0, 60.0, 26.0, 0.0, 'breakfast', ARRAY['balanced'], true),
  ('Menu 6', 'Menu 6', 'Nasi Liwet, Ayam Goreng Tempe Tepung, Sambal Hijau, Jeruk, Timun', 599.67, 21.09, 63.94, 29.11, 2.71, 'lunch', ARRAY['balanced'], true),
  ('Menu 7', 'Menu 7', 'Roti Manis, Susu, Keju, Pisang', 457.55, 10.23, 55.66, 21.07, 1.9, 'dinner', ARRAY['balanced'], true),
  ('Menu 8', 'Menu 8', 'Mie Goreng, Timun Dan Selada, Jeruk, Ayam Suwir,Tahu Crispiy', 577.51, 25.41, 86.98, 13.04, 0.91, 'snack', ARRAY['high-protein'], true),
  ('Menu 9', 'Menu 9', 'Nasi Daun Jeruk, Ayam Serundeng, Pepes Tahu, Selada & timun, Pisang Lampung', 587.0, 18.0, 78.0, 24.0, 0.0, 'breakfast', ARRAY['balanced'], true),
  ('Menu 10', 'Menu 10', 'Nasi Putih, Ayam Teriyaki, Tumis Pokcoy & Jagung, Anggur, Tahu Crispiy', 603.76, 19.32, 59.71, 29.54, 0.07, 'lunch', ARRAY['balanced'], true),
  ('Menu 11', 'Menu 11', 'Nasi, Chicken Popcorn Asam Manis, Tempe Oreg, Pakcoy Garlic Sausce, Anggur', 630.0, 20.0, 85.0, 24.0, 0.0, 'dinner', ARRAY['balanced'], true),
  ('Menu 12', 'Menu 12', 'Kwetiaw, Bakso Saus Bbq, Tahu Kremes, Acar timun Wortel, Jeruk', 595.0, 20.0, 65.0, 30.0, 0.0, 'snack', ARRAY['balanced'], true),
  ('Menu 13', 'Menu 13', 'Nasi, Lele Crispiy, Tahu Goreng, Tumis Keciwis, Kelengkeng dan Anggur', 535.0, 18.0, 85.0, 15.0, 0.0, 'breakfast', ARRAY['balanced'], true),
  ('Menu 14', 'Menu 14', 'Jagung, Fla Susu, Telur Rebus, Kacang Merah, Apel Malang', 560.0, 21.0, 90.0, 19.0, 0.0, 'lunch', ARRAY['balanced'], true),
  ('Menu 15', 'Menu 15', 'Mie Telur, Semur Ayam Kecap, Tempe Sagu, Sawi Hijau, Pisang', 645.0, 15.0, 95.0, 25.0, 0.0, 'dinner', ARRAY['balanced'], true),
  ('Menu 16', 'Menu 16', 'Potato Wedges, Dimsum Mentai, Edamame, Selada Ketimun, Anggur', 575.0, 17.0, 75.0, 25.0, 0.0, 'snack', ARRAY['balanced'], true),
  ('Menu 17', 'Menu 17', 'Nasi, Semur Telur, Tahu Crispiy, Tumis kool Wortel, Kelengkeng', 630.0, 20.0, 95.0, 19.0, 2.3, 'breakfast', ARRAY['high-fiber'], true),
  ('Menu 18', 'Menu 18', 'Nasi, Rolade, Asam Manis, Tempe Tepung, Capcay, Salad Buah', 673.0, 20.0, 101.0, 22.0, 3.2, 'lunch', ARRAY['high-fiber'], true),
  ('Menu 19', 'Menu 19', 'Lontong, telur Rebus, Tahu Kukus, Kuah Lontong, Sayur Isi Pepaya, Pisang', 570.0, 20.0, 85.0, 19.0, 3.0, 'dinner', ARRAY['balanced'], true),
  ('Menu 20', 'Menu 20', 'Nasi, Ayam Goreng, Tempe Bacem, Gudeg Nangka, Apel', 520.0, 17.0, 65.0, 25.0, 5.2, 'snack', ARRAY['balanced'], true),
  ('Menu 21', 'Menu 21', 'Roti Tawar, Ketan Hitam, Telur Rebus, Bubur kacang Hijau, Kurma', 550.0, 22.0, 93.0, 10.0, 6.1, 'breakfast', ARRAY['high-fiber'], true),
  ('Menu 22', 'Menu 22', 'Nasi, Dori Asam Manis, Tahu Goreng, Tumis Jagung Semi, Wortel & Kapri, Jeruk', 645.0, 20.0, 95.0, 20.0, 3.5, 'lunch', ARRAY['balanced'], true),
  ('Menu 23', 'Menu 23', 'Pasta, Chicken Bolognes, Edamamem, Baby Labusiam, Kelengkeng', 550.0, 21.0, 80.0, 18.0, 7.8, 'dinner', ARRAY['high-fiber'], true),
  ('Menu 24', 'Menu 24', 'Roti Burger, Chicken Katsu,Timun, Saus Sambal, Buah Jeruk', 644.0, 24.5, 87.5, 22.7, 7.3, 'snack', ARRAY['balanced'], true),
  ('Menu 25', 'Menu 25', 'Nasi Putih,Ikan Dori, Selada Timun,Tahu, Buah Apel', 782.0, 29.6, 108.0, 25.1, 6.0, 'breakfast', ARRAY['high-protein'], true),
  ('Menu 26', 'Menu 26', 'Roti Tawar, Bubur Kacang Ijo, Susu Kental Manis, Telur puyuh, Jeruk', 679.0, 24.5, 119.9, 14.2, 10.0, 'lunch', ARRAY['balanced'], true),
  ('Menu 27', 'Menu 27', 'Mie, Ayam Bumbu Kecap, Pangsit, Buah Semangka, Sawi', 719.0, 22.4, 102.4, 21.8, 5.0, 'dinner', ARRAY['balanced'], true),
  ('Menu 28', 'Menu 28', 'Nasi Goreng, Telur Ceplok, Tahu Crispiy, Lalapan, Salak', 693.0, 23.0, 100.0, 24.0, 0.9, 'snack', ARRAY['balanced'], true),
  ('Menu 29', 'Menu 29', 'Mie Kuning Dan Bihun, Bakso, Tahu Kukus, Sawi Hijau, Jeruk', 510.0, 19.0, 88.0, 15.0, 4.1, 'breakfast', ARRAY['balanced'], true),
  ('Menu 30', 'Menu 30', 'Roti Panjang,Yakult, Sosis, Timun & Selada, Saus Sambal', 619.0, 27.4, 123.6, 24.5, 3.9, 'lunch', ARRAY['balanced'], true),
  ('Menu 31', 'Menu 31', 'Nasi Putih, Sayap Ayam Saus Madu, Selada Timun, Tahu Crispiy, Buah Melon', 728.0, 27.3, 100.5, 25.8, 3.1, 'dinner', ARRAY['high-protein'], true),
  ('Menu 32', 'Menu 32', 'Nasi Kebuli, Ayam Gulai, Tahu Goreng, Acar Kuning, Kurma', 660.0, 21.0, 95.0, 23.0, 2.1, 'snack', ARRAY['balanced'], true),
  ('Menu 33', 'Menu 33', 'Nasi, Dori Lada Hitam, Tempe Goreng, Tumis Jagung semi dan Wortel, Jeruk', 590.0, 22.0, 95.0, 17.0, 3.3, 'breakfast', ARRAY['balanced'], true),
  ('Menu 34', 'Menu 34', 'Roti Burger, Chicken Katsu, Timun Selada, Saus Yakult', 641.0, 26.5, 91.7, 18.5, 9.7, 'lunch', ARRAY['high-fiber'], true),
  ('Menu 35', 'Menu 35', 'Roti Bun, Chiken Katsu Mayo, Keju, Selada & Timun, Jeruk, Edamame', 550.0, 3.1, 60.0, 25.0, 3.1, 'dinner', ARRAY['balanced'], true),
  ('Menu 36', 'Menu 36', 'Nasi Putih, Ayam Serundeng, Tempe Bacem, Buah Pepaya', 769.0, 27.0, 107.0, 23.0, 4.5, 'snack', ARRAY['balanced'], true),
  ('Menu 37', 'Menu 37', 'Nasi Putih, Sosis Telur, Tumis Wortel Buncis, Tempe Crispiy, Buah Melon', 810.0, 28.9, 107.5, 30.9, 6.6, 'breakfast', ARRAY['balanced'], true),
  ('Menu 38', 'Menu 38', 'Roti, Telur Rebus, Kurma, Buah Jeruk', 345.0, 10.5, 67.0, 6.5, 6.0, 'lunch', ARRAY['balanced'], true),
  ('Menu 39', 'Menu 39', 'Gyoza, Singkong Keju Thailand, Jeruk, Apel Fuji', 535.0, 18.0, 93.0, 12.0, 6.0, 'dinner', ARRAY['balanced'], true),
  ('Menu 40', 'Menu 40', 'Bolen Pisang, Kentang Bolognese, Jeruk Medan, Keju Slice', 410.0, 6.5, 66.0, 8.0, 3.9, 'snack', ARRAY['balanced'], true),
  ('Menu 41', 'Menu 41', 'Tempe Oreg, Puding Buah Naga, Kacang Koro', 507.0, 22.0, 46.0, 28.0, 3.0, 'breakfast', ARRAY['high-protein'], true),
  ('Menu 42', 'Menu 42', 'Susu Full Cream, Apel Fuji, Dimsum', 481.0, 15.0, 65.0, 20.0, 6.0, 'lunch', ARRAY['balanced'], true),
  ('Menu 43', 'Menu 43', 'Nasi, Pisang Cavendish, Adamame, Dori Asam Manis, Tumis Jagung', 600.0, 17.0, 101.0, 16.0, 2.8, 'dinner', ARRAY['balanced'], true),
  ('Menu 44', 'Menu 44', 'Nasi, Kaki Naga Saus Padang, Buncis Garlic,Tempe Oreg, Semangka', 585.0, 15.0, 100.0, 14.0, 1.8, 'snack', ARRAY['balanced'], true),
  ('Menu 45', 'Menu 45', 'Spaggeheti, Jeruk, Chicken, Pangsit Goreng, Coleslaw, Chicken Bolognese', 516.0, 20.0, 82.0, 21.0, 5.6, 'breakfast', ARRAY['balanced'], true),
  ('Menu 46', 'Menu 46', 'Nasi Uduk, Buah Kelengkeng, Timun Selada, Telur Balado, Tempe Oreg', 709.0, 25.9, 81.9, 31.6, 5.2, 'lunch', ARRAY['balanced'], true),
  ('Menu 47', 'Menu 47', 'Nasi, Mix Vegetable, Dori Asam Manis, Semur Tahu, Susu Fulcream', 601.0, 22.0, 90.0, 18.0, 0.8, 'dinner', ARRAY['balanced'], true),
  ('Menu 48', 'Menu 48', 'Nasi, Capcay, Ayam Goreng Batam, Tempe Goreng, Pisang', 639.0, 21.0, 92.0, 23.0, 3.8, 'snack', ARRAY['balanced'], true),
  ('Menu 49', 'Menu 49', 'Nasi Putih, Tahu Putih Cabe Garam, Ayam Teriyaki, Mix Vegetable', 828.0, 30.3, 123.2, 23.9, 6.5, 'breakfast', ARRAY['high-protein'], true),
  ('Menu 50', 'Menu 50', 'Nasi daun Jeruk, Tumis Kacang Panjang Tempe, Rolade Telur, Tahu Pong Crispiy, Apel Fuji', 612.0, 22.0, 92.0, 18.0, 3.3, 'lunch', ARRAY['balanced'], true),
  ('Menu 51', 'Menu 51', 'Nasi Putih, Buah Salak, Capcay, Saus, Tempe', 866.0, 23.8, 131.5, 29.0, 10.3, 'dinner', ARRAY['high-fiber'], true),
  ('Menu 52', 'Menu 52', 'Mie Telur, Sawi Hijau, Semur Ayam Kecap, Pangsit Goreng, Jeruk', 440.0, 15.0, 90.0, 14.0, 4.0, 'snack', ARRAY['balanced'], true),
  ('Menu 53', 'Menu 53', 'Nasi Putih, Sapo Tahu, Ayam Saus Madu, Wortel Buncis, Yakult', 720.0, 22.0, 106.0, 24.0, 6.0, 'breakfast', ARRAY['balanced'], true),
  ('Menu 54', 'Menu 54', 'Nasi, Tahu Goreng, Chicken Karage, Kelengkeng, Tumis Sayur', 634.0, 19.0, 90.0, 23.0, 2.1, 'lunch', ARRAY['balanced'], true),
  ('Menu 55', 'Menu 55', 'Nasi Kuning, Tempe Oreg, Ayam Goreng, Selada Timun, Buah Semangka', 730.0, 22.0, 105.0, 24.0, 5.0, 'dinner', ARRAY['balanced'], true),
  ('Menu 56', 'Menu 56', 'Burger Bun, Telur Ceplok, Saus, Timun & Selada, Susu Full Cream', 351.0, 15.0, 40.0, 17.0, 0.4, 'snack', ARRAY['balanced'], true),
  ('Menu 57', 'Menu 57', 'Mie Ayam, Buah Melon, Kulit Pangsit, Ayam Semur, Sawi', 720.0, 23.0, 110.0, 26.0, 7.0, 'breakfast', ARRAY['balanced'], true),
  ('Menu 58', 'Menu 58', 'Nasi Putih, Capcay, Tempe Goreng, Telur Semur', 720.0, 20.0, 103.5, 23.0, 6.0, 'lunch', ARRAY['balanced'], true),
  ('Menu 59', 'Menu 59', 'Nasi Putih, Semur Daging Sapi, Tahu Goreng, Timun', 740.0, 22.0, 107.0, 24.0, 7.0, 'dinner', ARRAY['high-protein'], true),
  ('Menu 60', 'Menu 60', 'Potato Widges,Dori Katsu, Tahu Walik, Saus BBQ, Buah Apel', 710.0, 20.0, 103.0, 22.0, 10.0, 'snack', ARRAY['high-fiber'], true),
  ('Menu 61', 'Menu 61', 'Nasi Putih, Ayam Saus Teriyaki, Tempe Goreng', 706.0, 18.0, 100.5, 20.0, 6.0, 'breakfast', ARRAY['balanced'], true),
  ('Menu 62', 'Menu 62', 'Nasi Putih, Tahu Goreng, Buah Semangka,Telur Kecap, Tumis Labu Siam', 730.0, 22.0, 105.0, 24.0, 8.0, 'lunch', ARRAY['balanced'], true),
  ('Menu 63', 'Menu 63', 'Kentang Goreng, Dimsum, Wortel, Jasuke, Buah Pisang, Saus', 700.0, 11.0, 105.0, 25.0, 16.0, 'dinner', ARRAY['high-fiber'], true),
  ('Menu 64', 'Menu 64', 'Nasi Daun Jeruk, Buah Naga, Selada Timun, Ayam Goreng, Tahu', 750.0, 22.0, 105.0, 25.0, 8.0, 'snack', ARRAY['balanced'], true),
  ('Menu 65', 'Menu 65', 'Roti, Kacang Ijo, Susu Kental Manis, Jagung Buah Kelengkeng', 70.0, 20.0, 120.0, 19.0, 12.0, 'breakfast', ARRAY['high-fiber'], true),
  ('Menu 66', 'Menu 66', 'Nasi Putih, Tempe Goreng, Lele Asam Manis, Timun, Semangka', 690.0, 22.5, 100.0, 24.0, 6.0, 'lunch', ARRAY['balanced'], true),
  ('Menu 67', 'Menu 67', 'Nasi Putih, Ayam Gofreng, Tumis Sawi Jagung, Tahu Goreng, Buah Naga', 720.0, 22.0, 105.0, 24.0, 8.0, 'dinner', ARRAY['balanced'], true),
  ('Menu 68', 'Menu 68', 'Bihun Rebus, Tahu Goreng, Telor Rebus, Timun Potong, Sambal Kacang, Buah Apel', 670.0, 33.0, 55.0, 30.0, 7.0, 'snack', ARRAY['high-protein'], true),
  ('Menu 69', 'Menu 69', 'Nasi Putih, Ayam Filet, Tahu Cabe Garam, Timun, Buah Melon', 720.0, 25.0, 105.0, 24.0, 5.0, 'breakfast', ARRAY['balanced'], true),
  ('Menu 70', 'Menu 70', 'Nasi Liwet, Ayam Katsu, Pokcoy, Tempe Balado, Susu 125 ml', 680.0, 35.0, 50.0, 32.0, 6.0, 'lunch', ARRAY['high-protein'], true),
  ('Menu 71', 'Menu 71', 'Kentang Goreng, Dimsum Saus, Edamame, Kol Ungu Wortel, Buah Semangka', 680.0, 27.0, 60.0, 32.0, 6.0, 'dinner', ARRAY['balanced'], true),
  ('Menu 72', 'Menu 72', 'Nasi Putih, Tahu Goreng, Daun Kong Pae, Daun bAwang Putih', 740.0, 25.0, 105.0, 25.0, 6.0, 'snack', ARRAY['balanced'], true),
  ('Menu 73', 'Menu 73', 'Potato Widges, Tahu Goreng, Pastel, Buah Salak, Saus', 750.0, 22.0, 105.0, 30.0, 4.0, 'breakfast', ARRAY['balanced'], true),
  ('Menu 74', 'Menu 74', 'Nasi Putih, Pepes Tahu, Telur Kecap, Capcay, Buah Melon', 528.0, 20.16, 72.2, 20.52, 2.02, 'lunch', ARRAY['balanced'], true),
  ('Menu 75', 'Menu 75', 'Nasi Putih, Tumis Kacang Panjang, Tahu Goreng, Kulit Ayam', 760.0, 21.0, 110.0, 23.0, 7.0, 'dinner', ARRAY['balanced'], true),
  ('Menu 76', 'Menu 76', 'Nasi Putih, Ayam Geprek, Tempe Goreng, Timun Potong, Kelengkeng', 557.6, 22.39, 73.88, 18.71, 1.23, 'snack', ARRAY['balanced'], true),
  ('Menu 77', 'Menu 77', 'Nasi Putih, Tempe Crispiy, Timun, Dori Asam Manis, Buah Semangka', 710.0, 22.0, 105.0, 24.0, 5.0, 'breakfast', ARRAY['balanced'], true),
  ('Menu 78', 'Menu 78', 'Nasi Liwet, Telur Dadar Suwir, Tumis Sawi, Jagung, Tahu Balado, Buah Semangka', 509.8, 23.48, 58.89, 28.69, 3.15, 'lunch', ARRAY['balanced'], true),
  ('Menu 79', 'Menu 79', 'Roti Burger, Chickeen Katsu, Timun, Kentang, Buah Salak', 720.0, 22.0, 105.0, 24.0, 6.0, 'dinner', ARRAY['balanced'], true),
  ('Menu 80', 'Menu 80', 'Nasi Putih, Ayam Sauce Asam Manis, Tumis Buncis Wortel, Tempe Goreng, Buah Naga', 530.0, 19.58, 63.37, 21.25, 1.04, 'snack', ARRAY['balanced'], true),
  ('Menu 81', 'Menu 81', 'Nasi Kebuli, Ayam Goreng, Acar timun Wortel, Tahu Goreng', 725.0, 22.0, 104.0, 25.0, 5.0, 'breakfast', ARRAY['balanced'], true),
  ('Menu 82', 'Menu 82', 'Nasi Abon, Telur Kecap, Tumis Sawi Hijau Tahu kuning, Susu 125 ml, Buah pisang', 501.6, 23.64, 77.02, 18.83, 2.92, 'lunch', ARRAY['balanced'], true),
  ('Menu 83', 'Menu 83', 'Nasi Putih, Selada Timun, Susu Telur, Buah Pisang', 735.0, 22.0, 106.0, 25.0, 4.0, 'dinner', ARRAY['balanced'], true),
  ('Menu 84', 'Menu 84', 'Nasi Putih, Susu Putih, Daging, Wortel Timun Acar', 740.0, 23.0, 108.0, 24.0, 5.0, 'snack', ARRAY['balanced'], true),
  ('Menu 85', 'Menu 85', 'Nasi Putih, Sambal Kentang Ati Sapi, Tempe Goreng Tepung, Timun Potong, Jeruk Santang', 531.3, 12.49, 66.75, 6.21, 3.17, 'breakfast', ARRAY['balanced'], true),
  ('Menu 86', 'Menu 86', 'Roti Burger, Telor Dadar, Selada Timun, Puding Mangga, Kacang Merah, Saos, Susu 125 ml', 519.7, 20.3, 71.35, 18.11, 5.2, 'lunch', ARRAY['balanced'], true),
  ('Menu 87', 'Menu 87', 'Nasi Putih, Beef Sice Teriyaki, Salad Thousand, Tahu Goreng', 684.0, 24.4, 27.8, 21.3, 2.4, 'dinner', ARRAY['high-protein'], true);

\echo 'Menu Recommendations: ' || (SELECT COUNT(*) FROM menu_recommendations) || ' rows inserted'

\echo ''
\echo '=========================================='
\echo 'SEEDING COMPLETE!'
\echo '=========================================='
\echo 'Nutrition Standards: ' || (SELECT COUNT(*) FROM nutrition_standards) || ' rows'
\echo 'Menu Recommendations: ' || (SELECT COUNT(*) FROM menu_recommendations) || ' rows'