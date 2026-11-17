// Uso: npm run db:reset [-- --yes]
// Borra datos de public (salvo roles), todos los usuarios de Auth y los archivos del bucket donations.
import { createClient } from "@supabase/supabase-js";
import { createInterface } from "node:readline/promises";
import { pathToFileURL } from "node:url";

const BUCKET = "donations";

export function createAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    console.error("Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en .env");
    process.exit(1);
  }
  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

async function confirm() {
  if (process.argv.includes("--yes")) return;
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  const answer = await rl.question(
    `Se van a borrar TODOS los datos y usuarios de ${process.env.NEXT_PUBLIC_SUPABASE_URL}. ¿Continuar? (s/N) `
  );
  rl.close();
  if (answer.trim().toLowerCase() !== "s") {
    console.log("Cancelado.");
    process.exit(0);
  }
}

function check(label, { error }) {
  if (error) throw new Error(`${label}: ${error.message}`);
}

// Orden por FK: hijos antes que padres. PostgREST exige un filtro en delete.
const TABLES = [
  ["notification_reads", "user_id"],
  ["notifications", "id"],
  ["donations", "id"],
  ["campaigns", "id"],
  ["donors", "id"],
  ["institutions", "id"],
  ["user_roles", "id"],
  ["users", "id"],
  ["guest_tokens", "id"],
];

async function clearTables(supabase) {
  for (const [table, column] of TABLES) {
    check(`Borrando ${table}`, await supabase.from(table).delete().not(column, "is", null));
  }
}

async function clearAuthUsers(supabase) {
  for (;;) {
    const { data, error } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1000 });
    if (error) throw error;
    if (data.users.length === 0) return;
    for (const user of data.users) {
      check(`Borrando usuario ${user.email}`, await supabase.auth.admin.deleteUser(user.id));
    }
  }
}

async function clearBucket(supabase) {
  for (;;) {
    const { data, error } = await supabase.storage.from(BUCKET).list("", { limit: 1000 });
    if (error) throw error;
    const files = data.filter((f) => f.id !== null).map((f) => f.name);
    if (files.length === 0) return;
    check("Borrando archivos", await supabase.storage.from(BUCKET).remove(files));
  }
}

export async function resetDatabase(supabase) {
  await confirm();
  await clearTables(supabase);
  console.log("✓ Tablas vaciadas (se conserva roles)");
  await clearAuthUsers(supabase);
  console.log("✓ Usuarios de Auth borrados");
  await clearBucket(supabase);
  console.log(`✓ Bucket ${BUCKET} vaciado`);
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  resetDatabase(createAdmin()).catch((error) => {
    console.error(error.message ?? error);
    process.exit(1);
  });
}
