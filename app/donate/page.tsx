import { GuestAccessForm } from "@/components/guest/guest-access-form";

export const metadata = {
  title: "Donar sin registrarse | Donareasy",
};

export default function DonatePage() {
  return (
    <div className="w-full max-w-md">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2">Quiero donar</h1>
        <p className="text-muted-foreground">
          Completá tus datos y te enviamos un enlace a tu correo para que puedas
          realizar tu donación. El enlace expira en 30 minutos.
        </p>
      </div>
      <GuestAccessForm />
    </div>
  );
}
