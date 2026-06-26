-- Sprint 4: RFQ & Procurement Portal — quotes table + storage bucket
-- Run in: Supabase Dashboard → SQL Editor

create table if not exists quotes (
  id            text primary key,
  status        text not null default 'pending',
  contact_name  text not null,
  company       text,
  phone         text not null,
  email         text,
  project_ref   text,
  delivery_date date,
  notes         text,
  items         jsonb not null,
  subtotal      numeric not null,
  boq_url       text,
  admin_note    text,
  quoted_at     timestamptz,
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

alter table quotes enable row level security;
create policy "public insert quotes" on quotes for insert with check (true);
create policy "public read quotes"   on quotes for select using (true);
create policy "public update quotes" on quotes for update using (true);

-- Storage bucket for BOQ file uploads.
-- After running this SQL, also create the bucket manually in:
-- Supabase Dashboard → Storage → New bucket → Name: boq-uploads → Public: ON
-- Then add an INSERT policy for the anon role.
