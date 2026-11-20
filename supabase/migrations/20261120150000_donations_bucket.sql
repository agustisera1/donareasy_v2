-- Bucket de adjuntos de donaciones, versionado (D4). Storage aplica tamaño y MIME aunque el cliente
-- suba directo con una URL firmada. Ref: Supabase "Storage buckets" y "Upload to a signed URL".
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('donations', 'donations', true, 5242880, array['image/png', 'image/jpeg', 'image/webp'])
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;
