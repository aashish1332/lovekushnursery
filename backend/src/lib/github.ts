import { Octokit } from '@octokit/rest'

// ── Types ───────────────────────────────────────────────────

interface UploadResult {
  cdnUrl: string
  filePath: string
  sha?: string // needed for deletion
}

// ── Octokit Singleton ───────────────────────────────────────

let _octokit: Octokit | null = null

function getOctokit(): Octokit {
  if (!_octokit) {
    const token = process.env.GITHUB_TOKEN
    if (!token) {
      throw new Error('GITHUB_TOKEN environment variable is not set')
    }
    _octokit = new Octokit({ auth: token })
  }
  return _octokit
}

// ── Upload ──────────────────────────────────────────────────

/**
 * Upload a file buffer to GitHub repo and return the jsDelivr CDN URL.
 *
 * @param buffer - File content as Buffer
 * @param filePath - Path within the repo (e.g., "plants/uuid.webp")
 * @param message - Commit message
 * @returns CDN URL and file path
 */
export async function uploadToGitHub(
  buffer: Buffer,
  filePath: string,
  message?: string
): Promise<UploadResult> {
  const owner = process.env.GITHUB_OWNER
  const repo = process.env.GITHUB_REPO

  if (!owner || !repo) {
    throw new Error('GITHUB_OWNER and GITHUB_REPO environment variables must be set')
  }

  const octokit = getOctokit()

  // Check if file already exists (needed for updates)
  let existingSha: string | undefined
  try {
    const { data } = await octokit.repos.getContent({
      owner,
      repo,
      path: filePath,
    })
    if ('sha' in data) {
      existingSha = data.sha
    }
  } catch (err: any) {
    // 404 means file doesn't exist — that's expected for new uploads
    if (err.status !== 404) {
      throw err
    }
  }

  // Upload (create or update)
  const { data } = await octokit.repos.createOrUpdateFileContents({
    owner,
    repo,
    path: filePath,
    message: message || `Upload ${filePath}`,
    content: buffer.toString('base64'),
    sha: existingSha, // if set, GitHub updates instead of creating
  })

  // Generate jsDelivr CDN URL
  const cdnUrl = `https://cdn.jsdelivr.net/gh/${owner}/${repo}@main/${filePath}`

  return {
    cdnUrl,
    filePath,
    sha: data.content?.sha,
  }
}

/**
 * Delete a file from GitHub repo (for plant deletion cleanup).
 */
export async function deleteFromGitHub(filePath: string): Promise<void> {
  const owner = process.env.GITHUB_OWNER
  const repo = process.env.GITHUB_REPO

  if (!owner || !repo) {
    throw new Error('GITHUB_OWNER and GITHUB_REPO environment variables must be set')
  }

  const octokit = getOctokit()

  // Get current file SHA (required for deletion)
  try {
    const { data } = await octokit.repos.getContent({
      owner,
      repo,
      path: filePath,
    })

    if ('sha' in data) {
      await octokit.repos.deleteFile({
        owner,
        repo,
        path: filePath,
        message: `Delete ${filePath}`,
        sha: data.sha,
      })
    }
  } catch (err: any) {
    if (err.status === 404) {
      // File already gone — not an error
      return
    }
    throw err
  }
}
