-- ============================================================================
-- SEED DATA EXPANDED (35+ ITEMS & TRANSAKSI REALISTIS)
-- SUPPLYCHAINKU SCM
-- ============================================================================

-- 1. BERSIHKAN DATA LAMA DENGAN AMAN (OPSIONAL, JIKA INGIN FRESH RESET)
TRUNCATE TABLE public.distribution_items CASCADE;
TRUNCATE TABLE public.distribution_orders CASCADE;
TRUNCATE TABLE public.inbound_items CASCADE;
TRUNCATE TABLE public.inbound_orders CASCADE;
TRUNCATE TABLE public.stock_movements CASCADE;
TRUNCATE TABLE public.location_stocks CASCADE;
TRUNCATE TABLE public.items CASCADE;
TRUNCATE TABLE public.suppliers CASCADE;
TRUNCATE TABLE public.scm_users CASCADE;
TRUNCATE TABLE public.locations CASCADE;

-- ============================================================================
-- 2. MASTER DATA LOKASI (1 GUDANG PUSAT + 5 CABANG OUTLET)
-- ============================================================================
INSERT INTO public.locations (id, code, name, type, address) VALUES
('11111111-1111-1111-1111-111111111111', 'WH-PUSAT', 'Gudang Pusat Tangerang', 'warehouse', 'Kawasan Industri Cikupa Kav. 8, Tangerang'),
('22222222-2222-2222-2222-222222222222', 'BR-PML', 'Cabang Pamulang', 'branch', 'Jl. Surya Kencana No. 12, Pamulang'),
('33333333-3333-3333-3333-333333333333', 'BR-BSD', 'Cabang BSD Serpong', 'branch', 'Jl. Pahlawan Seribu, Ruko Golden Boulevard, BSD'),
('44444444-4444-4444-4444-444444444444', 'BR-BNT', 'Cabang Bintaro Jaya', 'branch', 'Bintaro Jaya Sektor 7, Jl. Boulevard Bintaro Jaya'),
('55555555-5555-5555-5555-555555555555', 'BR-TBT', 'Cabang Tebet Jakarta', 'branch', 'Jl. Tebet Raya No. 45, Tebet, Jakarta Selatan'),
('66666666-6666-6666-6666-666666666666', 'BR-BDG', 'Cabang Dago Bandung', 'branch', 'Jl. Ir. H. Juanda No. 102, Dago, Bandung');

-- ============================================================================
-- 3. MASTER DATA PENGGUNA (SCM USERS)
-- ============================================================================
INSERT INTO public.scm_users (id, name, username, password, role, location_id) VALUES
('70000001-0000-0000-0000-000000000001', 'Palaguna (Manajer Pusat)', 'admin', 'admin123', 'super_admin', '11111111-1111-1111-1111-111111111111'),
('70000002-0000-0000-0000-000000000002', 'Putra Reno (Kepala Gudang)', 'gudang', 'gudang123', 'warehouse_staff', '11111111-1111-1111-1111-111111111111'),
('70000003-0000-0000-0000-000000000003', 'Ikhsan Dwi (Branch Mgr Pamulang)', 'pamulang', 'pamulang123', 'branch_manager', '22222222-2222-2222-2222-222222222222'),
('70000004-0000-0000-0000-000000000004', 'Dedi Kurniawan (Branch Mgr BSD)', 'bsd', 'bsd123', 'branch_manager', '33333333-3333-3333-3333-333333333333'),
('70000005-0000-0000-0000-000000000005', 'Rina Anggraini (Branch Mgr Bintaro)', 'bintaro', 'bintaro123', 'branch_manager', '44444444-4444-4444-4444-444444444444');

-- ============================================================================
-- 4. MASTER DATA SUPPLIER (7 VENDOR TERPERCAYA)
-- ============================================================================
INSERT INTO public.suppliers (id, code, name, contact_person, phone, lead_time_days, address) VALUES
('aaaa1111-1111-1111-1111-111111111111', 'SUP-001', 'PT Agro Nusantara Makmur', 'Budi Santoso', '081298765432', 2, 'Bogor, Jawa Barat (Spesialis Biji Kopi)'),
('bbbb2222-2222-2222-2222-222222222222', 'SUP-002', 'CV Kemasan Prima Jaya', 'Siti Aminah', '081345678901', 3, 'Cikarang, Bekasi (Spesialis Cups & Paperbag)'),
('aaaa3333-3333-3333-3333-333333333333', 'SUP-003', 'PT Sukanda Dairy Sejahtera', 'Hendra Wijaya', '081122334455', 1, 'Jakarta Timur (Spesialis Dairy & Milk)'),
('aaaa4444-4444-4444-4444-444444444444', 'SUP-004', 'PT Toffin Rasa Indonesia', 'Jessica Tan', '081987654321', 2, 'Jakarta Barat (Spesialis Sirup & Powders)'),
('aaaa5555-5555-5555-5555-555555555555', 'SUP-005', 'CV Boba Topping Mandiri', 'Rian Hidayat', '085612345678', 3, 'Tangerang Kota (Spesialis Topping Jelly & Pearl)'),
('aaaa6666-6666-6666-6666-666666666666', 'SUP-006', 'PT Bakeri Bakery Nusantara', 'Dewi Lestari', '087811223344', 1, 'Jakarta Selatan (Spesialis Pastry & Croissant)'),
('aaaa7777-7777-7777-7777-777777777777', 'SUP-007', 'PT Clean Hygiene Solution', 'Agus Salim', '082155667788', 2, 'Karawaci, Tangerang (Spesialis Sanitasi Mesin)');

-- ============================================================================
-- 5. MASTER DATA BARANG / SKU (36 ITEMS LENGKAP DENGAN KATEGORI BERBEDA)
-- ============================================================================
INSERT INTO public.items (id, sku, name, category, unit, min_stock, unit_cost) VALUES
-- Kategori: Bahan Baku - Biji Kopi
('c0000001-0000-0000-0000-000000000001', 'SKU-KP01', 'Biji Kopi Arabika Gayo Wash', 'Bahan Baku', 'kg', 20, 145000),
('c0000002-0000-0000-0000-000000000002', 'SKU-KP02', 'Biji Kopi Robusta Dampit Malang', 'Bahan Baku', 'kg', 20, 85000),
('c0000003-0000-0000-0000-000000000003', 'SKU-KP03', 'Biji Kopi Arabika Mandheling Natural', 'Bahan Baku', 'kg', 15, 155000),
('c0000004-0000-0000-0000-000000000004', 'SKU-KP04', 'Espresso Blend Signature 70:30', 'Bahan Baku', 'kg', 25, 120000),
('c0000005-0000-0000-0000-000000000005', 'SKU-KP05', 'Biji Kopi Decaf Colombia Swiss Water', 'Bahan Baku', 'kg', 10, 185000),

-- Kategori: Bahan Baku - Susu & Dairy
('c0000006-0000-0000-0000-000000000006', 'SKU-SS01', 'Susu UHT Fresh Full Cream 1L (Karton)', 'Bahan Baku', 'dus', 20, 185000),
('c0000007-0000-0000-0000-000000000007', 'SKU-SS02', 'Oat Milk Barista Edition 1L', 'Bahan Baku', 'dus', 15, 295000),
('c0000008-0000-0000-0000-000000000008', 'SKU-SS03', 'Almond Milk Unsweetened 1L', 'Bahan Baku', 'dus', 10, 310000),
('c0000009-0000-0000-0000-000000000009', 'SKU-SS04', 'Susu Kental Manis Carnation 490g (Karton)', 'Bahan Baku', 'dus', 10, 165000),
('c0000010-0000-0000-0000-000000000010', 'SKU-SS05', 'Whipping Cream Anchor 1L', 'Bahan Baku', 'pack', 12, 65000),

-- Kategori: Bahan Baku - Sirup & Flavour
('c0000011-0000-0000-0000-000000000011', 'SKU-SR01', 'Sirup Gula Aren Organik 5L', 'Bahan Baku', 'jerigen', 10, 95000),
('c0000012-0000-0000-0000-000000000012', 'SKU-SR02', 'Sirup Karamel Monin 700ml', 'Bahan Baku', 'botol', 8, 138000),
('c0000013-0000-0000-0000-000000000013', 'SKU-SR03', 'Sirup Vanilla Monin 700ml', 'Bahan Baku', 'botol', 8, 138000),
('c0000014-0000-0000-0000-000000000014', 'SKU-SR04', 'Sirup Hazelnut Toffieco 1L', 'Bahan Baku', 'botol', 8, 88000),
('c0000015-0000-0000-0000-000000000015', 'SKU-SR05', 'Sirup Pandan Wangi Concentrate', 'Bahan Baku', 'botol', 6, 75000),
('c0000016-0000-0000-0000-000000000016', 'SKU-SR06', 'Sirup Leci Monin 700ml', 'Bahan Baku', 'botol', 8, 142000),

-- Kategori: Bahan Baku - Bubuk Minuman (Powder)
('c0000017-0000-0000-0000-000000000017', 'SKU-PW01', 'Matcha Uji Ceremonial Grade 1kg', 'Bahan Baku', 'kg', 8, 225000),
('c0000018-0000-0000-0000-000000000018', 'SKU-PW02', 'Dark Chocolate Powder Belgia 1kg', 'Bahan Baku', 'kg', 12, 115000),
('c0000019-0000-0000-0000-000000000019', 'SKU-PW03', 'Red Velvet Powder Premium 1kg', 'Bahan Baku', 'kg', 10, 98000),
('c0000020-0000-0000-0000-000000000020', 'SKU-PW04', 'Taro Silky Powder 1kg', 'Bahan Baku', 'kg', 10, 89000),
('c0000021-0000-0000-0000-000000000021', 'SKU-PW05', 'Hojicha Roasted Tea Powder 500g', 'Bahan Baku', 'pack', 6, 135000),

-- Kategori: Topping & Tambahan
('c0000022-0000-0000-0000-000000000022', 'SKU-TP01', 'Boba Black Pearl Tapioka 1kg', 'Topping', 'pack', 15, 38000),
('c0000023-0000-0000-0000-000000000023', 'SKU-TP02', 'Grass Jelly / Cincau Hitam Silky', 'Topping', 'kaleng', 10, 48000),
('c0000024-0000-0000-0000-000000000024', 'SKU-TP03', 'Egg Pudding Custard Powder', 'Topping', 'pack', 10, 45000),
('c0000025-0000-0000-0000-000000000025', 'SKU-TP04', 'Coffee Jelly Cubes 1kg', 'Topping', 'pack', 8, 52000),

-- Kategori: Kemasan & Packaging
('c0000026-0000-0000-0000-000000000026', 'SKU-CP01', 'Paper Cup Hot 8oz Craft + Lid (Isi 50)', 'Kemasan', 'pack', 30, 25000),
('c0000027-0000-0000-0000-000000000027', 'SKU-CP02', 'Paper Cup Hot 12oz Craft + Lid (Isi 50)', 'Kemasan', 'pack', 30, 29000),
('c0000028-0000-0000-0000-000000000028', 'SKU-CP03', 'Cup Cold PET 12oz Logo Emboss (Isi 50)', 'Kemasan', 'pack', 40, 32000),
('c0000029-0000-0000-0000-000000000029', 'SKU-CP04', 'Cup Cold PET 16oz Logo Emboss (Isi 50)', 'Kemasan', 'pack', 50, 37000),
('c0000030-0000-0000-0000-000000000030', 'SKU-CP05', 'Strawless Lid PET 93mm (Isi 100)', 'Kemasan', 'pack', 35, 34000),
('c0000031-0000-0000-0000-000000000031', 'SKU-ST01', 'Sedotan Kertas Steril 6mm (Isi 250)', 'Kemasan', 'pack', 25, 22000),
('c0000032-0000-0000-0000-000000000032', 'SKU-ST02', 'Sedotan Boba Runcing Steril (Isi 100)', 'Kemasan', 'pack', 25, 18000),
('c0000033-0000-0000-0000-000000000033', 'SKU-PK01', 'Paper Bag Takeaway Medium Kraft (Isi 50)', 'Kemasan', 'pack', 30, 48000),
('c0000034-0000-0000-0000-000000000034', 'SKU-PK02', 'Cup Tray Holder 2-Cups (Isi 100)', 'Kemasan', 'pack', 20, 35000),

-- Kategori: Makanan & Pastry (Food)
('c0000035-0000-0000-0000-000000000035', 'SKU-SN01', 'Butter Croissant Dough Frozen (Isi 20)', 'Makanan', 'box', 10, 145000),
('c0000036-0000-0000-0000-000000000036', 'SKU-SN02', 'Pain Au Chocolat Frozen (Isi 20)', 'Makanan', 'box', 10, 160000),
('c0000037-0000-0000-0000-000000000037', 'SKU-SN03', 'Fudgy Brownie Bites Box', 'Makanan', 'box', 12, 110000),

-- Kategori: Peralatan Kebersihan & Sanitasi
('c0000038-0000-0000-0000-000000000038', 'SKU-CL01', 'Espresso Machine Cleaning Powder Cafiza 900g', 'Sanitasi', 'botol', 6, 175000),
('c0000039-0000-0000-0000-000000000039', 'SKU-CL02', 'Hand Sanitizer Food Grade 5L', 'Sanitasi', 'jerigen', 5, 110000),
('c0000040-0000-0000-0000-000000000040', 'SKU-CL03', 'Sarung Tangan Nitrile Hitam Barista (Isi 100)', 'Sanitasi', 'box', 10, 68000);

-- ============================================================================
-- 6. INVENTORY REAL-TIME (LOCATION_STOCKS)
-- Kombinasi stok Gudang Pusat & Cabang, termasuk beberapa yang LOW STOCK
-- ============================================================================
INSERT INTO public.location_stocks (location_id, item_id, quantity) VALUES
-- Stok Gudang Pusat (WH-PUSAT)
('11111111-1111-1111-1111-111111111111', 'c0000001-0000-0000-0000-000000000001', 180),
('11111111-1111-1111-1111-111111111111', 'c0000002-0000-0000-0000-000000000002', 240),
('11111111-1111-1111-1111-111111111111', 'c0000003-0000-0000-0000-000000000003', 110),
('11111111-1111-1111-1111-111111111111', 'c0000004-0000-0000-0000-000000000004', 320),
('11111111-1111-1111-1111-111111111111', 'c0000005-0000-0000-0000-000000000005', 4),  -- [LOW STOCK ALERT: min 10]
('11111111-1111-1111-1111-111111111111', 'c0000006-0000-0000-0000-000000000006', 150),
('11111111-1111-1111-1111-111111111111', 'c0000007-0000-0000-0000-000000000007', 8),  -- [LOW STOCK ALERT: min 15]
('11111111-1111-1111-1111-111111111111', 'c0000008-0000-0000-0000-000000000008', 45),
('11111111-1111-1111-1111-111111111111', 'c0000009-0000-0000-0000-000000000009', 60),
('11111111-1111-1111-1111-111111111111', 'c0000010-0000-0000-0000-000000000010', 50),
('11111111-1111-1111-1111-111111111111', 'c0000011-0000-0000-0000-000000000011', 5),  -- [LOW STOCK ALERT: min 10]
('11111111-1111-1111-1111-111111111111', 'c0000012-0000-0000-0000-000000000012', 35),
('11111111-1111-1111-1111-111111111111', 'c0000013-0000-0000-0000-000000000013', 40),
('11111111-1111-1111-1111-111111111111', 'c0000014-0000-0000-0000-000000000014', 28),
('11111111-1111-1111-1111-111111111111', 'c0000015-0000-0000-0000-000000000015', 3),  -- [LOW STOCK ALERT: min 6]
('11111111-1111-1111-1111-111111111111', 'c0000016-0000-0000-0000-000000000016', 22),
('11111111-1111-1111-1111-111111111111', 'c0000017-0000-0000-0000-000000000017', 18),
('11111111-1111-1111-1111-111111111111', 'c0000018-0000-0000-0000-000000000018', 42),
('11111111-1111-1111-1111-111111111111', 'c0000019-0000-0000-0000-000000000019', 30),
('11111111-1111-1111-1111-111111111111', 'c0000020-0000-0000-0000-000000000020', 25),
('11111111-1111-1111-1111-111111111111', 'c0000021-0000-0000-0000-000000000021', 14),
('11111111-1111-1111-1111-111111111111', 'c0000022-0000-0000-0000-000000000022', 80),
('11111111-1111-1111-1111-111111111111', 'c0000023-0000-0000-0000-000000000023', 55),
('11111111-1111-1111-1111-111111111111', 'c0000024-0000-0000-0000-000000000024', 60),
('11111111-1111-1111-1111-111111111111', 'c0000025-0000-0000-0000-000000000025', 40),
('11111111-1111-1111-1111-111111111111', 'c0000026-0000-0000-0000-000000000026', 150),
('11111111-1111-1111-1111-111111111111', 'c0000027-0000-0000-0000-000000000027', 160),
('11111111-1111-1111-1111-111111111111', 'c0000028-0000-0000-0000-000000000028', 210),
('11111111-1111-1111-1111-111111111111', 'c0000029-0000-0000-0000-000000000029', 240),
('11111111-1111-1111-1111-111111111111', 'c0000030-0000-0000-0000-000000000030', 180),
('11111111-1111-1111-1111-111111111111', 'c0000031-0000-0000-0000-000000000031', 120),
('11111111-1111-1111-1111-111111111111', 'c0000032-0000-0000-0000-000000000032', 100),
('11111111-1111-1111-1111-111111111111', 'c0000033-0000-0000-0000-000000000033', 95),
('11111111-1111-1111-1111-111111111111', 'c0000034-0000-0000-0000-000000000034', 85),
('11111111-1111-1111-1111-111111111111', 'c0000035-0000-0000-0000-000000000035', 40),
('11111111-1111-1111-1111-111111111111', 'c0000036-0000-0000-0000-000000000036', 35),
('11111111-1111-1111-1111-111111111111', 'c0000037-0000-0000-0000-000000000037', 50),
('11111111-1111-1111-1111-111111111111', 'c0000038-0000-0000-0000-000000000038', 15),
('11111111-1111-1111-1111-111111111111', 'c0000039-0000-0000-0000-000000000039', 20),
('11111111-1111-1111-1111-111111111111', 'c0000040-0000-0000-0000-000000000040', 25),

-- Stok Cabang Pamulang (BR-PML)
('22222222-2222-2222-2222-222222222222', 'c0000001-0000-0000-0000-000000000001', 14),
('22222222-2222-2222-2222-222222222222', 'c0000004-0000-0000-0000-000000000004', 18),
('22222222-2222-2222-2222-222222222222', 'c0000006-0000-0000-0000-000000000006', 12),
('22222222-2222-2222-2222-222222222222', 'c0000011-0000-0000-0000-000000000011', 4), -- [LOW STOCK]
('22222222-2222-2222-2222-222222222222', 'c0000028-0000-0000-0000-000000000028', 15),
('22222222-2222-2222-2222-222222222222', 'c0000029-0000-0000-0000-000000000029', 22),

-- Stok Cabang BSD Serpong (BR-BSD)
('33333333-3333-3333-3333-333333333333', 'c0000001-0000-0000-0000-000000000001', 18),
('33333333-3333-3333-3333-333333333333', 'c0000004-0000-0000-0000-000000000004', 25),
('33333333-3333-3333-3333-333333333333', 'c0000006-0000-0000-0000-000000000006', 20),
('33333333-3333-3333-3333-333333333333', 'c0000007-0000-0000-0000-000000000007', 5), -- [LOW STOCK]
('33333333-3333-3333-3333-333333333333', 'c0000022-0000-0000-0000-000000000022', 12);

-- ============================================================================
-- 7. TRANSAKSI PENGADAAN HULU (INBOUND ORDERS - PO DARI SUPPLIER)
-- ============================================================================
INSERT INTO public.inbound_orders (id, po_number, supplier_id, warehouse_id, status, notes, created_by, created_at) VALUES
('b0000001-0000-0000-0000-000000000001', 'PO-20261101-001', 'aaaa1111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'Diterima', 'Restock biji kopi rutin awal bulan', '70000002-0000-0000-0000-000000000002', NOW() - INTERVAL '5 days'),
('b0000002-0000-0000-0000-000000000002', 'PO-20261105-002', 'aaaa3333-3333-3333-3333-333333333333', '11111111-1111-1111-1111-111111111111', 'Diterima', 'Pengadaan susu segar & oat milk', '70000002-0000-0000-0000-000000000002', NOW() - INTERVAL '3 days'),
('b0000003-0000-0000-0000-000000000003', 'PO-20261110-003', 'bbbb2222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', 'Draft', 'PO kemasan cup cold & paperbag sedang diproses vendor', '70000002-0000-0000-0000-000000000002', NOW() - INTERVAL '1 days'),
('b0000004-0000-0000-0000-000000000004', 'PO-20261115-004', 'aaaa4444-4444-4444-4444-444444444444', '11111111-1111-1111-1111-111111111111', 'Draft', 'PO sirup monin dan powder matcha', '70000001-0000-0000-0000-000000000001', NOW());

INSERT INTO public.inbound_items (inbound_id, item_id, quantity, unit_cost) VALUES
('b0000001-0000-0000-0000-000000000001', 'c0000001-0000-0000-0000-000000000001', 50, 145000),
('b0000001-0000-0000-0000-000000000001', 'c0000004-0000-0000-0000-000000000004', 100, 120000),
('b0000002-0000-0000-0000-000000000002', 'c0000006-0000-0000-0000-000000000006', 40, 185000),
('b0000002-0000-0000-0000-000000000002', 'c0000007-0000-0000-0000-000000000007', 20, 295000),
('b0000003-0000-0000-0000-000000000003', 'c0000029-0000-0000-0000-000000000029', 80, 37000),
('b0000003-0000-0000-0000-000000000003', 'c0000033-0000-0000-0000-000000000033', 50, 48000),
('b0000004-0000-0000-0000-000000000004', 'c0000012-0000-0000-0000-000000000012', 15, 138000),
('b0000004-0000-0000-0000-000000000004', 'c0000017-0000-0000-0000-000000000017', 10, 225000);

-- ============================================================================
-- 8. TRANSAKSI DISTRIBUSI HILIR (DISTRIBUTION ORDERS - DO KE CABANG)
-- ============================================================================
INSERT INTO public.distribution_orders (id, do_number, from_warehouse_id, to_branch_id, status, driver_name, notes, created_by, created_at) VALUES
('d0000001-0000-0000-0000-000000000001', 'DO-20261102-001', '11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', 'Diterima', 'Pak Joko (Van B 1234 SCM)', 'Distribusi stok mingguan Pamulang', '70000002-0000-0000-0000-000000000002', NOW() - INTERVAL '4 days'),
('d0000002-0000-0000-0000-000000000002', 'DO-20261104-002', '11111111-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333333', 'Diterima', 'Pak Slamet (Blindvan B 5678 SCM)', 'Supply kopi blend & cup BSD', '70000002-0000-0000-0000-000000000002', NOW() - INTERVAL '2 days'),
('d0000003-0000-0000-0000-000000000003', 'DO-20261108-003', '11111111-1111-1111-1111-111111111111', '44444444-4444-4444-4444-444444444444', 'Dikirim', 'Pak Bambang (Blindvan B 9012 SCM)', 'Pengiriman bahan baku Bintaro menuju lokasi', '70000002-0000-0000-0000-000000000002', NOW() - INTERVAL '5 hours'),
('d0000004-0000-0000-0000-000000000004', 'DO-20261112-004', '11111111-1111-1111-1111-111111111111', '55555555-5555-5555-5555-555555555555', 'Pending', 'Armada Logistik Pusat', 'Rencana kirim Tebet sore ini', '70000001-0000-0000-0000-000000000001', NOW() - INTERVAL '1 hours');

INSERT INTO public.distribution_items (distribution_id, item_id, quantity) VALUES
('d0000001-0000-0000-0000-000000000001', 'c0000001-0000-0000-0000-000000000001', 10),
('d0000001-0000-0000-0000-000000000001', 'c0000006-0000-0000-0000-000000000006', 8),
('d0000002-0000-0000-0000-000000000002', 'c0000004-0000-0000-0000-000000000004', 15),
('d0000002-0000-0000-0000-000000000002', 'c0000029-0000-0000-0000-000000000029', 20),
('d0000003-0000-0000-0000-000000000003', 'c0000001-0000-0000-0000-000000000001', 8),
('d0000003-0000-0000-0000-000000000003', 'c0000011-0000-0000-0000-000000000011', 5),
('d0000004-0000-0000-0000-000000000004', 'c0000004-0000-0000-0000-000000000004', 20),
('d0000004-0000-0000-0000-000000000004', 'c0000007-0000-0000-0000-000000000007', 10);

-- ============================================================================
-- 9. LOG AUDIT MUTASI STOK (STOCK MOVEMENTS RECORD)
-- ============================================================================
INSERT INTO public.stock_movements (location_id, item_id, type, quantity, reference_no, description, created_at) VALUES
('11111111-1111-1111-1111-111111111111', 'c0000001-0000-0000-0000-000000000001', 'IN', 50, 'PO-20261101-001', 'Penerimaan barang dari supplier PT Agro Nusantara Makmur', NOW() - INTERVAL '5 days'),
('11111111-1111-1111-1111-111111111111', 'c0000004-0000-0000-0000-000000000004', 'IN', 100, 'PO-20261101-001', 'Penerimaan barang dari supplier PT Agro Nusantara Makmur', NOW() - INTERVAL '5 days'),
('11111111-1111-1111-1111-111111111111', 'c0000006-0000-0000-0000-000000000006', 'IN', 40, 'PO-20261105-002', 'Penerimaan susu segar PT Sukanda Dairy Sejahtera', NOW() - INTERVAL '3 days'),
('11111111-1111-1111-1111-111111111111', 'c0000001-0000-0000-0000-000000000001', 'OUT', 10, 'DO-20261102-001', 'Pengiriman distribusi ke Cabang Pamulang', NOW() - INTERVAL '4 days'),
('22222222-2222-2222-2222-222222222222', 'c0000001-0000-0000-0000-000000000001', 'IN', 10, 'DO-20261102-001', 'Penerimaan distribusi dari Gudang Pusat Tangerang', NOW() - INTERVAL '4 days'),
('11111111-1111-1111-1111-111111111111', 'c0000004-0000-0000-0000-000000000004', 'OUT', 15, 'DO-20261104-002', 'Pengiriman distribusi ke Cabang BSD Serpong', NOW() - INTERVAL '2 days'),
('33333333-3333-3333-3333-333333333333', 'c0000004-0000-0000-0000-000000000004', 'IN', 15, 'DO-20261104-002', 'Penerimaan distribusi dari Gudang Pusat Tangerang', NOW() - INTERVAL '2 days'),
('11111111-1111-1111-1111-111111111111', 'c0000001-0000-0000-0000-000000000001', 'OUT', 8, 'DO-20261108-003', 'Pengiriman distribusi ke Cabang Bintaro Jaya (In Transit)', NOW() - INTERVAL '5 hours');

