import { getCredential } from '../credentials/service'
import { Provider } from '../../shared/types'
import { spawn } from 'child_process'

export interface ProviderSite {
  name: string
  url: string
  provider: string
  updatedAt: string | null
}

async function fetchNetlifySites(token: string): Promise<ProviderSite[]> {
  const res = await fetch('https://api.netlify.com/api/v1/sites', {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) throw new Error(`Netlify API error: ${res.status}`)
  const sites = await res.json() as any[]
  return sites.map((s) => ({
    name: s.name || s.slug,
    url: s.ssl_url || s.url || `https://${s.name}.netlify.app`,
    provider: 'netlify',
    updatedAt: s.updated_at || null,
  }))
}

async function fetchVercelSites(token: string): Promise<ProviderSite[]> {
  const res = await fetch('https://api.vercel.com/v9/projects', {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) throw new Error(`Vercel API error: ${res.status}`)
  const data = await res.json() as any
  const projects = data.projects || []
  return projects.map((p: any) => ({
    name: p.name,
    url: p.latestDeployment?.url || `https://${p.name}.vercel.app`,
    provider: 'vercel',
    updatedAt: p.updatedAt || null,
  }))
}

async function fetchGitHubSites(token: string): Promise<ProviderSite[]> {
  const res = await fetch('https://api.github.com/user/repos?per_page=100&sort=updated', {
    headers: { Authorization: `token ${token}`, Accept: 'application/vnd.github.v3+json' },
  })
  if (!res.ok) throw new Error(`GitHub API error: ${res.status}`)
  const repos = await res.json() as any[]
  const sites: ProviderSite[] = []
  for (const repo of repos) {
    try {
      const pagesRes = await fetch(`https://api.github.com/repos/${repo.full_name}/pages`, {
        headers: { Authorization: `token ${token}`, Accept: 'application/vnd.github.v3+json' },
      })
      if (pagesRes.ok) {
        const pages = await pagesRes.json() as any
        sites.push({
          name: repo.name,
          url: pages.html_url || `https://${repo.owner.login}.github.io/${repo.name}`,
          provider: 'github',
          updatedAt: pages.updated_at || repo.updated_at || null,
        })
      }
    } catch {
      // Pages not enabled for this repo, skip
    }
  }
  return sites
}

async function fetchSurgeSites(): Promise<ProviderSite[]> {
  return new Promise((resolve, reject) => {
    const child = spawn('npx', ['surge', 'list'], {
      env: { ...process.env, FORCE_COLOR: '0' },
      shell: false,
    })
    let stdout = ''
    let stderr = ''
    child.stdout?.on('data', (d) => { stdout += d.toString() })
    child.stderr?.on('data', (d) => { stderr += d.toString() })
    child.on('close', () => {
      const output = stdout + stderr
      const sites: ProviderSite[] = []
      const regex = /https?:\/\/[\w-]+\.surge\.sh/g
      let match
      while ((match = regex.exec(output)) !== null) {
        const url = match[0]
        const name = url.replace('https://', '').replace('.surge.sh', '')
        sites.push({ name, url, provider: 'surge', updatedAt: null })
      }
      resolve(sites)
    })
    child.on('error', (err) => reject(err))
  })
}

async function fetchCloudflareSites(token: string): Promise<ProviderSite[]> {
  const acctRes = await fetch('https://api.cloudflare.com/client/v4/accounts?per_page=1', {
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
  })
  if (!acctRes.ok) throw new Error(`Cloudflare API error: ${acctRes.status}`)
  const acctData = await acctRes.json() as any
  const account = acctData.result?.[0]
  if (!account) return []

  const res = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${account.id}/pages/projects?per_page=50`,
    { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }
  )
  if (!res.ok) throw new Error(`Cloudflare Pages API error: ${res.status}`)
  const data = await res.json() as any
  return (data.result || []).map((p: any) => ({
    name: p.name,
    url: p.subdomain ? `https://${p.subdomain}` : `https://${p.name}.pages.dev`,
    provider: 'cloudflare',
    updatedAt: p.latest_deployment?.created_on || null,
  }))
}

async function fetchFirebaseSites(token: string): Promise<ProviderSite[]> {
  const res = await fetch(
    'https://firebasehosting.googleapis.com/v1beta1/sites?pageSize=100',
    { headers: { Authorization: `Bearer ${token}` } }
  )
  if (!res.ok) throw new Error(`Firebase API error: ${res.status}`)
  const data = await res.json() as any
  return (data.sites || []).map((s: any) => ({
    name: s.name?.split('/')?.pop() || s.name,
    url: `https://${s.name?.split('/')?.pop()}.web.app`,
    provider: 'firebase',
    updatedAt: s.updateTime || null,
  }))
}

export async function fetchProviderSites(
  userId: string,
  provider: Provider
): Promise<ProviderSite[]> {
  if (provider === 'surge') {
    const cred = await getCredential(userId, 'surge')
    const token = cred?.token || process.env.SURGE_TOKEN
    if (!token) throw new Error('Surge not connected. Add your Surge token in Settings.')
    return fetchSurgeSites()
  }

  const cred = await getCredential(userId, provider)
  if (!cred?.token) throw new Error(`${provider} not connected. Add your credentials in Settings.`)

  switch (provider) {
    case 'netlify': return fetchNetlifySites(cred.token)
    case 'vercel': return fetchVercelSites(cred.token)
    case 'github': return fetchGitHubSites(cred.token)
    case 'cloudflare': return fetchCloudflareSites(cred.token)
    case 'firebase': return fetchFirebaseSites(cred.token)
    default: throw new Error(`Unsupported provider: ${provider}`)
  }
}
