import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useCreateItem, useUpdateItem } from "@/hooks/use-items";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import type { Item } from "@shared/schema";

interface AddItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingItem?: Item | null;
}

export function AddItemModal({ isOpen, onClose, editingItem }: AddItemModalProps) {
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [notes, setNotes] = useState("");

  const createItem = useCreateItem();
  const updateItem = useUpdateItem();
  const { toast } = useToast();

  useEffect(() => {
    if (editingItem) {
      setCode(editingItem.code);
      setName(editingItem.name);
      setLocation(editingItem.location);
      setNotes(editingItem.notes || "");
    } else {
      resetForm();
    }
  }, [editingItem, isOpen]);

  const resetForm = () => {
    setCode("");
    setName("");
    setLocation("");
    setNotes("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!code || !name || !location) {
      toast({
        title: "خطأ",
        description: "يرجى ملء جميع الحقول المطلوبة",
        variant: "destructive",
      });
      return;
    }

    try {
      if (editingItem) {
        await updateItem.mutateAsync({
          id: editingItem.id,
          code,
          name,
          location,
          notes: notes || null,
        });
        toast({ title: "تم التحديث بنجاح" });
      } else {
        await createItem.mutateAsync({
          code,
          name,
          location,
          notes: notes || null,
        });
        toast({ title: "تمت الإضافة بنجاح" });
      }
      onClose();
      resetForm();
    } catch (error) {
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء حفظ البيانات",
        variant: "destructive",
      });
    }
  };

  const isPending = createItem.isPending || updateItem.isPending;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] font-sans" dir="rtl">
        <DialogHeader>
          <DialogTitle className="text-right text-xl font-bold text-primary">
            {editingItem ? "تعديل قطعة" : "إضافة قطعة جديدة"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="code" className="text-right block">كود القطعة</Label>
            <Input
              id="code"
              placeholder="مثال: ABC-123"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="text-right"
              autoFocus
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="name" className="text-right block">اسم القطعة</Label>
            <Input
              id="name"
              placeholder="مثال: مفتاح ربط 10مم"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="text-right"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="location" className="text-right block">الموقع</Label>
            <Input
              id="location"
              placeholder="مثال: رف A-1"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="text-right"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes" className="text-right block">ملاحظات (اختياري)</Label>
            <Textarea
              id="notes"
              placeholder="أي تفاصيل إضافية..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="text-right min-h-[100px] resize-none"
            />
          </div>
          <DialogFooter className="gap-2 sm:justify-start">
            <Button type="submit" disabled={isPending} className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-white">
              {isPending && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
              {editingItem ? "حفظ التعديلات" : "إضافة الآن"}
            </Button>
            <Button type="button" variant="outline" onClick={onClose} className="w-full sm:w-auto">
              إلغاء
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
