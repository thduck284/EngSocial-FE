export function loadScriptOnce(src) {
  if (typeof document === 'undefined') return Promise.reject(new Error('No document'))
  const existing = document.querySelector(`script[src="${src}"]`)
  if (existing) return Promise.resolve()
  return new Promise((resolve, reject) => {
    const s = document.createElement('script')
    s.src = src
    s.async = true
    s.defer = true
    s.onload = () => resolve()
    s.onerror = () => reject(new Error(`Failed to load ${src}`))
    document.head.appendChild(s)
  })
}

export async function getGoogleIdToken() {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID
  if (!clientId) throw new Error('Missing VITE_GOOGLE_CLIENT_ID')
  await loadScriptOnce('https://accounts.google.com/gsi/client')
  const google = window.google
  if (!google?.accounts?.id) throw new Error('Google SDK not available')

  return await new Promise((resolve, reject) => {
    let done = false
    google.accounts.id.initialize({
      client_id: clientId,
      callback: (resp) => {
        if (done) return
        done = true
        if (resp?.credential) resolve(resp.credential)
        else reject(new Error('Google did not return credential'))
      },
    })
    google.accounts.id.prompt((notification) => {
      if (done) return
      if (notification?.isNotDisplayed?.() || notification?.isSkippedMoment?.()) {
        done = true
        reject(new Error('Google login popup was blocked or dismissed'))
      }
    })
  })
}

/** Gọi khi trang là http: — Facebook SDK chặn FB.login */
export function isFacebookSdkBlockedOnHttp() {
  if (typeof window === 'undefined') return false
  return window.location.protocol === 'http:'
}

let _fbInitialized = false

export async function getFacebookAccessToken() {
  if (isFacebookSdkBlockedOnHttp()) {
    throw new Error(
      'Facebook chỉ chạy trên HTTPS. Trên máy hãy dùng Google / email; thử Facebook trên bản deploy (Render).'
    )
  }
  const appId = import.meta.env.VITE_FACEBOOK_APP_ID
  if (!appId) throw new Error('Missing VITE_FACEBOOK_APP_ID')
  await loadScriptOnce('https://connect.facebook.net/en_US/sdk.js')
  const FB = window.FB
  if (!FB) throw new Error('Facebook SDK not available')

  if (!_fbInitialized) {
    await new Promise((resolve) => {
      FB.init({
        appId,
        cookie: true,
        xfbml: false,
        version: import.meta.env.VITE_FACEBOOK_GRAPH_VERSION || 'v19.0',
      })
      resolve()
    })
    _fbInitialized = true
  }


  return await new Promise((resolve, reject) => {
    FB.login(
      (response) => {
        console.log('[FB.login] response:', JSON.stringify(response))
        const token = response?.authResponse?.accessToken
        if (token) resolve(token)
        else reject(new Error('Facebook login cancelled'))
      },
      { scope: 'public_profile,email' }
    )
  })
}
