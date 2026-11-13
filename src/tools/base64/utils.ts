export type DecodeResult = string | { error: string }

function bytesToBase64(bytes: Uint8Array, urlSafe: boolean): string {
  // 分块避免 fromCharCode spread 大数组栈溢出
  let binary = ''
  const CHUNK = 0x8000
  for (let i = 0; i < bytes.length; i += CHUNK) {
    const chunk = bytes.subarray(i, i + CHUNK)
    binary += String.fromCharCode(...chunk)
  }
  let b64 = btoa(binary)
  if (urlSafe) {
    b64 = b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
  }
  return b64
}

export function encodeBase64(text: string, urlSafe = false): string {
  const bytes = new TextEncoder().encode(text)
  return bytesToBase64(bytes, urlSafe)
}

function base64ToBytes(b64: string, urlSafe: boolean): Uint8Array {
  let s = b64
  if (urlSafe) {
    s = s.replace(/-/g, '+').replace(/_/g, '/')
    // 补齐 padding
    const pad = s.length % 4
    if (pad === 2) s += '=='
    else if (pad === 3) s += '='
  }
  const binary = atob(s)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i)
  }
  return bytes
}

export function decodeBase64(input: string, urlSafe = false): DecodeResult {
  const trimmed = input.trim()
  if (trimmed === '') return ''

  // 校验字符集（允许标准 base64 的 padding '='；urlSafe 无 padding）
  const alphabet = urlSafe
    ? /^[A-Za-z0-9\-_]*$/
    : /^[A-Za-z0-9+/=]*$/
  if (!alphabet.test(trimmed)) {
    return { error: '包含非 Base64 字符' }
  }
  // 去掉 padding 后校验长度
  const noPad = trimmed.replace(/=+$/, '')
  if (noPad.length % 4 === 1) {
    return { error: 'Base64 长度非法（mod 4 === 1）' }
  }

  try {
    const bytes = base64ToBytes(trimmed, urlSafe)
    const text = new TextDecoder().decode(bytes)
    return text
  } catch {
    return { error: 'Base64 解码失败' }
  }
}
