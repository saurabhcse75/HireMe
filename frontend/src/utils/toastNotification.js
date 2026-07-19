import { toast } from 'react-toastify';

const toastConfig = {
  position: 'bottom-right',
  autoClose: 3000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
};

export const showSuccess = (message) => {
  toast.success(message, toastConfig);
};

export const showError = (message) => {
  toast.error(message, toastConfig);
};

export const showInfo = (message) => {
  toast.info(message, toastConfig);
};

export const showWarning = (message) => {
  toast.warning(message, toastConfig);
};

export const showLoading = (message) => {
  return toast.loading(message, toastConfig);
};

export const updateToast = (toastId, content) => {
  toast.update(toastId, {
    ...toastConfig,
    isLoading: false,
    autoClose: 3000,
    ...content,
  });
};
