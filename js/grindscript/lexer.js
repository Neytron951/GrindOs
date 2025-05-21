console.log("LEXER Start!")
class GrindLexer {
    constructor() {
        this.keywords = ['var', 'func', 'if', 'else', 'loop', 'print', 'input', 'return'];
        this.operators = ['+', '-', '*', '/', '=', '==', '!=', '<', '>', '<=', '>=', 'and', 'or', 'not', '%'];
        this.punctuation = ['(', ')', '{', '}', ';', ',', '[', ']'];
    }

    tokenize(code) {
        const tokens = [];
        let position = 0;
        console.log("LEXER: Начало токенизации кода:", code);

        try {
            while (position < code.length) {
                let char = code[position];
                console.log("LEXER: Текущий символ:", char, "Позиция:", position);

                // Обработка пробелов
                if (/\s/.test(char)) {
                    console.log("LEXER: Пробел, пропуск");
                    position++;
                    continue;
                }

                // Обработка комментариев
                if (char === '/' && code[position + 1] === '/') {
                    console.log("LEXER: Комментарий, пропуск");
                    while (position < code.length && code[position] !== '\n') {
                        position++;
                    }
                    continue;
                }

                // Обработка чисел
                if (/[0-9]/.test(char)) {
                    let number = '';
                    while (/[0-9.]/.test(code[position])) {
                        number += code[position];
                        position++;
                    }
                    tokens.push({ type: 'NUMBER', value: number });
                    console.log("LEXER: Создан токен NUMBER:", { type: 'NUMBER', value: number });
                    continue;
                }

                // Обработка строк
                if (char === '"') {
                    let string = '';
                    position++;
                    while (position < code.length && position < code.length && code[position] !== '"') {  // Добавлена проверка на конец строки
                        string += code[position];
                        position++;
                    }
                    if (position < code.length) { // Проверяем, что строка корректно закрыта
                      position++;
                      tokens.push({ type: 'STRING', value: string });
                      console.log("LEXER: Создан токен STRING:", { type: 'STRING', value: string });
                    } else {
                      throw new Error("Некорректно завершенная строка"); // Выбрасываем ошибку, если строка не закрыта
                    }
                    continue;
                }

                // Обработка идентификаторов (ключевые слова и имена переменных)
                if (/[a-zA-Z_]/.test(char)) {
                    let identifier = '';
                    while (/[a-zA-Z0-9_]/.test(code[position])) {
                        identifier += code[position];
                        position++;
                    }
                    if (this.keywords.includes(identifier)) {
                        tokens.push({ type: 'KEYWORD', value: identifier });
                        console.log("LEXER: Создан токен KEYWORD:", { type: 'KEYWORD', value: identifier });
                    } else {
                        tokens.push({ type: 'IDENTIFIER', value: identifier });
                        console.log("LEXER: Создан токен IDENTIFIER:", { type: 'IDENTIFIER', value: identifier });
                    }
                    continue;
                }

                // Обработка операторов из двух символов
                if (this.operators.includes(code.substring(position, position + 2))) {
                    const operator = code.substring(position, position + 2);
                    tokens.push({ type: 'OPERATOR', value: operator });
                    console.log("LEXER: Создан токен OPERATOR (2 символа):", { type: 'OPERATOR', value: operator });
                    position += 2;
                    continue;
                }

                // Обработка операторов из одного символа
                if (this.operators.includes(char)) {
                    tokens.push({ type: 'OPERATOR', value: char });
                    console.log("LEXER: Создан токен OPERATOR (1 символ):", { type: 'OPERATOR', value: char });
                    position++;
                    continue;
                }

                // Обработка пунктуации
                if (this.punctuation.includes(char)) {
                    tokens.push({ type: 'PUNCTUATION', value: char });
                    console.log("LEXER: Создан токен PUNCTUATION:", { type: 'PUNCTUATION', value: char });
                    position++;
                    continue;
                }

                // Если ни один из вышеперечисленных случаев не сработал, выбрасываем ошибку
                throw new GrindError(`Неизвестный символ: '${char}'. Возможно, опечатка или неподдерживаемый символ.`, position);

            }
        } catch (error) {
            console.error("LEXER: Ошибка при токенизации:", error);
            console.error("LEXER: Stack trace:", error.stack); // Важно для отладки
            return []; // Возвращаем пустой массив токенов или обрабатываем ошибку другим способом
        }

        console.log("LEXER: Результат токенизации:", tokens);
        return tokens;
    }
}
