import { PurchaseForm } from "@/components/PurchaseForm";
import { Logo } from "@/components/Logo";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center py-8 px-4 sm:px-6 lg:px-8 bg-gray-100">
      {/* Header with Logo */}
      <div className="w-full max-w-3xl mb-6 flex flex-col items-center">
        <Logo className="mb-4 p-4" />
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Solicitud de Compra/Servicio</h1>
      </div>

      {/* Main Form Container */}
      <div className="w-full max-w-3xl bg-white shadow-lg rounded-xl overflow-hidden border border-gray-200">
        <PurchaseForm />
      </div>

      {/* Footer */}
      <div className="w-full max-w-3xl mt-8 text-center text-sm text-gray-500">
        <p>© {new Date().getFullYear()} Inversiones Lache. Todos los derechos reservados.</p>
      </div>
    </div>
  );
}
