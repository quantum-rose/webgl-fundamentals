export class MathUtils {
    private static _factorialCache: number[] = [1, 1, 2, 6];

    /**
     * 夹值
     */
    public static clamp(target: number, min: number, max: number) {
        if (target < min) return min;
        if (target > max) return max;
        return target;
    }

    /**
     * 阶乘
     */
    public static factorial(n: number): number {
        const cache = MathUtils._factorialCache[n];
        if (cache !== undefined) {
            return cache;
        }
        return n * MathUtils.factorial(n - 1);
    }

    /**
     * 组合数
     */
    public static combination(n: number, m: number) {
        return MathUtils.factorial(n) / (MathUtils.factorial(m) * MathUtils.factorial(n - m));
    }
}
