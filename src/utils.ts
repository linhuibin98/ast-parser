// 字母 a-z A-Z
export function isAlpha(char: string): boolean {
  return (char >= "a" && char <= "z") || (char >= "A" && char <= "Z");
}

// 分隔符
export function isWhiteSpace(char: string): boolean {
  return char === " " || char === "\t" || char === "\n" || char === "\r";
}

// 数字
export function isDigit(char: string): boolean {
  return char >= "0" && char <= "9";
}

// 下划线
export function isUnderline(char: string): boolean {
  return char === "_";
}
