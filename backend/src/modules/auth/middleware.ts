import { Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { env } from '../../config/env'
import { AuthRequest } from '../../shared/types'
import { UnauthorizedError } from '../../shared/errors'

export const requireAuth = (req: AuthRequest, _res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader?.startsWith('Bearer ')) {
      throw new UnauthorizedError('Missing authorization header')
    }

    const token = authHeader.split(' ')[1]
    const decoded = jwt.verify(token, env.SUPABASE_JWT_SECRET) as {
      sub: string
      email?: string
    }

    req.userId = decoded.sub
    req.userEmail = decoded.email
    next()
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      next(error)
    } else {
      next(new UnauthorizedError('Invalid or expired token'))
    }
  }
}
