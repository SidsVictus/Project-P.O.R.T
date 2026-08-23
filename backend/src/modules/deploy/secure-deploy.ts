import { spawn } from 'child_process'
import path from 'path'
import os from 'os'
import { ProviderDeployResult } from '../../shared/types'

/**
 * Secure command execution without shell - prevents command injection
 * Uses spawn with array arguments instead of shell string interpolation
 */
export async function secureSpawn(
  command: string,
  args: string[],
  options: {
    cwd?: string
    env?: NodeJS.ProcessEnv
    timeout?: number
  } = {}
): Promise<{ stdout: string; stderr: string; exitCode: number }> {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd: options.cwd,
      env: { ...process.env, ...options.env, FORCE_COLOR: '0' },
      stdio: ['ignore', 'pipe', 'pipe'],
      shell: false, // CRITICAL: Never use shell=true
    })

    let stdout = ''
    let stderr = ''

    child.stdout?.on('data', (data) => {
      stdout += data.toString()
    })

    child.stderr?.on('data', (data) => {
      stderr += data.toString()
    })

    const timeout = options.timeout || 180000
    const timer = setTimeout(() => {
      child.kill('SIGKILL')
      reject(new Error(`Command timed out after ${timeout}ms`))
    }, timeout)

    child.on('close', (exitCode) => {
      clearTimeout(timer)
      resolve({ stdout, stderr, exitCode: exitCode ?? 1 })
    })

    child.on('error', (error) => {
      clearTimeout(timer)
      reject(error)
    })
  })
}

/**
 * Validates and sanitizes a site name to prevent injection
 * Only allows alphanumeric, hyphens, underscores
 */
export function sanitizeSiteName(siteName: string): string {
  // Only allow alphanumeric, hyphens, underscores - no shell metacharacters
  const sanitized = siteName.replace(/[^a-zA-Z0-9_-]/g, '')
  if (sanitized.length === 0 || sanitized.length > 63) {
    throw new Error('Invalid site name: must be 1-63 alphanumeric characters, hyphens, or underscores')
  }
  return sanitized
}


/**
 * Validates upload directory path to prevent path traversal
 * Allows paths in OS temp dir (where uploads are stored) or within project root
 */
export function validateUploadDir(uploadDir: string, baseDir: string): string {
  const resolved = path.resolve(uploadDir)
  const resolvedBase = path.resolve(baseDir)
  const uploadBase = path.resolve(path.join(os.tmpdir(), 'port-uploads'))

  const isInTmp = resolved.startsWith(uploadBase)
  const isInProject = resolved.startsWith(resolvedBase)

  if (!isInTmp && !isInProject) {
    throw new Error('Invalid upload directory: path traversal attempt detected')
  }

  return resolved
}

/**
 * Validates that a string contains no shell metacharacters
 */
export function validateNoShellMetacharacters(value: string, fieldName: string): void {
  const dangerousChars = /[;&|$`\\<>!{}[\]]/
  if (dangerousChars.test(value)) {
    throw new Error(`${fieldName} contains invalid characters`)
  }
}

/**
 * Runs a deployment command securely with proper argument separation
 */
export async function runDeployCommand(
  command: string,
  args: string[],
  options: {
    cwd?: string
    env?: NodeJS.ProcessEnv
    timeout?: number
  } = {}
): Promise<ProviderDeployResult> {
  try {
    const { stdout, stderr, exitCode } = await secureSpawn(command, args, options)
    const output = stdout + stderr
    
    if (exitCode !== 0) {
      return { success: false, logs: output, error: `Command exited with code ${exitCode}` }
    }
    
    return { success: true, logs: output }
  } catch (error: any) {
    return { success: false, logs: '', error: error.message }
  }
}