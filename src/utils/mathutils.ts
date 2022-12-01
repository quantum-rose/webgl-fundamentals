export class MathUtils {
    public static clamp(target: number, min: number, max: number) {
        if (target < min) return min;
        if (target > max) return max;
        return target;
    }
}
