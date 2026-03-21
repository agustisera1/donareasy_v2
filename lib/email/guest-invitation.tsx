export function guestInvitationHtml({
  name,
  magicLink,
  baseUrl,
}: {
  name: string;
  magicLink: string;
  baseUrl: string;
}): string {
  return `<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" /></head>
<body style="margin:0;padding:0;background:#ffffff;font-family:Arial,sans-serif;">
  <div style="max-width:600px;margin:0 auto;padding:32px 24px;">
    <div style="margin-bottom:32px;">
      <h1 style="font-size:24px;font-weight:bold;color:#111827;margin:0;">Donareasy</h1>
    </div>

    <h2 style="font-size:20px;color:#111827;margin-bottom:8px;">Hola, ${name}!</h2>
    <p style="color:#6b7280;line-height:1.5;margin-top:0;margin-bottom:24px;">
      Recibimos tu solicitud para realizar una donación. Hacé clic en el botón de abajo para acceder al formulario.
    </p>

    <div style="text-align:center;margin-bottom:24px;">
      <a href="${magicLink}" style="display:inline-block;background:#111827;color:#ffffff;padding:12px 32px;border-radius:6px;text-decoration:none;font-weight:600;font-size:16px;">
        Realizar donación
      </a>
    </div>

    <div style="background:#fef3c7;border:1px solid #fcd34d;border-radius:6px;padding:12px 16px;margin-bottom:24px;">
      <p style="color:#92400e;margin:0;font-size:14px;">
        Este enlace expira en <strong>30 minutos</strong>. Si no lo usás a tiempo, podés solicitar uno nuevo desde
        <a href="${baseUrl}/donate" style="color:#92400e;">la página de donación</a>.
      </p>
    </div>

    <p style="color:#9ca3af;font-size:12px;">Si no solicitaste este enlace, podés ignorar este correo.</p>

    <hr style="border-color:#e5e7eb;margin:24px 0;" />
    <p style="color:#9ca3af;font-size:12px;margin:0;">Donareasy — Conectando donantes con instituciones</p>
  </div>
</body>
</html>`;
}
