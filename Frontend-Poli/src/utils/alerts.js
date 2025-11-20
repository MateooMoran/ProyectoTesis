import Swal from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';

const Toast = Swal.mixin({
  toast: true,
  position: 'top-end',
  showConfirmButton: false,
  timer: 3000,
  timerProgressBar: true,
});

export const toast = {
  success: (msg, options = {}) => Toast.fire({ icon: 'success', title: msg, ...options }),
  error: (msg, options = {}) => Toast.fire({ icon: 'error', title: msg, ...options }),
  info: (msg, options = {}) => Toast.fire({ icon: 'info', title: msg, ...options }),
  warn: (msg, options = {}) => Toast.fire({ icon: 'warning', title: msg, ...options }),
};

export const alertConfirm = async ({ title = '¿Estás seguro?', text = '' } = {}) => {
  const result = await Swal.fire({
    title,
    text,
    icon: 'question',
    showCancelButton: true,
    confirmButtonText: 'Sí',
    cancelButtonText: 'No',
  });
  return result.isConfirmed;
};

export const alert = (options) => Swal.fire(options);

export default { toast, alertConfirm, alert };
