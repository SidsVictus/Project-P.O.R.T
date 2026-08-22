import { Response, NextFunction } from 'express'
import { supabaseAdmin } from '../../config/database'
import { AuthRequest } from '../../shared/types'
import { UnauthorizedError } from '../../shared/errors'

export const requireAuth = async (req: AuthRequest, _res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader?.startsWith('Bearer ')) {
      throw new UnauthorizedError('Missing authorization header')
    }

    const token = authHeader.split(' ')[1]
    const { data, error } = await supabaseAdmin.auth.getUser(token)

    if (error || !data.user) {
      throw new UnauthorizedError('Invalid or expired token')
    }

    req.userId = data.user.id
    req.userEmail = data.user.email
    next()
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      next(error)
    } else {
      next(new UnauthorizedError('Invalid or expired token'))
    }
  }
}
