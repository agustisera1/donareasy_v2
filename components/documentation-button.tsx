import { Button } from "@/components/ui/button";
import { BookOpen } from "lucide-react";
const downloadDocumentation = () => {
    // Ruta al PDF de documentación
    // Actualizar esta ruta cuando se agregue el archivo PDF
    const pdfPath = "/docs/documentacion.pdf";

    // Crear un enlace temporal para descargar el PDF
    const link = document.createElement("a");
    link.href = pdfPath;
    link.download = "documentacion-donareasy.pdf";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

export function DocumentationButton() {
    return (
        <Button
            variant="ghost"
            size="sm"
            onClick={downloadDocumentation}
            aria-label="Descargar documentación"
            title="Descargar documentación"
        >
            <BookOpen size={16} className="text-muted-foreground" />
        </Button>
    );
}

