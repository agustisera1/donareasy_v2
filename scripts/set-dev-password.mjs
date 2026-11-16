// Uso: node --env-file=.env scripts/set-dev-password.mjs <email>
// Cambia la contraseña de una cuenta existente vía Admin API, sin enviar emails.
import { createClient } from "@supabase/supabase-js";
import { createInterface } from "node:readline/promises";

const email = process.argv[2];
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!email || !url || !serviceRoleKey) {
  console.error(
    "Uso: node --env-file=.env scripts/set-dev-password.mjs <email>\n" +
      "Requiere NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY."
  );
  process.exit(1);
}

const supabase = createClient(url, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function findUserByEmail(target) {
  for (let page = 1; ; page++) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: 1000 });
    if (error) throw error;
    const user = data.users.find((u) => u.email?.toLowerCase() === target.toLowerCase());
    if (user || data.users.length < 1000) return user;
  }
}

const user = await findUserByEmail(email);
if (!user) {
  console.error(`No existe un usuario con email ${email}.`);
  process.exit(1);
}

const rl = createInterface({ input: process.stdin, output: process.stdout });
const password = await rl.question("Nueva contraseña (mín. 6 caracteres): ");
rl.close();

if (password.length < 6) {
  console.error("La contraseña debe tener al menos 6 caracteres.");
  process.exit(1);
}

const { error } = await supabase.auth.admin.updateUserById(user.id, {
  password,
  email_confirm: true,
});
if (error) {
  console.error(`Error: ${error.message}`);
  process.exit(1);
}
console.log(`Contraseña actualizada para ${email}.`);
