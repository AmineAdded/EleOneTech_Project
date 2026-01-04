// frontend/src/app/interceptors/auth.interceptor.ts
import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem('token');

  if (token) {
    // ✅ Ne pas ajouter Content-Type pour les requêtes multipart/form-data
    const isFileUpload = req.body instanceof FormData;

    const headers: Record<string, string> = {
      Authorization: `Bearer ${token}`
    };

    // ✅ Ajouter Content-Type seulement si ce n'est pas un upload de fichier
    if (!isFileUpload) {
      headers['Content-Type'] = 'application/json';
    }

    const clonedRequest = req.clone({
      setHeaders: headers
    });

    console.log('Request with token:', {
      url: req.url,
      method: req.method,
      hasToken: !!token,
      isFileUpload: isFileUpload
    });

    return next(clonedRequest);
  }

  return next(req);
};
