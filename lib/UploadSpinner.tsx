import type { FC } from "react";
import { Loader2 } from "lucide-react";

export const UploadSpinner: FC = () => {
  return (
    <Loader2 
      className="h-7 w-7 animate-spin text-primary" 
    />
  );
};

