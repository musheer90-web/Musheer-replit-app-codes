import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";

export const HoverEffect = ({
  items,
  className,
  onEdit,
  onDelete,
}: {
  items: {
    id: number;
    code: string;
    name: string;
    location: string;
    notes: string | null;
  }[];
  className?: string;
  onEdit: (item: any) => void;
  onDelete: (id: number) => void;
}) => {
  let [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <div
      className={cn(
        "flex flex-col py-4 gap-3",
        className
      )}
    >
      {items.map((item, idx) => (
        <div
          key={item.id}
          className="relative group block p-0 w-full"
          onMouseEnter={() => setHoveredIndex(idx)}
          onMouseLeave={() => setHoveredIndex(null)}
        >
          <AnimatePresence>
            {hoveredIndex === idx && (
              <motion.span
                className="absolute inset-0 h-full w-full bg-primary/5 block rounded-xl"
                layoutId="hoverBackground"
                initial={{ opacity: 0 }}
                animate={{
                  opacity: 1,
                  transition: { duration: 0.15 },
                }}
                exit={{
                  opacity: 0,
                  transition: { duration: 0.15, delay: 0.2 },
                }}
              />
            )}
          </AnimatePresence>
          <Card className="p-3 md:p-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-3 flex-1">
                <span className="text-xs font-bold px-2 py-1 rounded-lg bg-primary/10 text-primary whitespace-nowrap">
                  {item.code}
                </span>
                <CardTitle className="text-base md:text-lg">{item.name}</CardTitle>
                <CardDescription className="flex items-center gap-2 whitespace-nowrap">
                  <span className="w-2 h-2 rounded-full bg-yellow-500"></span>
                  {item.location}
                </CardDescription>
                {item.notes && (
                  <p className="text-sm text-muted-foreground line-clamp-1 md:line-clamp-2 border-r-2 pr-3 border-border/50">
                    {item.notes}
                  </p>
                )}
              </div>
              
              <div className="flex gap-2 justify-end pt-2 md:pt-0 border-t md:border-t-0 border-border/30">
                <button 
                  onClick={() => onEdit(item)}
                  className="px-3 py-1 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/5 transition-all text-sm font-medium"
                >
                  تعديل
                </button>
                <button 
                  onClick={() => onDelete(item.id)}
                  className="px-3 py-1 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/5 transition-all text-sm font-medium"
                >
                  حذف
                </button>
              </div>
            </div>
          </Card>
        </div>
      ))}
    </div>
  );
};

export const Card = ({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) => {
  return (
    <div
      className={cn(
        "rounded-2xl h-full w-full p-6 overflow-hidden bg-card border border-border/50 shadow-sm relative z-20 transition-all duration-200 hover:shadow-md",
        className
      )}
    >
      <div className="relative z-50">
        <div className="p-0">{children}</div>
      </div>
    </div>
  );
};

export const CardTitle = ({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) => {
  return (
    <h4 className={cn("text-foreground font-bold tracking-wide text-lg", className)}>
      {children}
    </h4>
  );
};

export const CardDescription = ({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) => {
  return (
    <p
      className={cn(
        "text-muted-foreground tracking-wide leading-relaxed text-sm",
        className
      )}
    >
      {children}
    </p>
  );
};
