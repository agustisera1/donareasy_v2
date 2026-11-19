// Uso: node --env-file=.env scripts/create-dev-user.mjs <email> [password]
// Crea una cuenta ya confirmada vía Admin API (sin mails ni rate limit), lista para el onboarding.
import { createClient } from "@supabase/supabase-js";

const [email, password = "demo1234"] = process.argv.slice(2);
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!email || !url || !serviceRoleKey) {
  console.error(
    "Uso: node --env-file=.env scripts/create-dev-user.mjs <email> [password]\n" +
      "Requiere NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY."
  );
  process.exit(1);
}

const supabase = createClient(url, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const { error } = await supabase.auth.admin.createUser({
  email,
  password,
  email_confirm: true,
});
if (error) {
  console.error(`Error: ${error.message}`);
  process.exit(1);
}
console.log(`Cuenta creada: ${email} / ${password}`);
