-- Sprint 3: brand, featured, applications columns
alter table products add column if not exists brand        text    default null;
alter table products add column if not exists featured     boolean default false;
alter table products add column if not exists applications text    default null;

-- Seed brand assignments
update products set brand = 'Legrand'            where id in ('MG-SW-216M','MG-SW-SOC6','MG-SW-DIM1','MG-SW-USB2','MG-WD-CONN','MG-WD-CT16','MG-WD-GLBOX','MG-WD-TERM');
update products set brand = 'Schneider Electric' where id in ('MG-MCB-C32','MG-MCB-RCCB','MG-MCB-ISO','MG-MCB-SPD','MG-DB-4WSP','MG-DB-8WSP','MG-DB-12WTP','MG-DB-MET');
update products set brand = 'Panduit'            where id in ('MG-CT-50P','MG-CT-100T','MG-CT-LADD');
update products set brand = 'Maxgen'             where id in ('MG-LT-LEDDR','MG-LT-PIRSEN','MG-LT-EMRG');

-- Mark featured products
update products set featured = true where id in ('MG-SW-SOC6','MG-MCB-C32','MG-MCB-RCCB','MG-DB-8WSP','MG-CT-LADD','MG-LT-EMRG');
