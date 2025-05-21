class GrindParser {
    constructor(tokens) {
        this.tokens = tokens;
        this.position = 0;
        console.log("PARSER: Инициализация парсера с токенами:", tokens); // Отладка
    }

    parse() {
        const program = { type: 'Program', body: [] };
        console.log("PARSER: Начало разбора программы");

        try {
            while (this.position < this.tokens.length) {
                const statement = this.parseStatement();
                if (statement) { // Добавлена проверка на null
                  program.body.push(statement);
                  console.log("PARSER: Добавлено выражение:", statement);
                } else {
                  //console.warn("PARSER: Пропуск пустой инструкции (возможно, точка с запятой)");
                  // Обработка случая, когда parseStatement() возвращает null.  Например, это может произойти,
                  // если в конце файла стоит точка с запятой. Или при ошибке в parseStatement.
                  this.position++; // Пропускаем токен
                }
            }
        } catch (error) {
            console.error("PARSER: Ошибка при разборе:", error);
            console.error("PARSER: Stack trace:", error.stack);
            return { type: 'Program', body: [] }; //  Возвращаем "пустую" программу или обрабатываем ошибку по-другому
        }

        console.log("PARSER: Результат разбора:", program);
        return program;
    }

    parseStatement() {

        try {


            const token = this.tokens[this.position];
            console.log("PARSER: Разбор выражения, текущий токен:", token); // Отладка

            if (!token) {
                return null; // Или выбросить ошибку, если ожидается, что токены всегда будут
            }

            switch (token.type) {
                case 'KEYWORD':
                    switch (token.value) {
                        case 'var':
                            return this.parseVariableDeclaration();
                        case 'func':
                            return this.parseFunctionDeclaration();
                        case 'if':
                            return this.parseIfStatement();
                        case 'loop':
                            return this.parseLoopStatement();
                        case 'print':
                            return this.parsePrintStatement();
                        case 'return':
                            return this.parseReturnStatement();
                        default:
                            throw new Error(`Неизвестное ключевое слово: ${token.value}`);
                    }
                default:
                    return this.parseExpressionStatement();

            }
        } catch (error) {
            console.error("PARSER: Ошибка при разборе выражения:", error);
            console.error("PARSER: Stack trace:", error.stack);
            this.position++; // Пропускаем токен, чтобы избежать зацикливания (возможно, не лучший вариант, зависит от логики)
            return null; // Или обработать ошибку другим способом.
        }
    }

    parseVariableDeclaration() {
        this.position++; // var
        const name = this.expect('IDENTIFIER').value;
        this.expect('OPERATOR', '=');
        const value = this.parseExpression();
        this.expect('PUNCTUATION', ';');
        const declaration = { type: 'VariableDeclaration', name, value };
        console.log("PARSER: Создано объявление переменной:", declaration); // Отладка
        return declaration;
    }

    parseFunctionDeclaration() {
        this.position++; // func
        const name = this.expect('IDENTIFIER').value;
        this.expect('PUNCTUATION', '(');
        const params = [];
        while (this.tokens[this.position].type === 'IDENTIFIER') {
            params.push(this.expect('IDENTIFIER').value);
            if (this.tokens[this.position].value === ',') {
                this.position++; // ,
            }
        }
        this.expect('PUNCTUATION', ')');
        this.expect('PUNCTUATION', '{');
        const body = [];
        while (this.tokens[this.position].value !== '}') {
            body.push(this.parseStatement());
        }
        this.expect('PUNCTUATION', '}');
        const funcDeclaration = { type: 'FunctionDeclaration', name, params, body };
        console.log("PARSER: Создано объявление функции:", funcDeclaration); // Отладка
        return funcDeclaration;
    }

    parseIfStatement() {
        this.position++; // if
        this.expect('PUNCTUATION', '(');
        const condition = this.parseExpression();
        this.expect('PUNCTUATION', ')');
        this.expect('PUNCTUATION', '{');
        const body = [];
        while (this.tokens[this.position].value !== '}') {
            body.push(this.parseStatement());
        }
        this.expect('PUNCTUATION', '}');
        let alternate = null;
        if (this.tokens[this.position] && this.tokens[this.position].value === 'else') {
            this.position++; // else
            this.expect('PUNCTUATION', '{');
            alternate = [];
            while (this.tokens[this.position].value !== '}') {
                alternate.push(this.parseStatement());
            }
            this.expect('PUNCTUATION', '}');
        }
        const ifStatement = { type: 'IfStatement', condition, body, alternate };
        console.log("PARSER: Создана конструкция if:", ifStatement); // Отладка
        return ifStatement;
    }

    parseLoopStatement() {
        this.position++; // loop
        this.expect('PUNCTUATION', '(');
        const init = this.parseVariableDeclaration();
        const condition = this.parseExpression();
        this.expect('PUNCTUATION', ';');
        const update = this.parseExpression();
        this.expect('PUNCTUATION', ')');
        this.expect('PUNCTUATION', '{');
        const body = [];
        while (this.tokens[this.position].value !== '}') {
            body.push(this.parseStatement());
        }
        this.expect('PUNCTUATION', '}');
        const loopStatement = { type: 'LoopStatement', init, condition, update, body };
        console.log("PARSER: Создан цикл loop:", loopStatement); // Отладка
        return loopStatement;
    }

    parsePrintStatement() {
        this.position++; // print
        this.expect('PUNCTUATION', '(');
        const expression = this.parseExpression();
        this.expect('PUNCTUATION', ')');
        this.expect('PUNCTUATION', ';');
        const printStatement = { type: 'PrintStatement', expression };
        console.log("PARSER: Создан вывод print:", printStatement); // Отладка
        return printStatement;
    }

    parseReturnStatement() {
        this.position++; // return
        const argument = this.parseExpression();
        this.expect('PUNCTUATION', ';');
        const returnStatement = { type: 'ReturnStatement', argument };
        console.log("PARSER: Создан return:", returnStatement); // Отладка
        return returnStatement;
    }

    parseExpressionStatement() {
        const expression = this.parseExpression();
        // Добавить проверку на существование точки с запятой
        if (this.tokens[this.position]?.value === ';') {
            this.expect('PUNCTUATION', ';');
        }
        return { type: 'ExpressionStatement', expression };
    }

    parseExpression() {
        return this.parseEquality(); // Упрощенная логика
    }

    parseEquality() {
        let left = this.parseTerm();
        while (this.tokens[this.position] && (this.tokens[this.position].value === '==' || this.tokens[this.position].value === '!=')) {
            const operator = this.expect('OPERATOR').value;
            const right = this.parseTerm();
            left = { type: 'BinaryExpression', operator, left, right };
            console.log("PARSER: Создано выражение равенства:", left); // Отладка
        }
        return left;
    }

    parseTerm() {
        let left = this.parseFactor();
        while (this.tokens[this.position] && (this.tokens[this.position].value === '+' || this.tokens[this.position].value === '-')) {
            const operator = this.expect('OPERATOR').value;
            const right = this.parseFactor();
            left = { type: 'BinaryExpression', operator, left, right };
            console.log("PARSER: Создано слагаемое:", left); // Отладка
        }
        return left;
    }

    parseFactor() {
        let left = this.parsePrimary();
        while (this.tokens[this.position] && (this.tokens[this.position].value === '*' || this.tokens[this.position].value === '/')) {
            const operator = this.expect('OPERATOR').value;
            const right = this.parsePrimary();
            left = { type: 'BinaryExpression', operator, left, right };
            console.log("PARSER: Создан множитель:", left); // Отладка
        }
        return left;
    }

    parsePrimary() {
        const token = this.tokens[this.position];
        console.log("PARSER: Разбор первичного выражения, токен:", token); // Отладка
        this.position++;

        switch (token.type) {
            case 'NUMBER':
                const numberLiteral = { type: 'Literal', value: Number(token.value) };
                console.log("PARSER: Создан числовой литерал:", numberLiteral); // Отладка
                return numberLiteral;
            case 'STRING':
                const stringLiteral = { type: 'Literal', value: token.value };
                console.log("PARSER: Создан строковый литерал:", stringLiteral); // Отладка
                return stringLiteral;
            case 'IDENTIFIER':
                const identifier = { type: 'Identifier', name: token.value };
                console.log("PARSER: Создан идентификатор:", identifier); // Отладка
                return identifier;
            case 'PUNCTUATION':
                if (token.value === '(') {
                    const expression = this.parseExpression();
                    this.expect('PUNCTUATION', ')');
                    return expression;
                }
                if (token.value === '[') {
                    const elements = [];
                    while (this.tokens[this.position].value !== ']') {
                        elements.push(this.parseExpression());
                        if (this.tokens[this.position].value === ',') {
                            this.position++; // ,
                        }
                    }
                    this.expect('PUNCTUATION', ']');
                    const arrayLiteral = { type: 'ArrayLiteral', elements };
                    console.log("PARSER: Создан массив:", arrayLiteral); // Отладка
                    return arrayLiteral;
                }
            default:
                throw new Error(`Неожиданный токен: ${token.value}`);
        }
    }

    expect(type, value) {
      try {
        const token = this.tokens[this.position];
        console.log(`Expecting: ${type}='${value}', Current:`, token);

        if (!token) throw new Error(`Unexpected end of input, expected ${type}`);
        if (token.type !== type) throw new Error(`Expected ${type} but got ${token.type} (${token.value})`);
        if (value && token.value !== value) throw new Error(`Expected '${value}' but got '${token.value}'`);

        this.position++;
        return token;
      } catch (error) {
        console.error("PARSER: Ошибка в expect:", error);
        console.error("PARSER: Stack trace:", error.stack);
        throw error; // Перебрасываем ошибку, чтобы она была обработана в вызывающем коде
      }
    }
}
