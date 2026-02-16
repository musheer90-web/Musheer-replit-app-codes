import { useState, useRef } from "react";
import { useItems, useDeleteItem } from "@/hooks/use-items";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { AddItemModal } from "@/components/AddItemModal";
import { HoverEffect } from "@/components/ui/card-hover-effect";
import { 
  Search, 
  Plus, 
  FileSpreadsheet, 
  FileText, 
  Loader2, 
  PackageSearch,
  Download
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import * as XLSX from 'xlsx';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { motion } from "framer-motion";
import type { Item } from "@shared/schema";

export default function Inventory() {
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const { data: items, isLoading, error } = useItems();
  const deleteItem = useDeleteItem();
  const { toast } = useToast();
  const tableRef = useRef<HTMLDivElement>(null);

  const filteredItems = items?.filter(item => 
    item.name.toLowerCase().includes(search.toLowerCase()) ||
    item.code.toLowerCase().includes(search.toLowerCase()) ||
    item.location.toLowerCase().includes(search.toLowerCase())
  ) || [];

  const handleEdit = (item: Item) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm("هل أنت متأكد من حذف هذه القطعة؟")) {
      try {
        await deleteItem.mutateAsync(id);
        toast({ title: "تم الحذف بنجاح" });
      } catch (error) {
        toast({ title: "فشل الحذف", variant: "destructive" });
      }
    }
  };

  const handleAddNew = () => {
    setEditingItem(null);
    setIsModalOpen(true);
  };

  const exportExcel = () => {
    if (!items || items.length === 0) return;
    
    const ws = XLSX.utils.json_to_sheet(items.map(item => ({
      "الكود": item.code,
      "الاسم": item.name,
      "الموقع": item.location,
      "ملاحظات": item.notes,
      "تاريخ الإضافة": new Date(item.createdAt!).toLocaleDateString('ar-EG')
    })));
    
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Inventory");
    XLSX.writeFile(wb, "inventory_export.xlsx");
    
    toast({ title: "تم تصدير ملف Excel بنجاح" });
  };

  const exportPDF = async () => {
    if (!tableRef.current) return;
    
    const canvas = await html2canvas(tableRef.current, {
      scale: 2,
      useCORS: true,
      logging: false,
    });
    
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save("inventory_export.pdf");
    
    toast({ title: "تم تصدير ملف PDF بنجاح" });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground animate-pulse">جاري تحميل المخزون...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
            <span className="text-2xl">⚠️</span>
          </div>
          <h2 className="text-xl font-bold text-foreground">حدث خطأ في الاتصال</h2>
          <Button onClick={() => window.location.reload()}>إعادة المحاولة</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24 font-sans" dir="rtl">
      {/* Header */}
      <header className="sticky top-0 z-30 w-full bg-background/80 backdrop-blur-md border-b border-border shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold bg-gradient-to-l from-primary to-emerald-600 bg-clip-text text-transparent">
            المخزن الذكي
          </h1>
          <Button 
            onClick={handleAddNew}
            className="rounded-full w-10 h-10 p-0 shadow-lg bg-primary hover:bg-primary/90 text-white md:w-auto md:h-auto md:px-4 md:py-2 md:rounded-xl"
          >
            <Plus className="w-6 h-6 md:w-5 md:h-5 md:ml-2" />
            <span className="hidden md:inline">إضافة قطعة</span>
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 space-y-8">
        
        {/* Search & Actions Bar */}
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-card p-4 rounded-2xl border border-border/50 shadow-sm">
          <div className="relative w-full md:w-96 group">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5 group-focus-within:text-primary transition-colors" />
            <Input 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="بحث بالاسم، الكود، أو الموقع..."
              className="pr-10 pl-4 h-12 rounded-xl border-border/50 bg-secondary/50 focus:bg-background transition-all"
            />
          </div>
          
          <div className="flex w-full md:w-auto gap-2">
            <Button 
              variant="outline" 
              onClick={exportExcel}
              className="flex-1 md:flex-none border-border/50 hover:bg-green-50 hover:text-green-700 hover:border-green-200 transition-colors"
            >
              <FileSpreadsheet className="w-4 h-4 ml-2" />
              Excel
            </Button>
            <Button 
              variant="outline" 
              onClick={exportPDF}
              className="flex-1 md:flex-none border-border/50 hover:bg-red-50 hover:text-red-700 hover:border-red-200 transition-colors"
            >
              <FileText className="w-4 h-4 ml-2" />
              PDF
            </Button>
          </div>
        </div>

        {/* Inventory List */}
        {filteredItems.length === 0 ? (
          <div className="text-center py-20 bg-card/50 rounded-3xl border border-dashed border-border">
            <PackageSearch className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h3 className="text-xl font-bold text-foreground">لا توجد نتائج</h3>
            <p className="text-muted-foreground mt-2">لم يتم العثور على قطع تطابق بحثك</p>
            <Button 
              variant="link" 
              onClick={() => setSearch("")} 
              className="mt-4 text-primary"
            >
              عرض الكل
            </Button>
          </div>
        ) : (
          <div ref={tableRef} className="pb-4">
             {/* Desktop & Mobile Responsive Grid */}
            <HoverEffect 
              items={filteredItems} 
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          </div>
        )}
      </main>

      {/* Floating Action Button (Mobile Only) */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={handleAddNew}
        className="md:hidden fixed bottom-6 left-6 w-14 h-14 bg-primary text-white rounded-full shadow-xl flex items-center justify-center z-40"
      >
        <Plus className="w-8 h-8" />
      </motion.button>

      {/* Footer */}
      <footer className="py-6 text-center text-sm text-muted-foreground border-t border-border mt-auto">
        <p dir="rtl">صمم بواسطة م. مشير عبدالحميد &copy; {new Date().getFullYear()}</p>
      </footer>

      {/* Modals */}
      <AddItemModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        editingItem={editingItem}
      />
    </div>
  );
}
