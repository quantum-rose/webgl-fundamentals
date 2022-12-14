import { ColorName } from '../../interfaces';

export class ColorFunction {
    private static _NAMES: Record<ColorName, string> = {
        black: '#000000',
        white: '#ffffff',
        red: '#ff0000',
        green: '#00ff00',
        blue: '#0000ff',
        fuchsia: '#ff00ff',
        cyan: '#00ffff',
        yellow: '#ffff00',
        orange: '#ff8000',
        gray: '#808080',
        purple: '#800080',
        pink: '#ffc0cb',
        skyblue: '#87ceeb',
    };

    public static hexToRGB(hex: string) {
        if (hex.length === 4) hex = hex[0] + hex[1] + hex[1] + hex[2] + hex[2] + hex[3] + hex[3];
        const rgb = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        if (!rgb) throw `Unable to convert hex string ${hex} to rgb values`;
        return [parseInt(rgb[1], 16) / 255, parseInt(rgb[2], 16) / 255, parseInt(rgb[3], 16) / 255];
    }

    public static numberToRGB(num: number) {
        return [((num >> 16) & 255) / 255, ((num >> 8) & 255) / 255, (num & 255) / 255];
    }

    public static parseColor(color: ColorName | number | number[], g?: number, b?: number) {
        if (typeof color === 'string') {
            if (color[0] === '#') return ColorFunction.hexToRGB(color);

            const colorName = color.toLowerCase();
            if (colorName in ColorFunction._NAMES) {
                return ColorFunction.hexToRGB(ColorFunction._NAMES[colorName]);
            }
        } else if (Array.isArray(color)) {
            return color.map(i => i / 255);
        } else if (!isNaN(color)) {
            if (g !== undefined && b !== undefined) {
                return [color / 255, g / 255, b / 255];
            }
            return ColorFunction.numberToRGB(color);
        }
        throw 'Color format not recognised';
    }
}
