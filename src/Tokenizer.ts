import { isAlpha } from "./utils";

export enum TokenType {
  // let
  Let = 'Let',
  // =
  Assign = 'Assign',
  // function
  Function = 'Function',
  // 变量名
  Identifier = 'Identifier',
  // (
  LeftParen = 'LeftParen',
  // )
  RightParen = 'RightParen',
  // {
  LeftCurly = 'LeftCurly',
  // }
  RightCurly = 'RightCurly'
}

export interface Token {
  type: TokenType;
  start: number;
  end: number;
  value?: string;
  raw?: string;
};

export type SingleCharTokens = "(" | ")" | "{" | "}" | "=";

const TOKENS_GENERATOR: Record<string, (...args: any[]) => Token> = {
  let(start: number) {
    return { type: TokenType.Let, value: "let", start, end: start + 3 };
  },
  assign(start: number) {
    return { type: TokenType.Assign, value: "=", start, end: start + 1 };
  },
  function(start: number) {
    return {
      type: TokenType.Function,
      value: "function",
      start,
      end: start + 8,
    };
  },
  leftParen(start: number) {
    return { type: TokenType.LeftParen, value: "(", start, end: start + 1 };
  },
  rightParen(start: number) {
    return { type: TokenType.RightParen, value: ")", start, end: start + 1 };
  },
  leftCurly(start: number) {
    return { type: TokenType.LeftCurly, value: "{", start, end: start + 1 };
  },
  rightCurly(start: number) {
    return { type: TokenType.RightCurly, value: "}", start, end: start + 1 };
  },
  identifier(start: number, value: string) {
    return {
      type: TokenType.Identifier,
      value,
      start,
      end: start + value.length,
    };
  },
};

// 单字符到 Token 生成器的映射
const KNOWN_SINGLE_CHAR_TOKENS = new Map<
SingleCharTokens,
typeof TOKENS_GENERATOR[keyof typeof TOKENS_GENERATOR]
>([
    ['(', TOKENS_GENERATOR.leftParen],
    [")", TOKENS_GENERATOR.rightParen],
    ["{", TOKENS_GENERATOR.leftCurly],
    ["}", TOKENS_GENERATOR.rightCurly],
    ["=", TOKENS_GENERATOR.assign],
]);

export class Tokenizer {
    private _tokens: Token[] = [];
    private _currentIndex: number = 0;
    private _source: string;
    constructor(input: string) {
        this._source = input;
    }
    tokenize(): Token[] {
        while (this._currentIndex < this._source.length) {
            let currentChar = this._source[this._currentIndex];
            const startIndex = this._currentIndex;

            // 根据语法规则进行 token 分组
            // 1. 处理空格
            if (currentChar === ' ') {
                this._currentIndex++;
                continue;
            }
            // 处理字母 a-z A-Z
            else if (isAlpha(currentChar)) {
                let identifier = '';
                while(isAlpha(currentChar)) {
                    identifier += currentChar;
                    this._currentIndex++;
                    currentChar = this._source[this._currentIndex];
                }
                let token: Token;
                if (identifier in TOKENS_GENERATOR) {
                    // 如果是关键字
                    token = TOKENS_GENERATOR[identifier as keyof typeof TOKENS_GENERATOR](startIndex);
                } else {
                    // 如果是普通标识符
                    token = TOKENS_GENERATOR["identifier"](startIndex, identifier);
                }
                this._tokens.push(token);
                continue;
            }
            // 3. 处理单字符 符号
            else if (KNOWN_SINGLE_CHAR_TOKENS.has(currentChar as SingleCharTokens)) {
                const token = KNOWN_SINGLE_CHAR_TOKENS.get(currentChar as SingleCharTokens)!(startIndex);
                this._tokens.push(token);
                this._currentIndex++;
                continue;
            }
        }
        return this._tokens;
    }
}
