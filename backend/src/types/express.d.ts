import { IUser } from '../modules/users/user.model';

declare global {
  namespace Express {
    interface Request {
      user?: {
        _id: string;
        email: string;
        role: 'customer' | 'service_provider' | 'admin';
      };
    }
  }
}
