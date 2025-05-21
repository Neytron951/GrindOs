class GrindVM {
    constructor(api = {}) {
        this.variables = {};
        this.functions = {};
        this.api = api; // Inject API
        this.outputBuffer = [];
        this.outputHandler = null;
    }

    async execute(ast) {
        this.outputBuffer = [];
        console.log("VM: Начало выполнения AST:", ast);

        try {
            for (const node of ast.body) {
                console.log("VM: Выполнение узла:", node);
                await this.executeNode(node);
            }
        } catch (error) {
            console.error("VM: Ошибка при выполнении:", error);
            console.error("VM: Stack trace:", error.stack);
            // Обработка ошибки (например, вывод сообщения об ошибке)
            return "Ошибка выполнения: " + error.message; // Или как-то иначе
        }

        console.log("VM: Выполнение завершено, результат:", this.outputBuffer);
        return this.outputBuffer.join('\n');
    }

    setOutputHandler(handler) {
      this.outputHandler = handler; // Добавлено: Метод для установки обработчика
    }

    async executeNode(node) {

        try {



            switch (node.type) {
                case 'Program':
                    for (const statement of node.body) {
                        await this.executeNode(statement);
                    }
                    break;
                case 'VariableDeclaration':
                    this.variables[node.name] = await this.evaluate(node.value);
                    console.log("VM: Объявлена переменная:", node.name, "=", this.variables[node.name]); // Отладка
                    break;
                case 'FunctionDeclaration':
                    this.functions[node.name] = node;
                    console.log("VM: Объявлена функция:", node.name); // Отладка
                    break;
                case 'IfStatement':
                    const condition = await this.evaluate(node.condition);
                    console.log("VM: Условие if:", condition); // Отладка
                    if (condition) {
                        for (const statement of node.body) {
                            await this.executeNode(statement);
                        }
                    } else if (node.alternate) {
                        for (const statement of node.alternate) {
                            await this.executeNode(statement);
                        }
                    }
                    break;
                case 'LoopStatement':
                    await this.executeLoop(node);
                    break;
                case 'PrintStatement':
                    const value = await this.evaluate(node.expression);
                    const output = String(value);
                    this.outputBuffer.push(output);
                    console.log("VM: Вывод в консоль:", output); // Отладка
                    break;
                case 'ReturnStatement':
                    const returnValue = await this.evaluate(node.argument);
                    console.log("VM: Возвращаемое значение:", returnValue); // Отладка
                    return returnValue;
                case 'ExpressionStatement':
                    await this.evaluate(node.expression);
                    break;
                default:
                    throw new Error(`Неизвестный тип узла: ${node.type}`);
            }
        } catch (error) {
          console.error("VM: Ошибка в executeNode:", error);
          console.error("VM: Stack trace:", error.stack);
          throw error; // Перебрасываем ошибку для обработки в execute
        }
    }

    async executeLoop(node) {
        // Выполняем инициализацию
        await this.executeNode(node.init);

        // Выполняем цикл пока условие истинно
        while (await this.evaluate(node.condition)) {
            // Выполняем тело цикла
            for (const statement of node.body) {
                await this.executeNode(statement);
            }

            // Выполняем обновление
            await this.executeNode(node.update);
        }
    }


    async evaluate(node) {

      try {


        console.log("VM: Вычисление выражения:", node); // Отладка
        switch (node.type) {
            case 'Literal':
                return node.value;
            case 'Identifier':
                return this.variables[node.name];
            case 'ArrayLiteral':
                const elements = [];
                for (const element of node.elements) {
                    elements.push(await this.evaluate(element));
                }
                return elements;
            case 'BinaryExpression':
                const left = await this.evaluate(node.left);
                const right = await this.evaluate(node.right);
                switch (node.operator) {
                    case '+': return left + right;
                    case '-': return left - right;
                    case '*': return left * right;
                    case '/': return left / right;
                    case '==': return left === right;
                    case '!=': return left !== right;
                    case '<': return left < right;
                    case '>': return left > right;
                    case '<=': return left <= right;
                    case '>=': return left >= right;
                    case 'and': return left && right;
                    case 'or': return left || right;
                    default: throw new Error(`Неизвестный оператор: ${node.operator}`);
                }
            default:
                throw new Error(`Неизвестный тип выражения: ${node.type}`);
        }
      } catch (error) {
          console.error("VM: Ошибка в evaluate:", error);
          console.error("VM: Stack trace:", error.stack);
          throw error; // Перебрасываем ошибку для обработки в execute
      }
    }
}
