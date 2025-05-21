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
                if (statement) {
                    program.body.push(statement);
                    console.log("PARSER: Добавлено выражение:", statement);
                } else {
                    this.position++;
                }
            }
        } catch (error) {
            console.error("PARSER: Ошибка при разборе:", error);
            console.error("PARSER: Stack trace:", error.stack);
            throw error; // Бросаем ошибку дальше!
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
                            throw new GrindError(
                                `Неизвестное ключевое слово: "${token.value}". Проверьте синтаксис.`,
                                this.position
                            );
                    }
                default:
                    return this.parseExpressionStatement();
            }
        } catch (error) {
            if (!(error instanceof GrindError)) {
                error = new GrindError(
                    `Синтаксическая ошибка: ${error.message}`,
                    this.position
                );
            }
            console.error("PARSER: Ошибка при разборе выражения:", error);
            console.error("PARSER: Stack trace:", error.stack);
            this.position++; // Пропускаем токен, чтобы избежать зацикливания
            return null;
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

        if (!token) {
            throw new GrindError(
                "Неожиданный конец программы. Возможно, забыта закрывающая скобка или точка с запятой.",
                this.position
            );
        }

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
                // Если встретили пунктуацию, которую не ожидали
                throw new GrindError(
                    `Неожиданный символ "${token.value}". Возможно, опечатка или ошибка в расстановке скобок.`,
                    this.position
                );
            default:
                throw new GrindError(
                    `Неожиданный токен "${token.value}". Проверьте синтаксис — возможно, ошибка или опечатка.`,
                    this.position
                );
        }
    }

    expect(type, value) {
        try {
            const token = this.tokens[this.position];
            console.log(`Expecting: ${type}='${value}', Current:`, token);

            if (!token)
                throw new GrindError(
                    `Неожиданный конец программы. Ожидался "${value || type}". Возможно, забыта точка с запятой или закрывающая скобка.`,
                    this.position
                );
            if (token.type !== type)
                throw new GrindError(
                    `Синтаксическая ошибка: ожидался тип "${type}", а встретился "${token.type}" ("${token.value}").`,
                    this.position
                );
            if (value && token.value !== value)
                throw new GrindError(
                    `Синтаксическая ошибка: ожидался символ "${value}", а встретился "${token.value}". Возможно, опечатка или забыта запятая.`,
                    this.position
                );
            this.position++;
            return token;
        } catch (error) {
            if (!(error instanceof GrindError)) {
                error = new GrindError("Синтаксическая ошибка: " + error.message, this.position);
            }
            console.error("PARSER: Ошибка в expect:", error);
            throw error;
        }
    }
}
