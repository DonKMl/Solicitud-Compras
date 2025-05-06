import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { formatDateForSheet, formatDateTime } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Plus, AlertCircle, CheckCircle2 } from "lucide-react";
import { ProductTable } from "./ProductTable";
import { Product, PurchaseRequest } from "@/types";

// Form validation schema
const formSchema = z.object({
  name: z.string().min(1, "Nombre es obligatorio"),
  position: z.string().min(1, "Cargo es obligatorio"),
  department: z.string().min(1, "Área es obligatoria"),
  site: z.string().min(1, "Sede es obligatoria"),
  requestType: z.string().min(1, "Tipo de solicitud es obligatorio"),
  justification: z.string().min(1, "Justificación es obligatoria"),
});

type FormValues = z.infer<typeof formSchema>;

const productSchema = z.object({
  name: z.string().min(1, "Nombre del producto es obligatorio"),
  quantity: z.string().min(1, "Cantidad es obligatoria"),
  specification: z.string().optional(),
});

export function PurchaseForm() {
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [productName, setProductName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [specification, setSpecification] = useState("");
  const [formStatus, setFormStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [_, setLocation] = useLocation();

  // Define form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      position: "",
      department: "",
      site: "",
      requestType: "",
      justification: "",
    },
  });

  // Mutation for submitting form data
  const submitMutation = useMutation({
    mutationFn: async (data: PurchaseRequest) => {
      const response = await apiRequest("POST", "/api/purchase-request", data);
      const jsonResponse = await response.json();
      return jsonResponse as { message: string; success: boolean };
    },
    onSuccess: (response) => {
      setFormStatus("success");
      toast({
        title: "¡Éxito!",
        description: response?.message || "Solicitud de compra enviada con éxito.",
      });

      // Guardar la información para la página de confirmación
      const formData = form.getValues();
      const confirmationData = {
        name: formData.name,
        date: formatDateTime(),
        products: products,
      };
      
      // Almacenar datos en sessionStorage
      sessionStorage.setItem('confirmationData', JSON.stringify(confirmationData));
      
      // Redirigir a la página de confirmación
      setTimeout(() => {
        form.reset();
        setProducts([]);
        setFormStatus("idle");
        setLocation("/confirmation");
      }, 1000);
    },
    onError: (error: any) => {
      setFormStatus("error");
      
      // Try to get the error message from the response
      let errorMessage = "Error al enviar la solicitud";
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Estado de Solicitud",
        description: errorMessage,
        variant: "destructive",
      });
      
      // If the request was saved locally, show a different message
      if (errorMessage.includes("recorded locally")) {
        setTimeout(() => {
          setFormStatus("idle");
          form.reset();
          setProducts([]);
        }, 5000);
      }
    },
  });

  const handleAddProduct = () => {
    try {
      const newProduct = productSchema.parse({
        name: productName,
        quantity,
        specification,
      });
      
      setProducts([...products, newProduct]);
      
      // Clear product form
      setProductName("");
      setQuantity("");
      setSpecification("");
      
      toast({
        title: "Producto agregado",
        description: `${newProduct.name} ha sido agregado a su solicitud.`,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast({
          title: "Datos del producto inválidos",
          description: error.errors[0]?.message || "Por favor revise la información del producto",
          variant: "destructive",
        });
      }
    }
  };

  const handleRemoveProduct = (index: number) => {
    const updatedProducts = [...products];
    updatedProducts.splice(index, 1);
    setProducts(updatedProducts);
  };

  const onSubmit = (values: FormValues) => {
    if (products.length === 0) {
      toast({
        title: "Sin productos",
        description: "Por favor agregue al menos un producto antes de enviar",
        variant: "destructive",
      });
      return;
    }

    const requestData: PurchaseRequest = {
      ...values,
      products,
    };

    setFormStatus("loading");
    submitMutation.mutate(requestData);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="p-6 space-y-8">
        {/* User Information Section */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-gray-800 border-b pb-2">Información del Solicitante</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Name Field */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre</FormLabel>
                  <FormControl>
                    <Input placeholder="Ingrese su nombre completo" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Position Field */}
            <FormField
              control={form.control}
              name="position"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cargo</FormLabel>
                  <FormControl>
                    <Input placeholder="Ingrese su cargo" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Department/Area Field */}
            <FormField
              control={form.control}
              name="department"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Área</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccione área" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="STT">STT</SelectItem>
                      <SelectItem value="Mantenimiento">Mantenimiento</SelectItem>
                      <SelectItem value="Calidad">Calidad</SelectItem>
                      <SelectItem value="Empaque">Empaque</SelectItem>
                      <SelectItem value="Papelería">Papelería</SelectItem>
                      <SelectItem value="Logística">Logística</SelectItem>
                      <SelectItem value="Sistemas">Sistemas</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Site/Sede Field */}
            <FormField
              control={form.control}
              name="site"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Sede</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccione sede" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Punto de Venta">Punto de Venta</SelectItem>
                      <SelectItem value="Planta">Planta</SelectItem>
                      <SelectItem value="Chimila">Chimila</SelectItem>
                      <SelectItem value="Concentrados">Concentrados</SelectItem>
                      <SelectItem value="Cartagena">Cartagena</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Type of Request Field */}
            <FormField
              control={form.control}
              name="requestType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo de Solicitud</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccione tipo" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Orden de Compra">Orden de Compra</SelectItem>
                      <SelectItem value="Orden de Servicio">Orden de Servicio</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Justification Field */}
            <FormField
              control={form.control}
              name="justification"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Justificación</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccione justificación" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Compra Nueva">Compra Nueva</SelectItem>
                      <SelectItem value="Reposición">Reposición</SelectItem>
                      <SelectItem value="Desabastecimiento">Desabastecimiento</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
        
        {/* Product Information Section */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-gray-800 border-b pb-2">Información de Producto/Servicio</h2>
          
          <div className="grid grid-cols-1 gap-4">
            {/* Product Name Field */}
            <div>
              <FormLabel htmlFor="productName">Nombre del Producto</FormLabel>
              <Input
                id="productName"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                placeholder="Ingrese el nombre del producto"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Quantity Field */}
              <div>
                <FormLabel htmlFor="quantity">Cantidad</FormLabel>
                <Input
                  id="quantity"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  placeholder="Ingrese la cantidad (ej. 1000kg)"
                />
              </div>
              
              {/* Specification Field */}
              <div>
                <FormLabel htmlFor="specification">Especificación</FormLabel>
                <Input
                  id="specification"
                  value={specification}
                  onChange={(e) => setSpecification(e.target.value)}
                  placeholder="Ingrese especificaciones"
                />
              </div>
            </div>
            
            {/* Add Product Button */}
            <div className="mt-2">
              <Button
                type="button"
                onClick={handleAddProduct}
                className="bg-red-500 hover:bg-red-600 text-white"
                disabled={!productName || !quantity}
              >
                <Plus className="h-5 w-5 mr-2" />
                Agregar Producto
              </Button>
            </div>
          </div>
        </div>
        
        {/* Product Table */}
        {products.length > 0 && (
          <ProductTable products={products} onRemove={handleRemoveProduct} />
        )}
        
        {/* Status Messages */}
        {formStatus === "loading" && (
          <Alert className="bg-blue-50 border-l-4 border-blue-400">
            <Loader2 className="h-5 w-5 text-blue-400 animate-spin mr-2" />
            <AlertDescription className="text-blue-700">Procesando su solicitud...</AlertDescription>
          </Alert>
        )}
        
        {formStatus === "success" && (
          <Alert className="bg-green-50 border-l-4 border-green-400">
            <CheckCircle2 className="h-5 w-5 text-green-400 mr-2" />
            <AlertDescription className="text-green-700">¡Solicitud de compra enviada con éxito!</AlertDescription>
          </Alert>
        )}
        
        {formStatus === "error" && (
          <Alert className={submitMutation.error?.response?.data?.message?.includes("recorded locally") 
            ? "bg-amber-50 border-l-4 border-amber-400" 
            : "bg-red-50 border-l-4 border-red-400"}>
            <AlertCircle className={`h-5 w-5 mr-2 ${submitMutation.error?.response?.data?.message?.includes("recorded locally") 
              ? "text-amber-400" 
              : "text-red-400"}`} />
            <AlertDescription className={submitMutation.error?.response?.data?.message?.includes("recorded locally")
              ? "text-amber-700"
              : "text-red-700"}>
              {submitMutation.error?.response?.data?.message || "Se produjo un error al enviar su solicitud. Por favor, inténtelo de nuevo."}
            </AlertDescription>
          </Alert>
        )}
        
        {/* Submit Button */}
        <div className="flex justify-end">
          <Button 
            type="submit" 
            className="bg-primary hover:bg-primary/90 text-white"
            disabled={!form.formState.isValid || products.length === 0 || formStatus === "loading"}
          >
            {formStatus === "loading" ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Enviando...
              </>
            ) : (
              "Enviar Solicitud"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
