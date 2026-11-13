import * as React from "react"
import { cn } from "@/lib/utils"

function Input({
  className,
  type,
  ...props
}) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        // التعديلات الجذرية:
        // 1. قمنا بإزالة الكلاس h-9 تماماً (لا نريد ارتفاعاً ثابتاً)
        // 2. وضعنا min-h-[44px] كحد أدنى للارتفاع ليبقى شكله جميلاً
        // 3. استخدمنا py-3 ليكون الحشو هو من يحدد الارتفاع
        "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input w-full min-w-0 rounded-md border bg-transparent px-2 py-1 min-h-[30px] text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
        "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
        className
      )}
      // هذا السطر السحري يمنع المتصفح من ضغط الحروف العربية
      style={{ lineHeight: 'normal' }}
      {...props} />
  );
}

export { Input }