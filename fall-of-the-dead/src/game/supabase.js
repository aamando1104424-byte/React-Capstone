// Supabase
// One client for the whole game. It talks to the project with the publishable
// key, which is public by design: the Row Level Security rules in
// supabase/schema.sql decide what that key is allowed to touch.

import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!url || !key) {
    console.warn("Supabase is not configured. Copy .env.example to .env.local and fill it in.");
}

export const supabase = createClient(url || "http://localhost", key || "missing-key");
