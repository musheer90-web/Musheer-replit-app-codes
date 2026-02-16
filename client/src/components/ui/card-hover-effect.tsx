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
        "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 py-4 gap-4",
        className
      )}
    >
      {items.map((item, idx) => (
        <div
          key={item.id}
          className="relative group block p-2 h-full w-full"
          onMouseEnter={() => setHoveredIndex(idx)}
          onMouseLeave={() => setHoveredIndex(null)}
        >
          <AnimatePresence>
            {hoveredIndex === idx && (
              <motion.span
                className="absolute inset-0 h-full w-full bg-primary/10 block rounded-3xl"
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
          <Card>
            <div className="flex justify-between items-start mb-2">
              <span className="text-xs font-bold px-2 py-1 rounded bg-primary/10 text-primary">
                {item.code}
              </span>
              <div className="flex gap-2">
                <button 
                  onClick={() => onEdit(item)}
                  className="text-muted-foreground hover:text-primary transition-colors text-sm"
                >
                  تعديل
                </button>
                <button 
                  onClick={() => onDelete(item.id)}
                  className="text-muted-foreground hover:text-destructive transition-colors text-sm"
                >
                  حذف
                </button>
              </div>
            </div>
            <CardTitle>{item.name}</CardTitle>
            <CardDescription className="mt-2 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-yellow-500"></span>
              {item.location}
            </CardDescription>
            {item.notes && (
              <p className="mt-4 text-sm text-muted-foreground line-clamp-2">
                {item.notes}
              </p>
            )}
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
