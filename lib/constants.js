export const CATEGORIES = [
  { id: "switches", label: "Switches & Sockets" },
  { id: "mcb", label: "MCB & Protection" },
  { id: "db", label: "Distribution Boards" },
  { id: "wiring", label: "Wiring Devices" },
  { id: "cabletray", label: "Cable Trays & Trunking" },
  { id: "lighting", label: "Lighting Accessories" },
];

export const CLIENTS = [
  "Emirates NBD Bank", "Four Seasons Hotel", "TCIL", "Saudi Railways", "Al Rajhi",
  "Hellmann Worldwide Logistics", "SIG Group of Companies", "Baud Telecom Company",
  "Trans Telecom Company", "Ebttikar Technology", "Al Arab Contracting Co", "Madaf Contracting Co",
];

export const PARTNERS = [
  { name: "Hikvision", type: "Technology Partner", focus: "CCTV & video surveillance hardware" },
  { name: "Honeywell", type: "Technology Partner", focus: "Fire detection & building automation" },
  { name: "Schneider Electric", type: "Manufacturing Partner", focus: "Switchgear, MCBs & distribution boards" },
  { name: "Legrand", type: "Manufacturing Partner", focus: "Switches, sockets & wiring accessories" },
  { name: "HID Global", type: "Technology Partner", focus: "Access control & identity systems" },
  { name: "Bosch Security", type: "Technology Partner", focus: "PA/VA & intrusion detection systems" },
  { name: "Panduit", type: "Manufacturing Partner", focus: "Structured cabling & cable management" },
  { name: "APC by Schneider", type: "Technology Partner", focus: "UPS & power backup systems" },
];

export const CAREERS = [
  { title: "Site Electrical Engineer", location: "Riyadh, Saudi Arabia", type: "Full-time", desc: "Lead on-site installation and commissioning for ELV and electrical accessory projects." },
  { title: "CCTV & Access Control Technician", location: "Riyadh, Saudi Arabia", type: "Full-time", desc: "Install, configure, and maintain CCTV and access control systems across client sites." },
  { title: "Sales Engineer — ELV Systems", location: "Kollam, India", type: "Full-time", desc: "Scope client requirements and prepare technical proposals for ELV and electrical projects." },
  { title: "Warehouse & Logistics Coordinator", location: "Riyadh, Saudi Arabia", type: "Full-time", desc: "Manage stock movement, dispatch scheduling, and inventory accuracy for the accessories catalog." },
  { title: "BOQ & Estimation Engineer", location: "Kollam, India", type: "Full-time", desc: "Prepare bills of quantities and cost estimates for bulk and project-scale orders." },
];

export const fmt = (n) => "SAR " + Number(n).toLocaleString("en-US");

export function parseBranches(text) {
  return (text || "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [country, address, phone] = line.split("|").map((s) => (s || "").trim());
      return { country, address, phone };
    });
}

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://maxgen.com.sa";
export const COMPANY_EMAIL = "support@maxgen.com.sa";
