/**
 * カタカナをひらがなに変換
 */
export function katakanaToHiragana(str: string): string {
  return str.replace(/[\u30A1-\u30F6]/g, (match) =>
    String.fromCharCode(match.charCodeAt(0) - 0x60)
  )
}

/**
 * ひらがなをカタカナに変換
 */
export function hiraganaToKatakana(str: string): string {
  return str.replace(/[\u3041-\u3096]/g, (match) =>
    String.fromCharCode(match.charCodeAt(0) + 0x60)
  )
}

/**
 * 文字列を正規化（ひらがな・小文字に統一）
 */
export function normalizeForSearch(str: string): string {
  return katakanaToHiragana(str.toLowerCase())
}

/**
 * 50音の行を取得（ア行、カ行など）
 */
export function getKanaRow(char: string): string {
  // ヴ（カタカナ）、ゔ（ひらがな）はア行として扱う
  if (char === 'ヴ' || char === 'ゔ') {
    return 'ア行'
  }

  const hiragana = katakanaToHiragana(char)
  const code = hiragana.charCodeAt(0)

  // ひらがな範囲外
  if (code < 0x3041 || code > 0x3096) {
    return 'その他'
  }

  // 50音行の判定
  if (code <= 0x304A) return 'ア行' // あ-お
  if (code <= 0x3054) return 'カ行' // か-ご
  if (code <= 0x305E) return 'サ行' // さ-ぞ
  if (code <= 0x3069) return 'タ行' // た-ど
  if (code <= 0x306E) return 'ナ行' // な-の
  if (code <= 0x307D) return 'ハ行' // は-ぽ
  if (code <= 0x3082) return 'マ行' // ま-も
  if (code <= 0x3088) return 'ヤ行' // や-よ
  if (code <= 0x308D) return 'ラ行' // ら-ろ
  if (code <= 0x3093) return 'ワ行' // わ-ん

  return 'その他'
}
