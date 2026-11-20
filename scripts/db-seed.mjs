// Uso: npm run db:seed [-- --yes]
// Resetea la base y carga cuentas demo, campañas y donaciones con fechas relativas a hoy.
import { readFile } from "node:fs/promises";
import { createAdmin, resetDatabase } from "./db-reset.mjs";

const PASSWORD = "demo1234";
const BUCKET = "donations";
const ASSETS_DIR = new URL("./seed-assets/", import.meta.url);

const INSTITUTIONS = [
  {
    email: "hogar@demo.donareasy.com",
    profile: {
      name: "Hogar Santa Rita",
      director: "María Fernández",
      address: "Av. Colón 1234",
      province: "Córdoba",
      city: "Córdoba",
      phone: "3514567890",
      foundation_date: "1998-03-15",
      bank: "Banco de Córdoba",
      lore: "Hogar de niños y adolescentes en situación de vulnerabilidad.",
    },
  },
  {
    email: "comedor@demo.donareasy.com",
    profile: {
      name: "Comedor Los Peques",
      director: "Jorge Ramírez",
      address: "Calle 25 de Mayo 870",
      province: "Buenos Aires",
      city: "La Plata",
      phone: "2214433221",
      foundation_date: "2010-08-01",
      bank: "Banco Provincia",
      lore: "Comedor comunitario que brinda almuerzo y merienda a 120 chicos.",
    },
  },
];

const DONORS = [
  {
    email: "lucia@demo.donareasy.com",
    profile: {
      name: "Lucía",
      lastname: "Gómez",
      dni: 35123456,
      address: "Belgrano 456",
      province: "Córdoba",
      city: "Córdoba",
      phone: "3519876543",
    },
  },
  {
    email: "martin@demo.donareasy.com",
    profile: {
      name: "Martín",
      lastname: "Pérez",
      dni: 30987654,
      address: "Diagonal 74 1500",
      province: "Buenos Aires",
      city: "La Plata",
      phone: "2215556677",
    },
  },
];

const CAMPAIGNS = [
  ["Alimentos", "Necesitamos leche, fideos y arroz para las meriendas de la semana.", "200 kg"],
  ["Ropa", "Campaña de abrigo: camperas, buzos y frazadas para el invierno.", "150 prendas"],
  ["Útiles escolares", "Cuadernos, lápices y mochilas para el inicio de clases.", "80 kits"],
  ["Higiene", "Pañales, jabón, shampoo y pasta dental para los chicos del hogar.", "100 unidades"],
  ["Juguetes", "Juguetes en buen estado para el Día de las Infancias.", null],
  ["Calzado", "Zapatillas para chicos de 6 a 14 años, talles 28 a 40.", "60 pares"],
];

// La imagen sale de scripts/seed-assets/ (créditos en CREDITS.md).
const GOODS = [
  ["clothing", "Camperas de abrigo", "Camperas talle M y L en muy buen estado.", "camperas.jpg"],
  ["clothing", "Bolsa de ropa infantil", "Bodies y remeras de bebé, lavados y ordenados.", "ropa-infantil.jpg"],
  ["food", "Caja de alimentos no perecederos", "Conservas de arvejas, fideos y arroz.", "alimentos.jpg"],
  ["food", "Leche en polvo", "Diez latas de 800 g.", "leche-en-polvo.jpg"],
  ["supplies", "Útiles escolares", "Cuadernos, lápices de colores, tijera y plasticola.", "utiles.jpg"],
  ["supplies", "Pañales", "Tres paquetes de pañales descartables.", "panales.jpg"],
  ["other", "Juegos de mesa", "Varios juegos completos.", "juegos-de-mesa.jpg"],
  ["other", "Libros infantiles", "Una caja con 20 libros.", "libros.jpg"],
];

async function uploadAssets(supabase) {
  const urls = {};
  for (const [, , , file] of GOODS) {
    const body = await readFile(new URL(file, ASSETS_DIR));
    const path = `seed-${file}`;
    const { error } = await supabase.storage
      .from(BUCKET)
      .upload(path, body, { contentType: "image/jpeg", upsert: true });
    if (error) throw new Error(`Subiendo ${file}: ${error.message}`);
    urls[file] = supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
  }
  return urls;
}

const CANCELLATION_REASONS = [
  "No podemos recibir este tipo de donación por el momento.",
  "No hay espacio de almacenamiento disponible.",
  "El método de entrega no es viable para la institución.",
];

// PRNG con semilla fija: cada corrida genera los mismos datos.
let prngState = 42;
function random() {
  prngState = (prngState * 1103515245 + 12345) % 2 ** 31;
  return prngState / 2 ** 31;
}
const pick = (arr) => arr[Math.floor(random() * arr.length)];
const daysAgo = (days) => new Date(Date.now() - days * 86_400_000);
const isoDate = (date) => date.toISOString().split("T")[0];

async function getRoleIds(supabase) {
  const { data, error } = await supabase.from("roles").select("id, name");
  if (error) throw error;
  const byName = Object.fromEntries(data.map((r) => [r.name, r.id]));
  if (!byName.donor || !byName.institution) {
    throw new Error("La tabla roles debe tener 'donor' e 'institution'.");
  }
  return byName;
}

// El trigger handle_new_auth_user crea la fila de public.users.
async function createAccount(supabase, email, roleId) {
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password: PASSWORD,
    email_confirm: true,
  });
  if (error) throw new Error(`Creando ${email}: ${error.message}`);
  const userId = data.user.id;

  const roleResult = await supabase.from("user_roles").insert({ user_id: userId, role_id: roleId });
  if (roleResult.error) throw roleResult.error;
  const userResult = await supabase
    .from("users")
    .update({ onboarding_complete: true })
    .eq("id", userId);
  if (userResult.error) throw userResult.error;
  return userId;
}

async function insertReturningIds(supabase, table, rows) {
  const { data, error } = await supabase.from(table).insert(rows).select("id");
  if (error) throw new Error(`Insertando en ${table}: ${error.message}`);
  return data.map((r) => r.id);
}

function buildDonation(imageUrls, donorId, institutionId, status, createdDaysAgo) {
  const created = daysAgo(createdDaysAgo);
  const isMoney = random() < 0.35;
  const [category, name, description, file] = pick(GOODS);
  const later = (days) => new Date(created.getTime() + days * 86_400_000).toISOString();

  const donation = {
    donor_id: donorId,
    institution_id: institutionId,
    status,
    date_created: created.toISOString(),
    attachment_url: isMoney ? "" : imageUrls[file],
    attachment_name: isMoney ? null : file,
    category: isMoney ? "other" : category,
    delivery_method: isMoney ? "transfer" : pick(["pickup", "shipment", "agreement"]),
    name: isMoney ? null : name,
    description: isMoney ? null : description,
    amount: isMoney ? pick([5000, 10000, 15000, 25000, 50000]) : null,
  };
  if (status === "accepted" || status === "delivered") donation.date_accepted = later(2);
  if (status === "delivered") donation.dellivered_date = later(7);
  if (status === "rejected") {
    donation.date_cancelled = later(1);
    donation.cancellation_reason = pick(CANCELLATION_REASONS);
  }
  return donation;
}

async function seed() {
  const supabase = createAdmin();
  await resetDatabase(supabase);
  const roles = await getRoleIds(supabase);

  const institutionRows = [];
  for (const { email, profile } of INSTITUTIONS) {
    const userId = await createAccount(supabase, email, roles.institution);
    institutionRows.push({ ...profile, user_id: userId, approved: true });
  }
  const institutionIds = await insertReturningIds(supabase, "institutions", institutionRows);

  const donorRows = [];
  for (const { email, profile } of DONORS) {
    const userId = await createAccount(supabase, email, roles.donor);
    donorRows.push({ ...profile, email, user_id: userId });
  }
  const donorIds = await insertReturningIds(supabase, "donors", donorRows);
  console.log("✓ Cuentas demo creadas");

  const campaigns = CAMPAIGNS.map(([type, description, quantity], i) => {
    const finished = i >= CAMPAIGNS.length - 2;
    return {
      institution_id: institutionIds[i % institutionIds.length],
      type,
      description,
      quantity,
      start_date: isoDate(daysAgo(finished ? 120 - i * 5 : 40 - i * 5)),
      termination_date: isoDate(finished ? daysAgo(20) : daysAgo(-30 - i * 10)),
      finished,
    };
  });
  const campaignIds = await insertReturningIds(supabase, "campaigns", campaigns);
  console.log(`✓ ${campaigns.length} campañas`);

  const statuses = [
    ...Array(10).fill("pending"),
    ...Array(12).fill("accepted"),
    ...Array(12).fill("delivered"),
    ...Array(6).fill("rejected"),
  ];
  const imageUrls = await uploadAssets(supabase);
  console.log(`✓ ${GOODS.length} imágenes subidas al bucket ${BUCKET}`);

  const donations = statuses.map((status) =>
    buildDonation(imageUrls, pick(donorIds), pick(institutionIds), status, Math.floor(random() * 170) + 3)
  );
  donations.push(
    buildDonation(imageUrls, donorIds[0], null, "pending", 2),
    buildDonation(imageUrls, donorIds[1], null, "pending", 1)
  );
  // Parte de las dirigidas se vincula a una campaña activa de su misma institución.
  const activeCampaigns = campaigns
    .map((campaign, i) => ({ ...campaign, id: campaignIds[i] }))
    .filter((campaign) => !campaign.finished);
  for (const donation of donations) {
    const options = activeCampaigns.filter((c) => c.institution_id === donation.institution_id);
    if (options.length > 0 && random() < 0.5) donation.campaign_id = pick(options).id;
  }
  await insertReturningIds(supabase, "donations", donations);
  const linked = donations.filter((d) => d.campaign_id).length;
  console.log(`✓ ${donations.length} donaciones (2 abiertas, ${linked} vinculadas a campañas)`);

  console.log(`\nCuentas demo (contraseña: ${PASSWORD}):`);
  for (const { email, profile } of INSTITUTIONS) console.log(`  institución  ${email}  (${profile.name})`);
  for (const { email, profile } of DONORS) console.log(`  donante      ${email}  (${profile.name} ${profile.lastname})`);
}

seed().catch((error) => {
  console.error(error.message ?? error);
  process.exit(1);
});
