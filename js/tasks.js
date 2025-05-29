const GameTasks = {
    // ==================== Уровень 1 (Сложность 1) ====================
    1: {
        difficulty: 1,
        description: "Выведите точно 'Hello world!' (включая восклицательный знак)",
        reward: 30,
        solution: "print('Hello world!');",
        testCases: [{
            input: [],
            expectedOutput: "Hello world!",
            strictMatch: true
        }],
        type: "output",
        requirements: {
            forbid: ["Hello world"]
        }
    },
    2: {
        difficulty: 1,
        description: "Выведите только число 5 (без пробелов и других символов)",
        reward: 30,
        solution: "print(5);",
        testCases: [{
            input: [],
            expectedOutput: "5",
            strictMatch: true
        }],
        type: "output"
    },
    3: {
        difficulty: 1,
        description: "Выведите результат сложения 3 и 2 (только число)",
        reward: 40,
        solution: "print(3 + 2);",
        testCases: [{
            input: [],
            expectedOutput: "5",
            strictMatch: true
        }],
        type: "output"
    },
    4: {
        difficulty: 1,
        description: "Выведите текст в точности: 'Результат: 10' (с пробелом после двоеточия)",
        reward: 40,
        solution: "print('Результат: ' + 10);",
        testCases: [{
            input: [],
            expectedOutput: "Результат: 10",
            strictMatch: true
        }],
        type: "output"
    },
    5: {
        difficulty: 1,
        description: "Выведите текст в точности: 'Числа: 1, 2, 3' (с пробелами после запятых)",
        reward: 50,
        solution: "print('Числа: 1, 2, 3');",
        testCases: [{
            input: [],
            expectedOutput: "Числа: 1, 2, 3",
            strictMatch: true
        }],
        type: "output"
    },

    // ==================== Уровень 2 (Сложность 2) ====================
    6: {
        difficulty: 2,
        description: "Объявите переменную num со значением 8 и выведите её (только число)",
        reward: 50,
        solution: "num = 8; print(num);",
        testCases: [{
            input: [],
            expectedOutput: "8",
            strictMatch: true
        }],
        type: "output",
        requirements: {
            require: ["num = 8"]
        }
    },
    7: {
        difficulty: 2,
        description: "Измените x=4 на 7 и выведите (только число)",
        reward: 60,
        solution: "x = 4; x = 7; print(x);",
        testCases: [{
            input: [],
            expectedOutput: "7",
            strictMatch: true
        }],
        type: "output",
        requirements: {
            require: ["x = 4", "x = 7"]
        }
    },
    8: {
        difficulty: 2,
        description: "Умножьте a=5 и b=3, выведите результат (только число)",
        reward: 70,
        solution: "a = 5; b = 3; print(a * b);",
        testCases: [{
            input: [],
            expectedOutput: "15",
            strictMatch: true
        }],
        type: "output",
        requirements: {
            require: ["a = 5", "b = 3"]
        }
    },
    9: {
        difficulty: 2,
        description: "Выведите точно: 'Добро пожаловать в GrindScript!' (с восклицательным знаком)",
        reward: 80,
        solution: 'name = "GrindScript"; print("Добро пожаловать в " + name + "!");',
        testCases: [{
            input: [],
            expectedOutput: "Добро пожаловать в GrindScript!",
            strictMatch: true
        }],
        type: "output",
        requirements: {
            require: ['name = "GrindScript"']
        }
    },
    10: {
        difficulty: 2,
        description: "Вычислите (x/2) + (y*3) для x=10, y=4 (только число)",
        reward: 90,
        solution: "x = 10; y = 4; print((x / 2) + (y * 3));",
        testCases: [{
            input: [],
            expectedOutput: "17",
            strictMatch: true
        }],
        type: "output",
        requirements: {
            require: ["x = 10", "y = 4"]
        }
    },

    // ==================== Уровень 3 (Сложность 3) ====================
    11: {
        difficulty: 3,
        description: "Проверьте четность числа 6. Выведите 'Четное' или 'Нечетное'",
        reward: 100,
        solution: "num = 6; if (num % 2 === 0) print('Четное'); else print('Нечетное');",
        testCases: [{ input: [], expectedOutput: "Четное" }],
        type: "output"
    },
    12: {
        difficulty: 3,
        description: "Сравните a=5 и b=3. Выведите 'a больше' или 'b больше'",
        reward: 110,
        solution: "a = 5; b = 3; if (a > b) print('a больше'); else print('b больше');",
        testCases: [{ input: [], expectedOutput: "a больше" }],
        type: "output"
    },
    13: {
        difficulty: 3,
        description: "Проверьте пароль '1234'. Если верно, выведите 'Доступ разрешен'",
        reward: 120,
        solution: 'pass = "1234"; if (pass === "1234") print("Доступ разрешен");',
        testCases: [{ input: [], expectedOutput: "Доступ разрешен" }],
        type: "output"
    },
    14: {
        difficulty: 3,
        description: "Проверьте возраст 15. Выведите 'Доступ запрещен'",
        reward: 130,
        solution: "age = 15; if (age >= 18) print('Доступ разрешен'); else print('Доступ запрещен');",
        testCases: [{ input: [], expectedOutput: "Доступ запрещен" }],
        type: "output"
    },
    15: {
        difficulty: 3,
        description: "Проверьте x=5 и y=10. Выведите 'Условие выполнено'",
        reward: 140,
        solution: "x = 5; y = 10; if (x > 0 && y > 0) print('Условие выполнено');",
        testCases: [{ input: [], expectedOutput: "Условие выполнено" }],
        type: "output"
    },

    // ==================== Уровень 4 (Сложность 4) ====================
    16: {
        difficulty: 4,
        description: "Выведите числа от 1 до 5 через пробел",
        reward: 150,
        solution: "for (i=1; i<=5; i++) print(i);",
        testCases: [{ input: [], expectedOutput: "1 2 3 4 5" }],
        type: "output"
    },
    17: {
        difficulty: 4,
        description: "Найдите сумму чисел от 1 до 10",
        reward: 160,
        solution: "sum = 0; for (i=1; i<=10; i++) sum += i; print(sum);",
        testCases: [{ input: [], expectedOutput: "55" }],
        type: "output"
    },
    18: {
        difficulty: 4,
        description: "Выведите четные числа от 2 до 10",
        reward: 170,
        solution: "for (i=2; i<=10; i+=2) print(i);",
        testCases: [{ input: [], expectedOutput: "2 4 6 8 10" }],
        type: "output"
    },
    19: {
        difficulty: 4,
        description: "Выведите элементы массива ['A', 'B', 'C']",
        reward: 180,
        solution: 'arr = ["A", "B", "C"]; for (i=0; i<arr.length; i++) print(arr[i]);',
        testCases: [{ input: [], expectedOutput: "A B C" }],
        type: "output"
    },
    20: {
        difficulty: 4,
        description: "Выведите таблицу умножения (3x)",
        reward: 190,
        solution: "for (i=1; i<=10; i++) print(3 * i);",
        testCases: [{ input: [], expectedOutput: "3 6 9 12 15 18 21 24 27 30" }],
        type: "output"
    },

    // ==================== Уровень 5 (Сложность 5) ====================
    21: {
        difficulty: 5,
        description: "Выведите числа от 5 до 1",
        reward: 200,
        solution: "i = 5; while (i >= 1) { print(i); i--; }",
        testCases: [{ input: [], expectedOutput: "5 4 3 2 1" }],
        type: "output"
    },
    22: {
        difficulty: 5,
        description: "Найдите сумму чисел от 1 до 10 (while)",
        reward: 210,
        solution: "sum = 0; i = 1; while (i <= 10) { sum += i; i++; } print(sum);",
        testCases: [{ input: [], expectedOutput: "55" }],
        type: "output"
    },
    23: {
        difficulty: 5,
        description: "Выведите нечетные числа от 1 до 9",
        reward: 220,
        solution: "i = 1; while (i <= 9) { print(i); i += 2; }",
        testCases: [{ input: [], expectedOutput: "1 3 5 7 9" }],
        type: "output"
    },
    24: {
        difficulty: 5,
        description: "Выведите элементы массива ['X', 'Y', 'Z']",
        reward: 230,
        solution: 'arr = ["X", "Y", "Z"]; i = 0; while (i < arr.length) { print(arr[i]); i++; }',
        testCases: [{ input: [], expectedOutput: "X Y Z" }],
        type: "output"
    },
    25: {
        difficulty: 5,
        description: "Выведите числа, кратные 5 (5-50)",
        reward: 240,
        solution: "i = 5; while (i <= 50) { print(i); i += 5; }",
        testCases: [{ input: [], expectedOutput: "5 10 15 20 25 30 35 40 45 50" }],
        type: "output"
    },

    // ==================== Уровень 6 (Сложность 6) ====================
    26: {
        difficulty: 6,
        description: "Найдите сумму элементов матрицы 3x3",
        reward: 250,
        solution: "matrix = [[1,2,3],[4,5,6],[7,8,9]]; sum=0; for (i=0; i<matrix.length; i++) { for (j=0; j<matrix[i].length; j++) sum += matrix[i][j]; } print(sum);",
        testCases: [{ input: [], expectedOutput: "45" }],
        type: "output"
    },
    27: {
        difficulty: 6,
        description: "Транспонируйте матрицу 3x3",
        reward: 260,
        solution: "matrix = [[1,2,3],[4,5,6],[7,8,9]]; transposed=[]; for (i=0; i<matrix[0].length; i++) { transposed[i]=[]; for (j=0; j<matrix.length; j++) transposed[i][j] = matrix[j][i]; } print(transposed);",
        testCases: [{ input: [], expectedOutput: "1,4,7 2,5,8 3,6,9" }],
        type: "output"
    },
    28: {
        difficulty: 6,
        description: "Найдите координаты элемента 10 в матрице",
        reward: 270,
        solution: "matrix = [[2,4,6],[8,10,12],[14,16,18]]; for (i=0; i<matrix.length; i++) { for (j=0; j<matrix[i].length; j++) { if (matrix[i][j] === 10) { print(`[${i},${j}]`); break; } } }",
        testCases: [{ input: [], expectedOutput: "[1,1]" }],
        type: "output"
    },
    29: {
        difficulty: 6,
        description: "Отсортируйте массив [5,3,8,1,2] пузырьком",
        reward: 280,
        solution: "arr = [5,3,8,1,2]; for (i=0; i<arr.length; i++) { for (j=0; j<arr.length-i-1; j++) { if (arr[j] > arr[j+1]) { temp=arr[j]; arr[j]=arr[j+1]; arr[j+1]=temp; } } } print(arr);",
        testCases: [{ input: [], expectedOutput: "1,2,3,5,8" }],
        type: "output"
    },
    30: {
        difficulty: 6,
        description: "Создайте шахматную доску 8x8",
        reward: 290,
        solution: "chess=[]; for (i=0; i<8; i++) { chess[i]=[]; for (j=0; j<8; j++) chess[i][j]=(i+j)%2===0?0:1; } print(chess);",
        testCases: [{ input: [], expectedOutput: "0,1,0,1,0,1,0,1 1,0,1,0,1,0,1,0 ..." }],
        type: "output"
    },

    // ==================== Уровень 7 (Сложность 7) ====================
    31: {
        difficulty: 7,
        description: "Рекурсивный факториал",
        reward: 300,
        solution: "function factorial(n) { if (n === 0) return 1; return n * factorial(n-1); } print(factorial(5));",
        testCases: [{ args: [5], expected: 120 }],
        type: "function"
    },
    32: {
        difficulty: 7,
        description: "Числа Фибоначчи",
        reward: 310,
        solution: "function fib(n) { if (n <= 1) return n; return fib(n-1) + fib(n-2); } print(fib(6));",
        testCases: [{ args: [6], expected: 8 }],
        type: "function"
    },
    33: {
        difficulty: 7,
        description: "Объект игрока с инвентарем",
        reward: 320,
        solution: "player = { name: 'Герой', inventory: [], addItem: function(item) { this.inventory.push(item); } }; player.addItem('Меч'); print(player.inventory);",
        testCases: [{ args: ["Меч"], expected: ["Меч"] }],
        type: "function"
    },
    34: {
        difficulty: 7,
        description: "Бинарный поиск",
        reward: 330,
        solution: "function binarySearch(arr, target) { let left=0, right=arr.length-1; while (left <= right) { const mid=Math.floor((left+right)/2); if (arr[mid]===target) return mid; if (arr[mid]<target) left=mid+1; else right=mid-1; } return -1; } print(binarySearch([1,3,5,7,9],7));",
        testCases: [{ args: [[1,3,5,7,9], 7], expected: 3 }],
        type: "function"
    },
    35: {
        difficulty: 7,
        description: "Обработка деления на ноль",
        reward: 340,
        solution: "function divide(a, b) { if (b === 0) throw new Error('Деление на ноль!'); return a / b; } try { divide(10,0); } catch (e) { print(e.message); }",
        testCases: [{ args: [5, 0], expectedError: "Деление на ноль!" }],
        type: "function"
    }
};
