export type UrlDecodeResult = string | { error: string }

export function encodeUrl(input: string, uriOnly = false): string {
  return uriOnly ? encodeURI(input) : encodeURIComponent(input)
}

export function decodeUrl(input: string, _uriOnly = false): UrlDecodeResult {
  if (input === '') return ''
  try {
    return decodeURIComponent(input)
  } catch {
    // 定位第一个非法 % 序列
    const m = input.match(/%[0-9a-fA-F]?[^0-9a-fA-F]/)
    const pos = m ? input.indexOf(m[0]) : input.length - 1
    return {
      error: `非法的 URL 编码序列（位置 ${pos}）：${input.slice(pos, pos + 4)}...`,
    }
  }
}
