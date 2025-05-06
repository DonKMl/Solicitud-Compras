import { useState, useEffect } from "react";
import { useLocation, Link } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, ArrowLeft } from "lucide-react";
import { Logo } from "@/components/Logo";
import { Product } from "@/types";

export default function Confirmation() {
  // Estados para almacenar la información de la solicitud
  const [name, setName] = useState<string>("");
  const [date, setDate] = useState<string>("");
  const [products, setProducts] = useState<Product[]>([]);
  
  // Para navegación
  const [_, setLocation] = useLocation();
  
  useEffect(() => {
    // Intentar obtener datos de sessionStorage
    const confirmationData = sessionStorage.getItem('confirmationData');
    
    if (confirmationData) {
      try {
        const data = JSON.parse(confirmationData);
        setName(data.name || "");
        setDate(data.date || new Date().toLocaleString("es-ES"));
        setProducts(data.products || []);
      } catch (error) {
        console.error("Error parsing confirmation data:", error);
        // Si hay error, redirigir al inicio
        setLocation("/");
      }
    } else {
      // Si no hay datos, redirigir al inicio
      setLocation("/");
    }
  }, [setLocation]);
  
  const handleNewRequest = () => {
    // Limpiar los datos de confirmación y volver al inicio
    sessionStorage.removeItem('confirmationData');
    setLocation("/");
  };
  
  return (
    <div className="min-h-screen flex flex-col items-center py-8 px-4 sm:px-6 lg:px-8 bg-gray-100">
      {/* Header with Logo */}
      <div className="w-full max-w-3xl mb-6 flex flex-col items-center">
        <Logo className="mb-4 p-4" />
      </div>
      
      <Card className="w-full max-w-3xl bg-white shadow-lg rounded-xl overflow-hidden">
        <CardHeader className="bg-green-50 border-b border-green-100">
          <div className="flex items-center justify-center mb-4">
            <CheckCircle2 className="h-16 w-16 text-green-500" />
          </div>
          <CardTitle className="text-center text-2xl text-green-700">¡Su solicitud fue enviada con éxito!</CardTitle>
          <CardDescription className="text-center text-green-600">
            La solicitud ha sido registrada y será procesada a la brevedad.
          </CardDescription>
        </CardHeader>
        
        <CardContent className="p-6">
          <div className="space-y-6">
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Detalles de la Solicitud:</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Solicitante:</span> {name}
                </div>
                <div>
                  <span className="font-medium">Fecha de Solicitud:</span> {date}
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Productos/Servicios Solicitados:</h3>
              
              <div className="border rounded-md overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Producto</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cantidad</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Especificación</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {products.length > 0 ? (
                      products.map((product, index) => (
                        <tr key={index}>
                          <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">{product.name}</td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{product.quantity}</td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{product.specification || "-"}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td className="px-4 py-3 text-sm text-gray-500 text-center" colSpan={3}>
                          No hay productos para mostrar
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
            
            <div className="pt-4 flex justify-center">
              <Button 
                onClick={handleNewRequest} 
                className="bg-primary hover:bg-primary/90 text-white"
              >
                <ArrowLeft className="h-5 w-5 mr-2" />
                Realizar Nueva Solicitud
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Footer */}
      <div className="w-full max-w-3xl mt-8 text-center text-sm text-gray-500">
        <p>© {new Date().getFullYear()} Inversiones Lache. Todos los derechos reservados.</p>
      </div>
    </div>
  );
}