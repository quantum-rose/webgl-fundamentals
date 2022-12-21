export class MathUtil {
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
        const cache = MathUtil._factorialCache[n];
        if (cache !== undefined) {
            return cache;
        }
        return n * MathUtil.factorial(n - 1);
    }

    /**
     * 组合数
     */
    public static combination(n: number, m: number) {
        return MathUtil.factorial(n) / (MathUtil.factorial(m) * MathUtil.factorial(n - m));
    }

    /**
     * 是否是 2 的幂
     */
    public static isPowerOf2(n: number) {
        return (n & (n - 1)) === 0;
    }
}
