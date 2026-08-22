import { Queue } from 'bullmq'
import { Redis } from 'ioredis'
import { env } from '../../config/env'

let connection: Redis | null = null
let deployQueue: Queue | null = null

function getRedisConnection(): Redis | null {
  if (!env.UPSTASH_REDIS_URL) return null
  if (!connection) {
    connection = new Redis(env.UPSTASH_REDIS_URL, { maxRetriesPerRequest: null })
  }
  return connection
}

export function getDeployQueue(): Queue | null {
  const conn = getRedisConnection()
  if (!conn) return null
  if (!deployQueue) {
    deployQueue = new Queue('deployments', { connection: conn })
  }
  return deployQueue
}

export async function addDeployJob(data: {
  deploymentId: string
  userId: string
  siteId: string
  provider: string
  siteName: string
  uploadDir: string
  hostingEmail?: string
  delay?: number
}) {
  const queue = getDeployQueue()
  if (!queue) return null
  return queue.add('deploy', data, { delay: data.delay || 0, removeOnComplete: 100, removeOnFail: 50 })
}
