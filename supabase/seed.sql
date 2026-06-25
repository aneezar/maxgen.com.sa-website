-- ============================================================
-- MAXGEN — Seed data
-- Run AFTER schema.sql, once, to populate the catalog.
-- Safe to re-run: uses ON CONFLICT to upsert rather than duplicate.
-- ============================================================

insert into products (id, cat, name, spec, price, stock, status, image) values
('MG-SW-216M','switches','16A Modular Switch — 2 Way','16A / 240V / White Modular',145,320,'active',null),
('MG-SW-SOC6','switches','6A Socket Outlet — 3 Pin','6A / 240V / Shuttered',95,410,'active',null),
('MG-SW-DIM1','switches','Dimmer Switch — 400W','400W / Rotary / Modular',380,88,'active',null),
('MG-SW-USB2','switches','USB Charger Socket — Dual Port','2.4A / 5V Dual USB + Socket',540,64,'active',null),
('MG-MCB-C32','mcb','MCB Single Pole 32A','32A / C-Curve / 240V',210,260,'active',null),
('MG-MCB-RCCB','mcb','RCCB 4 Pole 40A','40A / 30mA / 4 Pole',2450,42,'active',null),
('MG-MCB-ISO','mcb','Isolator Switch 63A','63A / 4 Pole / DIN Rail',890,58,'active',null),
('MG-MCB-SPD','mcb','Surge Protection Device Type 2','Type 2 / 40kA / 1 Pole',3200,19,'low',null),
('MG-DB-4WSP','db','Distribution Board — 4 Way SP','4 Way / Single Phase / Metal Body',1150,75,'active',null),
('MG-DB-8WSP','db','Distribution Board — 8 Way SP','8 Way / Single Phase / Metal Body',1850,51,'active',null),
('MG-DB-12WTP','db','Distribution Board — 12 Way TP','12 Way / Three Phase / IP43',4650,22,'active',null),
('MG-DB-MET','db','Energy Meter Box — Single Phase','Single Phase / Tamper-Proof Seal',980,60,'active',null),
('MG-WD-CONN','wiring','Wire Connector Strip — 12 Way','12 Way / 32A / Screwless',120,380,'active',null),
('MG-WD-CT16','wiring','Conduit Pipe — 25mm PVC','25mm / PVC / 3m Length',165,500,'active',null),
('MG-WD-GLBOX','wiring','Junction Box — Concealed','75x75mm / PVC / Concealed',60,620,'active',null),
('MG-WD-TERM','wiring','Terminal Block — 10 Way','10 Way / 30A / DIN Mount',230,144,'active',null),
('MG-CT-50P','cabletray','Perforated Cable Tray — 50mm','50mm / GI / 3m Length',480,90,'active',null),
('MG-CT-100T','cabletray','PVC Trunking — 100x50mm','100x50mm / 2m Length / White',620,70,'active',null),
('MG-CT-LADD','cabletray','Cable Ladder — 300mm','300mm / Hot-Dip Galvanised',1450,28,'low',null),
('MG-LT-LEDDR','lighting','LED Driver — 24W Constant Voltage','24W / 12VDC / IP20',320,130,'active',null),
('MG-LT-PIRSEN','lighting','PIR Motion Sensor Switch','10A / Ceiling Mount / 360°',480,96,'active',null),
('MG-LT-EMRG','lighting','Emergency Light Conversion Kit','3hr Backup / LED Driver Inline',750,54,'active',null)
on conflict (id) do update set
  cat = excluded.cat, name = excluded.name, spec = excluded.spec,
  price = excluded.price, stock = excluded.stock, status = excluded.status;

insert into services (slug, division, category, title, description, detail, image, sort_order) values
('ict-services','Enterprise Networking',null,'Information & Communication Technology (ICT)','Network design, automation, IoT, and managed ICT services — under one roof.','Maxgen''s ICT practice covers the full range of network and connected-systems work: structured LAN/WAN design and deployment, managed connectivity and IT support contracts, sensor-driven automation, and IoT integration that ties occupancy, temperature, and energy sensors into a single monitoring layer. Rather than treating networking and automation as separate scopes, we plan capacity and connected-device integration together from day one. We stay on as a managed-services partner after handover, covering ongoing support, monitoring, and automation tuning.','https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=1200&q=85&auto=format&fit=crop',1),

('cctv-surveillance','Low Current Systems',null,'CCTV / Security Surveillance','IP and analog camera systems, NVRs, and video management software for sites of any scale.','From a single-building retail site to a multi-tower campus, we design camera coverage around actual sightlines and risk areas, not just camera count. Our CCTV packages include IP and analog cameras, NVR storage sized for your retention policy, and video management software with remote viewing.','https://images.unsplash.com/photo-1557597774-9d273605dfa9?w=1200&q=85&auto=format&fit=crop',1),
('access-control','Low Current Systems',null,'Access Control Systems','Card, biometric, and mobile-credential access control from single doors to full campuses.','Access control should match the building it protects. We scope, supply, and commission access control hardware and software from single-door readers through multi-tenant biometric systems tied into visitor management workflows.','https://images.unsplash.com/photo-1633265486064-086b219458ec?w=1200&q=85&auto=format&fit=crop',2),
('fire-suppression','Low Current Systems',null,'Automatic Fire Search & Suppression','Addressable and conventional fire detection paired with automatic suppression systems.','Fire systems are not optional infrastructure. We supply and integrate addressable and conventional fire panels, detection devices, and automatic suppression systems engineered to local fire code, with documented commissioning for compliance records.','https://images.unsplash.com/photo-1582139329536-e7284fece509?w=1200&q=85&auto=format&fit=crop',3),
('intrusion-alarms','Low Current Systems',null,'Intrusion & Burglar Alarm Systems','Perimeter and zone-based intrusion detection with monitored alarm reporting.','Perimeter detection, zone-based interior sensors, and monitored alarm reporting catch an intrusion early rather than after the fact. We design intrusion systems around a site''s actual entry points and blind spots.','https://images.unsplash.com/photo-1558002038-1991dbe93b9f?w=1200&q=85&auto=format&fit=crop',4),
('pa-va','Low Current Systems',null,'Public Address & Voice Evacuation (PA/VA)','Life-safety announcement and general paging systems for commercial and industrial buildings.','A PA/VA system has two jobs: everyday paging and clear evacuation instructions during an emergency. We design zoned audio coverage and integrate voice evacuation controllers so the right message reaches the right zone, every time.','https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=1200&q=85&auto=format&fit=crop',5),
('nurse-call','Low Current Systems',null,'Nurse Call & Intercom Systems','Nurse call stations and intercom networks for healthcare and institutional facilities.','In healthcare and institutional settings, response time matters. We install nurse call stations and intercom networks that route a request to the right staff member quickly, with call logging.','https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=1200&q=85&auto=format&fit=crop',6),
('ups-cbs','Low Current Systems',null,'UPS & Central Battery Systems (CBS)','Backup power and central battery systems supporting emergency lighting and critical loads.','When grid power fails, emergency lighting and critical loads can''t wait for a generator to spin up. We supply and install UPS units and central battery systems sized to your emergency load.','https://images.unsplash.com/photo-1620714223084-d4dc9962e7e3?w=1200&q=85&auto=format&fit=crop',7),
('industrial-security','Low Current Systems',null,'Industrial Security','Safeguarding industrial assets and critical infrastructure with layered security systems.','Industrial sites carry risks a typical commercial building doesn''t. We layer CCTV, access control, and intrusion detection into a single security plan built around how the facility actually operates.','https://images.unsplash.com/photo-1565514020179-026b92b2ed33?w=1200&q=85&auto=format&fit=crop',8),
('master-clock','Low Current Systems',null,'Master Clock Systems','Centralized time synchronization for institutional and industrial facilities.','Schools, hospitals, and industrial facilities often need every clock on site synchronized. We install master clock systems that drive subordinate clocks across a building or campus from one source.','https://images.unsplash.com/photo-1495364141860-b0d03eccd065?w=1200&q=85&auto=format&fit=crop',9),
('metal-detection','Low Current Systems',null,'Metal Detection Systems','Walk-through and handheld metal detection for security checkpoints.','Walk-through frames and handheld wands serve different checkpoint needs. We supply and calibrate both, matched to the sensitivity and footfall a checkpoint actually sees.','https://images.unsplash.com/photo-1556742212-5b321f3c261b?w=1200&q=85&auto=format&fit=crop',10),
('parking-management','Low Current Systems',null,'Parking Management Systems','Automated entry, guidance, and payment systems for parking facilities.','Automated barriers, license-plate recognition, guidance signage, and payment terminals turn a parking facility into a system that moves vehicles through on its own.','https://images.unsplash.com/photo-1573348722427-f1d6819fdf98?w=1200&q=85&auto=format&fit=crop',11),
('queue-management','Low Current Systems',null,'Queue Management Systems','Ticketing and queue-routing systems to streamline customer service flow.','Ticket kiosks, counter displays, and queue-routing logic reduce the perceived wait at a service counter. We deploy these systems for banks, government centers, and retail counters.','https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=1200&q=85&auto=format&fit=crop',12),
('renewable-energy','Low Current Systems',null,'Renewable Energy','Solar and renewable energy system design and integration.','Solar installations need to be sized against real load profiles. We design and integrate renewable energy systems for commercial and industrial sites looking to offset grid consumption.','https://images.unsplash.com/photo-1509391366360-2e959784a276?w=1200&q=85&auto=format&fit=crop',13),

('bms-systems','ELV (Extra Low Voltage)','ELV / Automation / Control Systems','Building Management System (BMS)','Centralized HVAC control and energy management under ELV / Building Automation.','A Building Management System gives one control layer over everything that consumes energy in a building. Our BMS scope centers on HVAC Control Systems — scheduling, zoning, and fault monitoring for chillers, AHUs, and VAV boxes — and Energy Management Systems — sub-metering, consumption trend reporting, and automated load shedding.','https://images.unsplash.com/photo-1652145595413-0a79398e5888?w=1200&q=85&auto=format&fit=crop',1),
('fire-alarm-system','ELV (Extra Low Voltage)','ELV / Life Safety Systems','Fire Alarm System (FA)','Addressable fire detection and alarm reporting under ELV / Life Safety Systems.','As a life-safety system, fire alarm design has no margin for ambiguity. We design, supply, and commission addressable Fire Alarm Systems covering detection devices, control panels, sounders, and interface modules, with full commissioning documentation.','https://images.unsplash.com/photo-1743698205310-cd814a95afab?w=1200&q=85&auto=format&fit=crop',2),

('telecom-solutions','Telecom Division',null,'Telecom Solutions','End-to-end telecommunications infrastructure design and deployment.','From backbone infrastructure to last-mile connectivity, we design and deploy telecommunications systems for commercial and institutional clients, coordinating with carriers and equipment vendors.','https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?w=1200&q=85&auto=format&fit=crop',1),
('ip-pbx','Telecom Division',null,'IP PBX / PABX Systems','Business telephony systems built around modern IP PBX platforms.','Modern business telephony runs on IP rather than legacy copper lines. We supply, configure, and commission IP PBX/PABX systems with the extensions, call routing, and voicemail setup a business needs.','https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1200&q=85&auto=format&fit=crop',2),

('mep-services','MEP Division',null,'Mechanical, Electrical & Plumbing','MEP design and execution support for building and infrastructure projects.','Our MEP division supports the mechanical, electrical, and plumbing scopes of building and infrastructure projects, working alongside our ELV and networking teams.','https://images.unsplash.com/photo-1581094288338-2314dddb7ece?w=1200&q=85&auto=format&fit=crop',1),
('hvac-systems','MEP Division',null,'HVAC Systems','Heating, ventilation, and air conditioning design, supply, and installation for commercial buildings.','We design, supply, and install HVAC systems matched to a building''s actual heat load and occupancy pattern, covering chillers, AHUs, ductwork, and zone controls.','https://images.unsplash.com/photo-1631545806609-9555ddc4f6d0?w=1200&q=85&auto=format&fit=crop',2),
('electrical-works','MEP Division',null,'Electrical Works','Power wiring, panel installation, and electrical fit-out for commercial and industrial sites.','Our electrical works team handles full site electrical fit-out — containment, wiring, panel boards, distribution, and final connections — built to the load schedule.','https://images.unsplash.com/photo-1621905251918-48416bd8575a?w=1200&q=85&auto=format&fit=crop',3),
('grounding-system','MEP Division',null,'Grounding System','Earthing pits, bonding, and ground resistance testing to protect equipment and people.','A grounding system gives fault current a deliberate, low-resistance path into the earth. We design earthing pits and bonding networks sized to measured soil resistivity, followed by documented ground resistance testing.','https://images.unsplash.com/photo-1576446470246-499c738d1c8e?w=1200&q=85&auto=format&fit=crop',4),
('lightning-protection','MEP Division',null,'Lightning Protection System','Air terminals, down conductors, and earth termination to shield structures from direct strikes.','We design and install lightning protection systems — air terminals, down conductors, and earth termination — designed to recognized strike-risk standards rather than a one-size-fits-all rod on the roof.','https://images.unsplash.com/photo-1427507791254-e8d2fe7db7c0?w=1200&q=85&auto=format&fit=crop',5)

on conflict (slug) do update set
  division = excluded.division, category = excluded.category, title = excluded.title,
  description = excluded.description, detail = excluded.detail, image = excluded.image,
  sort_order = excluded.sort_order;

update site_content set data = '{
  "heroTag": "Electrical Catalog · Live Inventory",
  "heroTitle": "Switches, breakers, boards, and wiring — stocked and ready to ship.",
  "heroBody": "Maxgen supplies modular switches, MCBs, distribution boards, wiring devices, cable trays, and lighting accessories — sourced for spec, not guesswork.",
  "aboutTitle": "Built for the people who wire buildings.",
  "aboutBody": "Maxgen grew out of more than a decade of hands-on systems integration work across networking, ELV, telecom, and MEP disciplines.\n\nWe''ve supplied and supported projects across banking, hospitality, logistics, telecom, healthcare, education, and industrial sectors.\n\nWe work directly with installers on bulk and project-scale orders, with BOQ support and staged dispatch for phased site work.",
  "statSkus": "2,500+",
  "statYears": "10+",
  "statDispatch": "2–4 Days",
  "contactAddress": "Building No. 2613, Al-Malaz, Salah Ad Din Al Ayyubi Rd, Riyadh 12841, Saudi Arabia",
  "contactPhone": "+966 2920 7699",
  "contactEmail": "info@maxgen.com.sa",
  "branches": "India | Kollam, Kerala, India | Add phone number in Admin\nSaudi Arabia | Building No. 2613, Al-Malaz, Salah Ad Din Al Ayyubi Rd, Riyadh 12841 | +966 2920 7699\nUnited Kingdom | Add address in Admin | Add phone number in Admin\nUnited States | Add address in Admin | Add phone number in Admin"
}'::jsonb
where id = 1;

insert into customers (name, sector, note, sort_order) values
('Emirates NBD Bank', 'Banking & Finance', 'Branch security and structured cabling rollout.', 1),
('Four Seasons Hotel', 'Hospitality', 'CCTV, access control, and AV integration.', 2),
('TCIL', 'Telecom', 'Telecom infrastructure supply and support.', 3),
('Saudi Railways', 'Transportation', 'Station security and PA/VA systems.', 4),
('Al Rajhi', 'Banking & Finance', 'Multi-branch access control deployment.', 5),
('Hellmann Worldwide Logistics', 'Logistics', 'Warehouse CCTV and perimeter security.', 6),
('SIG Group of Companies', 'Industrial', 'Electromechanical and power distribution works.', 7),
('Baud Telecom Company', 'Telecom', 'Structured cabling and network infrastructure.', 8),
('Trans Telecom Company', 'Telecom', 'IP PBX and telecom systems integration.', 9),
('Ebttikar Technology', 'Technology', 'Smart building and automation systems.', 10),
('Al Arab Contracting Co', 'Construction', 'MEP and ELV coordination on commercial builds.', 11),
('Madaf Contracting Co', 'Construction', 'Fire detection and suppression installation.', 12);

insert into partners (name, type, focus, sort_order) values
('Hikvision', 'Technology Partner', 'CCTV & video surveillance hardware', 1),
('Honeywell', 'Technology Partner', 'Fire detection & building automation', 2),
('Schneider Electric', 'Manufacturing Partner', 'Switchgear, MCBs & distribution boards', 3),
('Legrand', 'Manufacturing Partner', 'Switches, sockets & wiring accessories', 4),
('HID Global', 'Technology Partner', 'Access control & identity systems', 5),
('Bosch Security', 'Technology Partner', 'PA/VA & intrusion detection systems', 6),
('Panduit', 'Manufacturing Partner', 'Structured cabling & cable management', 7),
('APC by Schneider', 'Technology Partner', 'UPS & power backup systems', 8);
