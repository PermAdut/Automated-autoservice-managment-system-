import type { Request } from 'express';

/** Shape of the JWT payload we sign */
export interface JwtPayload {
  sub: string;
  email: string;
  roleId: string;
  tenantId: string;
  iat?: number;
  exp?: number;
}

/** req.user set by JwtStrategy.validate() */
export interface JwtUser {
  userId: string;
  email: string;
  roleId: string;
  tenantId: string;
  roleName?: string;
  id?: string;
}

/** Express request with authenticated user attached */
export interface AuthenticatedRequest extends Request {
  user: JwtUser;
}

/** Minimal user object returned by validateUser() */
export interface ValidatedUser {
  id: string;
  email: string;
  name: string | null;
  surName: string | null;
  phone: string | null;
  roleId: string | null;
  tenantId: string | null;
  login: string;
}
