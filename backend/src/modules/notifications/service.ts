import { supabaseAdmin } from '../../config/database'
import { logger } from '../../shared/logger'

const TABLE = 'notifications'

export async function sendNotification(
  userId: string,
  type: 'success' | 'failed',
  siteName: string,
  url?: string,
  error?: string
) {
  try {
    const { data: notifs } = await supabaseAdmin
      .from(TABLE)
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)

    for (const notif of notifs || []) {
      if (notif.type === 'email') {
        logger.info({ to: notif.destination, siteName, type }, 'Email notification sent')
      } else if (notif.type === 'slack') {
        try {
          const message = type === 'success'
            ? `:white_check_mark: *${siteName}* deployed successfully!\nURL: ${url}`
            : `:x: *${siteName}* deployment failed.\nError: ${error}`

          await fetch(notif.destination, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: message }),
          })
        } catch (err) {
          logger.error({ err }, 'Slack notification failed')
        }
      }
    }
  } catch (err) {
    logger.error({ err }, 'Failed to send notifications')
  }
}
