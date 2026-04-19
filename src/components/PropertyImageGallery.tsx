import { Dialog, DialogContent } from "@/components/ui/dialog";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
// O ScrollArea não é estritamente necessário para esta correção, mas pode ser útil para um scrollbar customizado
// import { ScrollArea } from "@/components/ui/scroll-area";

interface PropertyImageGalleryProps {
  images: string[];
  propertyTitle: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const PropertyImageGallery = ({ images, propertyTitle, open, onOpenChange }: PropertyImageGalleryProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {/* MUDANÇA AQUI:
        1. max-w-[95vw] h-[95vh]: Define o tamanho do DialogContent.
        2. overflow-y-auto: Permite a rolagem no DialogContent se o conteúdo interno exceder h-[95vh].
        3. p-0: Mantido para remover o padding padrão.
      */}
      <DialogContent className="max-w-[95vw] h-[95vh] p-0 bg-background overflow-y-auto">
        {/* MUDANÇA AQUI:
          Remova a classe 'flex-col' do div principal e adicione 'h-full' para ocupar a altura total.
          A classe 'overflow-hidden' neste elemento não é mais necessária, pois o DialogContent já lida com o scroll.
        */}
        <div className="relative h-full flex flex-col">
          {/* Header (SHRINK-0: Fixa o header no topo) */}
          <div className="flex items-center justify-between p-4 border-b border-border shrink-0">
            {/* ... seu código do Header permanece o mesmo ... */}
            <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)} className="rounded-full">
              <X className="h-5 w-5" />
            </Button>
            <h2 className="text-lg font-semibold text-foreground">Fotos de {propertyTitle}</h2>
            <div className="w-10" /> {/* Spacer for alignment */}
          </div>

          {/* Scrollable Images Grid (FLEX-1: Ocupa o espaço restante e permite rolagem) */}
          {/* MUDANÇA AQUI:
            Não é mais necessário 'overflow-y-auto' neste div, 
            pois o DialogContent pai já está gerenciando o scroll. 
            Apenas garantir que ele expanda (`flex-1`) é suficiente.
          */}
          <div className="flex-1">
            <div className="container mx-auto px-4 py-6 max-w-6xl pb-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {images.map((image, index) => (
                  <div key={index} className="relative aspect-[4/3] rounded-lg overflow-hidden bg-muted">
                    <img
                      src={image}
                      alt={`${propertyTitle} - Foto ${index + 1}`}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
// import { Dialog, DialogContent } from "@/components/ui/dialog";
// import { X } from "lucide-react";
// import { Button } from "@/components/ui/button";
// import { ScrollArea } from "@/components/ui/scroll-area";

// interface PropertyImageGalleryProps {
//   images: string[];
//   propertyTitle: string;
//   open: boolean;
//   onOpenChange: (open: boolean) => void;
// }

// export const PropertyImageGallery = ({
//   images,
//   propertyTitle,
//   open,
//   onOpenChange,
// }: PropertyImageGalleryProps) => {
//   return (
//     <Dialog open={open} onOpenChange={onOpenChange}>
//       <DialogContent className="max-w-[95vw] h-[95vh] p-0 bg-background overflow-hidden">
//         <div className="relative h-full flex flex-col">
//           {/* Header */}
//           <div className="flex items-center justify-between p-4 border-b border-border shrink-0">
//             <Button
//               variant="ghost"
//               size="icon"
//               onClick={() => onOpenChange(false)}
//               className="rounded-full"
//             >
//               <X className="h-5 w-5" />
//             </Button>
//             <h2 className="text-lg font-semibold text-foreground">Fotos de {propertyTitle}</h2>
//             <div className="w-10" /> {/* Spacer for alignment */}
//           </div>

//           {/* Scrollable Images Grid */}
//           <div className="flex-1 overflow-y-auto">
//             <div className="container mx-auto px-4 py-6 max-w-6xl pb-8">
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                 {images.map((image, index) => (
//                   <div
//                     key={index}
//                     className="relative aspect-[4/3] rounded-lg overflow-hidden bg-muted"
//                   >
//                     <img
//                       src={image}
//                       alt={`${propertyTitle} - Foto ${index + 1}`}
//                       className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
//                     />
//                   </div>
//                 ))}
//               </div>
//             </div>
//           </div>
//         </div>
//       </DialogContent>
//     </Dialog>
//   );
// };
