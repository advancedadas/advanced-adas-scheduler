import { createClient } from '@supabase/supabase-js';
import fs from 'fs/promises';
import path from 'path';

const useSupabase = process.env.STORAGE_DRIVER === 'supabase';
const bucket = process.env.SUPABASE_BUCKET || 'job-photos';

function getSupabaseClient() {
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required when STORAGE_DRIVER=supabase');
  }
  return createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false }
  });
}

export async function persistUploadedPhoto(file) {
  if (!useSupabase) {
    return {
      filename: file.filename,
      url: `/uploads/${file.filename}`,
      storageProvider: 'local'
    };
  }

  const supabase = getSupabaseClient();
  const ext = path.extname(file.originalname).toLowerCase();
  const objectKey = `jobs/${Date.now()}-${cryptoRandom()}${ext}`;
  const buffer = await fs.readFile(file.path);

  const { error } = await supabase.storage.from(bucket).upload(objectKey, buffer, {
    contentType: file.mimetype,
    upsert: false
  });
  if (error) throw error;

  await fs.unlink(file.path).catch(() => null);

  const { data } = supabase.storage.from(bucket).getPublicUrl(objectKey);
  return {
    filename: objectKey,
    url: data.publicUrl,
    storageProvider: 'supabase'
  };
}

function cryptoRandom() {
  return Math.random().toString(36).slice(2) + '-' + Date.now().toString(36);
}
