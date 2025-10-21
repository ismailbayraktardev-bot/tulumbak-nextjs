import Redis from 'ioredis'

// Redis client singleton
let redis: Redis | null = null

export function getRedisClient(): Redis {
  if (!redis) {
    redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
      retryDelayOnFailover: 100,
      enableReadyCheck: false,
      maxRetriesPerRequest: 3,
      lazyConnect: true,
    })

    redis.on('error', (error) => {
      console.error('Redis connection error:', error)
    })

    redis.on('connect', () => {
      console.log('Redis connected successfully')
    })
  }

  return redis
}

// Redis health check
export async function checkRedisHealth(): Promise<boolean> {
  try {
    const client = getRedisClient()
    await client.ping()
    return true
  } catch (error) {
    console.error('Redis health check failed:', error)
    return false
  }
}

// Close Redis connection
export async function closeRedisConnection(): Promise<void> {
  if (redis) {
    await redis.quit()
    redis = null
  }
}