import { useToast } from "@/components/common/toast";

export const useNotification = () => {
  const { show } = useToast();

  return {
    success: (title: string, description?: string) =>
      show({ title, description, variant: "success" }),
    error: (title: string, description?: string) =>
      show({ title, description, variant: "error" }),
    warning: (title: string, description?: string) =>
      show({ title, description, variant: "warning" }),
    info: (title: string, description?: string) =>
      show({ title, description, variant: "info" }),
  };
};

