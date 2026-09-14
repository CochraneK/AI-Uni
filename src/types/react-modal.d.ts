declare module 'react-modal' {
  import type { ComponentType } from 'react';

  const Modal: ComponentType<any> & {
    setAppElement: (element: string | HTMLElement) => void;
  };

  export default Modal;
}
