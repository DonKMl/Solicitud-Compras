import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Product } from "@/types";

interface ProductTableProps {
  products: Product[];
  onRemove: (index: number) => void;
}

export function ProductTable({ products, onRemove }: ProductTableProps) {
  if (products.length === 0) {
    return null;
  }

  return (
    <div className="mb-8 border rounded-md overflow-hidden">
      <h2 className="text-lg font-semibold text-secondary p-4 bg-gray-50 border-b">Productos Agregados</h2>
      
      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="bg-gray-50 text-sm text-neutral-dark">
            <TableRow>
              <TableHead className="w-[80px]">#</TableHead>
              <TableHead>Nombre del Producto</TableHead>
              <TableHead>Cantidad</TableHead>
              <TableHead>Especificación</TableHead>
              <TableHead className="w-[100px]">Acción</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="bg-white divide-y divide-gray-200">
            {products.map((product, index) => (
              <TableRow key={index}>
                <TableCell>{index + 1}</TableCell>
                <TableCell>{product.name}</TableCell>
                <TableCell>{product.quantity}</TableCell>
                <TableCell>{product.specification || "-"}</TableCell>
                <TableCell>
                  <Button 
                    variant="ghost" 
                    onClick={() => onRemove(index)}
                    className="text-red-600 hover:text-red-800 hover:bg-red-50 p-2 h-auto font-medium"
                  >
                    Eliminar
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
