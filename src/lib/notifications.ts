import { toast as sonnerToast, type ExternalToast } from "sonner";

type NotifyOptions = ExternalToast;

interface PromiseMessages<T> {
  loading: string;
  success: string | ((data: T) => string);
  error: string | ((error: unknown) => string);
}

export const notify = {
  success(message: string, options?: NotifyOptions) {
    return sonnerToast.success(message, options);
  },
  error(message: string, options?: NotifyOptions) {
    return sonnerToast.error(message, { duration: 6000, ...options });
  },
  warning(message: string, options?: NotifyOptions) {
    return sonnerToast.warning(message, options);
  },
  info(message: string, options?: NotifyOptions) {
    return sonnerToast.info(message, options);
  },
  loading(message: string, options?: NotifyOptions) {
    return sonnerToast.loading(message, options);
  },
  promise<T>(promise: Promise<T>, messages: PromiseMessages<T>) {
    return sonnerToast.promise(promise, messages);
  },
  dismiss(id?: string | number) {
    return sonnerToast.dismiss(id);
  },
};

export { sonnerToast as toast };
