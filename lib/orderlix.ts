import { createClient } from "@supabase/supabase-js";

// Orderlix Supabase 连接（服务端使用）
export const orderlix = createClient(
  process.env.ORDERLIX_SUPABASE_URL!,
  process.env.ORDERLIX_SUPABASE_ANON_KEY!
);

export const TENANT_ID = process.env.ORDERLIX_TENANT_ID!;
