import { isAlpha, isDigit, isWhiteSpace } from "./utils";

// 关键字
export enum TokenType {
  // let
  Let = 'Let',
  // const
  Const = "Const",
  // var
  Var = "Var",
  // =
  Assign = 'Assign',
  // function
  Function = 'Function',
  // 数字 1, 1.0
  Number = "Number",
  // 变量名
  Identifier = 'Identifier',
  // (
  LeftParen = 'LeftParen',
  // )
  RightParen = 'RightParen',
  // {
  LeftCurly = 'LeftCurly',
  // }
  RightCurly = 'RightCurly',
  // ;
  Semicolon = 'Semicolon',
  // ,
  Comma = 'Comma',
  // *
  Asterisk = 'Asterisk',
  // .
  Dot = 'Dot',
  // import
  Import = "Import",
  // export
  Export = "Export",
  // form
  From = 'from',
  // as
  As = 'As',
  // default
  Default = 'Default',
  // 字符串
  StringLiteral = "StringLiteral",
  // 运算符 + - * /
  Operator = 'Operator',
  // return
  Return = 'Return'
}

export interface Token {
  type: TokenType;
  start: number;
  end: number;
  value?: string;
  raw?: string;
};

const TOKENS_GENERATOR: Record<string, (...args: any[]) => Token> = {
  identifier(start: number, value: string) {
    return {
      type: TokenType.Identifier,
      value,
      start,
      end: start + value.length,
    };
  },
  let(start: number) {
    return { type: TokenType.Let, value: "let", start, end: start + 3 };
  },
  const(start: number) {
    return { type: TokenType.Const, value: "const", start, end: start + 5 };
  },
  var(start: number) {
    return { type: TokenType.Var, value: "var", start, end: start + 3 };
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
  number(start: number, value: string) {
    return {
      type: TokenType.Number,
      value,
      start,
      end: start + value.length,
      raw: value,
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
  semicolon(start: number) {
    return { type: TokenType.Semicolon, value: ";", start, end: start + 1 };
  },
  comma(start: number) {
    return {
      type: TokenType.Comma,
      value: ",",
      start,
      end: start + 1,
    };
  },
  asterisk(start: number) {
    return {
      type: TokenType.Asterisk,
      value: "*",
      start,
      end: start + 1,
    };
  },
  dot(start: number) {
    return { type: TokenType.Dot, value: ".", start, end: start + 1 };
  },
  import(start: number) {
    return { type: TokenType.Import, value: "import", start, end: start + 6 };
  },
  export(start: number) {
    return { type: TokenType.Export, value: "import", start, end: start + 6 };
  },
  from(start: number) {
    return {
      type: TokenType.From,
      value: "from",
      start,
      end: start + 4,
    };
  },
  as(start: number) {
    return {
      type: TokenType.As,
      value: "as",
      start,
      end: start + 2,
    };
  },
  default(start: number) {
    return {
      type: TokenType.Default,
      value: "default",
      start,
      end: start + 7,
    };
  },
  stringLiteral(start: number, value: string, raw: string) {
    return {
      type: TokenType.StringLiteral,
      value,
      start,
      end: start + value.length + 2,
      raw
    };
  },
  operator(start: number, value: string) {
    return {
      type: TokenType.Operator,
      value,
      start,
      end: start + value.length,
    };
  },
  return(start: number) {
    return {
      type: TokenType.Return,
      value: "return",
      start,
      end: start + 6,
    };
  },
};

// 单字符
export type SingleCharTokens = "(" | ")" | "{" | "}" | '=' | ';' | ',' | '*' | '.';

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
    [";", TOKENS_GENERATOR.semicolon],
    [",", TOKENS_GENERATOR.comma],
    ["*", TOKENS_GENERATOR.asterisk],
    [".", TOKENS_GENERATOR.dot],
]);

// 字符串引号
const QUOTATION_TOKENS = ["'", '"', "`"];

// 操作符
const OPERATOR_TOKENS = [
  "+",
  "-",
  "*",
  "/",
  "%",
  "^",
  "&",
  "|",
  "~",
  "<<",
  ">>",
];

export enum ScanMode {
  Normal,
  Identifier,
  StringLiteral,
  Number,
}

export class Tokenizer {
    private _tokens: Token[] = [];
    private _currentIndex: number = 0;
    private _source: string;
    private _scanMode = ScanMode.Normal;

    constructor(input: string) {
        this._source = input;
    }

    tokenize(): Token[] {
        while (this._currentIndex < this._source.length) {
            let currentChar = this._source[this._currentIndex];
            const startIndex = this._currentIndex;

            // 根据语法规则进行 token 分组
            // 1. 处理分隔符
            if (isWhiteSpace(currentChar)) {
                this._currentIndex++;
                continue;
            }
            // 2. 处理字母 a-z A-Z
            else if (isAlpha(currentChar)) {
                this.scanIdentifier();
                continue;
            }
            // 3. 处理单字符 符号 () {} . ; *
            else if (KNOWN_SINGLE_CHAR_TOKENS.has(currentChar as SingleCharTokens)) {
                // * 字符特殊处理
                if (currentChar === '*') {
                  // 前瞻，如果是非 import/export，则认为是二元运算符，避免误判
                  const preToken = this._getPreviousToken();
                  if (preToken.type !== TokenType.Import && preToken.type !== TokenType.Export) {
                    this._tokens.push(
                      TOKENS_GENERATOR.operator(startIndex, currentChar)
                    );
                    this._currentIndex++;
                    continue;
                  }
                  // 否则按照 import/export 中的 * 处理
                }
                const token = KNOWN_SINGLE_CHAR_TOKENS.get(currentChar as SingleCharTokens)!(startIndex);
                this._tokens.push(token);
                this._currentIndex++;
                continue;
            }
            // 4. 判断是否为引号
            else if (QUOTATION_TOKENS.includes(currentChar)) {
              this.scanStringLiteral();
              // 跳过结尾的引号
              this._currentIndex++;
              continue;
            }
            // 5. 判断是否是二元操作符、计算符
            else if (
              OPERATOR_TOKENS.includes(currentChar) &&
              this._scanMode === ScanMode.Normal
            ) {
              this._tokens.push(TOKENS_GENERATOR.operator(startIndex, currentChar));
              this._currentIndex++;
              continue;
            }
            // 6. 判断是否是数字
            else if (isDigit(currentChar)) {
              this.scanNumber();
              continue;
            }
        }

        this._resetCurrentIndex();

        return this._getTokens();
    }

    scanNumber() {
      this._setScanMode(ScanMode.Number);
      const startIndex = this._currentIndex;
      let currentChar = this._getCurrentChar();
      let num = '';
      let isFloat = false;
      // 如果是数字，则继续扫描
      // 需要考虑到小数点
      while(isDigit(currentChar) || (!isFloat && currentChar === '.')) {
        if (!isFloat && currentChar === '.') {
          isFloat = true;
        }
        num += currentChar;
        this._currentIndex++;
        currentChar = this._getCurrentChar();
      }
      // 多个 "."
      if (isFloat && currentChar === '.') {
        throw new Error('Unexpected character "."');
      }

      const token = TOKENS_GENERATOR.number(startIndex, num);

      this._tokens.push(token);

      this._resetScanMode();
    }

    scanStringLiteral() {
      this._setScanMode(ScanMode.StringLiteral);
      const startIndex = this._currentIndex;
      // 开始的引号
      const startQuotationChar = this._getCurrentChar();
      this._currentIndex++;
      let currentChar = this._getCurrentChar();
      let stringLiteral = '';
      // 继续扫描，直到收集完整的字符串， 有可能一直结束没有，此时报错
      while(currentChar && currentChar !== startQuotationChar) {
        stringLiteral += currentChar;
        this._currentIndex++;
        currentChar = this._getCurrentChar();
      }

      if (!currentChar) {
        throw new Error(`Missing end quote "${startQuotationChar}"`);
      }

      const token = TOKENS_GENERATOR.stringLiteral(startIndex, stringLiteral);
      
      this._tokens.push(token);

      this._resetScanMode();
    }

    scanIdentifier() {
      this._setScanMode(ScanMode.Identifier);
      let currentChar = this._getCurrentChar();
      let identifier = '';
      const startIndex = this._currentIndex;
       // 继续扫描，直到收集完整的单词
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
      this._resetScanMode();
    }

    private _getCurrentChar() {
      return this._source[this._currentIndex];
    }

    private _getNextChar() {
      if (this._currentIndex + 1 < this._source.length) {
        return this._source[this._currentIndex + 1];
      }
      return "";
    }

    private _resetCurrentIndex() {
      this._currentIndex = 0;
    }

    private _getTokens() {
      return this._tokens;
    }

    private _getPreviousToken() {
      // 前瞻 Token
      if (this._tokens.length > 0) {
        return this._tokens[this._tokens.length - 1];
      }
      throw new Error("Previous token not found");
    }

    private _setScanMode(mode: ScanMode) {
      this._scanMode = mode;
    }

    private _resetScanMode() {
      this._scanMode = ScanMode.Normal;
    }
}
