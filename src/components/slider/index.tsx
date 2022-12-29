import { useEffect, useState } from 'react';
import style from './style.module.css';

export interface ISliderProps {
    label: string;
    value?: number;
    min: number;
    max: number;
    onChange?: (value: number) => void;
}

export default function Slider(props: ISliderProps) {
    const { label, value: propsValue, min: propsMin, max: propsMax, onChange } = props;
    let min: number;
    let max: number;
    if (propsMin > propsMax) {
        min = propsMax;
        max = propsMin;
    } else {
        min = propsMin;
        max = propsMax;
    }
    const [value, setValue] = useState(propsValue ?? min);

    useEffect(() => {
        if (propsValue !== undefined && propsValue !== value) {
            let newValue = propsValue;
            if (propsValue < min) {
                newValue = min;
            } else if (propsValue > max) {
                newValue = max;
            }
            setValue(newValue);
        }
    }, [propsValue]);

    useEffect(() => {
        if (value < min) {
            setValue(min);
        }
    }, [min]);

    useEffect(() => {
        if (value > max) {
            setValue(max);
        }
    }, [max]);

    return (
        <div className={style['slider']}>
            <div className={style['label']}>{label}</div>
            <input
                className={style['input']}
                type='range'
                min={min}
                max={max}
                value={value}
                onChange={e => {
                    const newValue = parseFloat(e.currentTarget.value);
                    setValue(newValue);
                    if (onChange) onChange(newValue);
                }}
            />
            <div className={style['value']}>{value}</div>
        </div>
    );
}
