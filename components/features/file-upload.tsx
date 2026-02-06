import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { QuickViewDrawer } from "@/components/features/quick-view-drawer";

interface FileUploadProps {
  accept?: string;
  onChange: (file: File | null) => void;
  value?: File | null;
  multiple?: boolean;
  label?: string;
  showQuickView?: boolean;
}

export function FileUpload({ 
  accept = "*",
  onChange,
  value,
  multiple = false,
  label = "Upload File",
  showQuickView = true
}: FileUploadProps) {
  return (
    <div className="grid w-full items-center gap-1.5">
      <Label htmlFor="file">{label}</Label>
      <Input 
        id="file" 
        type="file" 
        accept={accept}
        onChange={(e) => onChange(e.target.files?.[0] || null)}
        multiple={multiple}
      />
      {value && (
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground mt-1">
            Selected: {value.name} ({(value.size / 1024).toFixed(2)} KB)
          </p>
          {showQuickView && <QuickViewDrawer file={value} />}
        </div>
      )}
    </div>
  );
}
