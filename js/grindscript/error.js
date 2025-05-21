class GrindError extends Error {
    constructor(message, pos) {
        super(`GrindScript Error: ${message}`);
        this.pos = pos;
    }

    static format(code, pos) {
        const lines = code.split('\n');
        let lineNum = 0;
        let lineStart = 0;

        for (let i = 0; i < lines.length; i++) {
            const lineEnd = lineStart + lines[i].length;
            if (pos >= lineStart && pos <= lineEnd) {
                lineNum = i + 1;
                break;
            }
            lineStart = lineEnd + 1;
        }

        return `Строка ${lineNum}: ${lines[lineNum-1]}\n${' '.repeat(pos - lineStart)}^`;
    }
}
