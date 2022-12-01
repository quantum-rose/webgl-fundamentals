import { useEffect, useRef, useState } from 'react';
import Sortable from 'sortablejs';
import { WebGLUtils } from '../utils/webglutils';
import fragment from './fragment.frag';
import style from './style.module.css';
import vertex from './vertex.vert';

enum Filter {
    Normal = 'normal',
    GaussianBlur = 'gaussian blur',
    GaussianBlur2 = 'gaussian blur 2',
    GaussianBlur3 = 'gaussian blur 3',
    Unsharpen = 'unsharpen',
    Sharpness = 'sharpness',
    Sharpen = 'sharpen',
    EdgeDetect = 'edge detect',
    EdgeDetect2 = 'edge detect 2',
    EdgeDetect3 = 'edge detect 3',
    EdgeDetect4 = 'edge detect 4',
    EdgeDetect5 = 'edge detect 5',
    EdgeDetect6 = 'edge detect 6',
    SobelHorizontal = 'sobel horizontal',
    SobelVertical = 'sobel vertical',
    PrevitHorizontal = 'previt horizontal',
    PrevitVertical = 'previt vertical',
    BoxBlur = 'box blur',
    TriangleBlur = 'triangle blur',
    Emboss = 'emboss',
}

interface IFilter {
    id: Filter;
    kernel: number[];
    kernelWeight: number;
}

interface IFilterOption {
    id: Filter;
    checked?: boolean;
}

const Filters: IFilter[] = [
    generateFilter(Filter.Normal, [0, 0, 0, 0, 1, 0, 0, 0, 0]),
    generateFilter(Filter.GaussianBlur, [0.045, 0.122, 0.045, 0.122, 0.332, 0.122, 0.045, 0.122, 0.045]),
    generateFilter(Filter.GaussianBlur2, [1, 2, 1, 2, 4, 2, 1, 2, 1]),
    generateFilter(Filter.GaussianBlur3, [0, 1, 0, 1, 1, 1, 0, 1, 0]),
    generateFilter(Filter.Unsharpen, [-1, -1, -1, -1, 9, -1, -1, -1, -1]),
    generateFilter(Filter.Sharpness, [0, -1, 0, -1, 5, -1, 0, -1, 0]),
    generateFilter(Filter.Sharpen, [-1, -1, -1, -1, 16, -1, -1, -1, -1]),
    generateFilter(Filter.EdgeDetect, [-0.125, -0.125, -0.125, -0.125, 1, -0.125, -0.125, -0.125, -0.125]),
    generateFilter(Filter.EdgeDetect2, [-1, -1, -1, -1, 8, -1, -1, -1, -1]),
    generateFilter(Filter.EdgeDetect3, [-5, 0, 0, 0, 0, 0, 0, 0, 5]),
    generateFilter(Filter.EdgeDetect4, [-1, -1, -1, 0, 0, 0, 1, 1, 1]),
    generateFilter(Filter.EdgeDetect5, [-1, -1, -1, 2, 2, 2, -1, -1, -1]),
    generateFilter(Filter.EdgeDetect6, [-5, -5, -5, -5, 39, -5, -5, -5, -5]),
    generateFilter(Filter.SobelHorizontal, [1, 2, 1, 0, 0, 0, -1, -2, -1]),
    generateFilter(Filter.SobelVertical, [1, 0, -1, 2, 0, -2, 1, 0, -1]),
    generateFilter(Filter.PrevitHorizontal, [1, 1, 1, 0, 0, 0, -1, -1, -1]),
    generateFilter(Filter.PrevitVertical, [1, 0, -1, 1, 0, -1, 1, 0, -1]),
    generateFilter(Filter.BoxBlur, [0.111, 0.111, 0.111, 0.111, 0.111, 0.111, 0.111, 0.111, 0.111]),
    generateFilter(Filter.TriangleBlur, [0.0625, 0.125, 0.0625, 0.125, 0.25, 0.125, 0.0625, 0.125, 0.0625]),
    generateFilter(Filter.Emboss, [-2, -1, 0, -1, 1, 1, 0, 1, 2]),
];

const NormalFilter = Filters[0];

function generateFilter(id: Filter, kernel: number[]): IFilter {
    const weight = kernel.reduce((a, b) => a + b);
    return {
        id,
        kernel,
        kernelWeight: weight <= 0 ? 1 : weight,
    };
}

function createAndSetupTexture(gl: WebGLRenderingContext) {
    const texture = gl.createTexture();
    if (!texture) {
        throw 'unable to create texture';
    }
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    return texture;
}

function useWebGL() {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const updateRef = useRef<((options?: IFilterOption[]) => void) | null>(null);

    useEffect(() => {
        WebGLUtils.loadImage('./leaves.jpg').then(image => {
            const canvas = canvasRef.current!;

            const gl = canvas.getContext('webgl');
            if (!gl) {
                throw 'failed to get WebGL context';
            }
            const program = WebGLUtils.createProgram(gl, vertex, fragment);

            const positionAttributeLocation = gl.getAttribLocation(program, 'a_position');
            const texCoordAttributeLocation = gl.getAttribLocation(program, 'a_texCoord');
            const resolutionUniformLocation = gl.getUniformLocation(program, 'u_resolution');
            const colorUniformLocation = gl.getUniformLocation(program, 'u_color');
            const imageSizeUniformLocation = gl.getUniformLocation(program, 'u_imageSize');
            const kernelUniformLocation = gl.getUniformLocation(program, 'u_kernel');
            const kernelWeightUniformLocation = gl.getUniformLocation(program, 'u_kernelWeight');
            const flipYUniformLocation = gl.getUniformLocation(program, 'u_flipY');

            WebGLUtils.resizeCanvasToDisplaySize(canvas);
            gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
            gl.clearColor(0, 0, 0, 0);
            gl.clear(gl.COLOR_BUFFER_BIT);
            gl.useProgram(program);

            // a_position
            const positionBuffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
            WebGLUtils.setRectangle(gl, 0, 0, 240, 180);
            gl.enableVertexAttribArray(positionAttributeLocation);
            gl.vertexAttribPointer(positionAttributeLocation, 2, gl.FLOAT, false, 0, 0);

            // a_texCoord
            const texCoordBuffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([0, 0, 1, 0, 0, 1, 0, 1, 1, 0, 1, 1]), gl.STATIC_DRAW);
            gl.enableVertexAttribArray(texCoordAttributeLocation);
            gl.vertexAttribPointer(texCoordAttributeLocation, 2, gl.FLOAT, false, 0, 0);

            // u_resolution
            gl.uniform2f(resolutionUniformLocation, gl.canvas.width, gl.canvas.height);

            // u_color
            gl.uniform4f(colorUniformLocation, 1, 1, 1, 1);

            // u_image
            const originalImageTexture = createAndSetupTexture(gl);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);

            // u_imageSize
            gl.uniform2f(imageSizeUniformLocation, image.width, image.height);

            // 创建两个帧缓冲交替使用，每个帧缓冲绑定一个纹理
            const textures: WebGLTexture[] = [];
            const framebuffers: WebGLFramebuffer[] = [];
            for (let i = 0; i < 2; i++) {
                const texture = createAndSetupTexture(gl);
                textures.push(texture);
                gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, image.width, image.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
                const fbo = gl.createFramebuffer();
                if (!fbo) {
                    throw 'unable to create framebuffer';
                }
                framebuffers.push(fbo);
                gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
                gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
            }

            const setFramebuffer = function (fbo: WebGLFramebuffer | null, width: number, height: number) {
                gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
                gl.uniform2f(resolutionUniformLocation, width, height);
                gl.viewport(0, 0, width, height);
            };

            const drawWithFilter = function (filter: IFilter) {
                gl.uniform1fv(kernelUniformLocation, filter.kernel);
                gl.uniform1f(kernelWeightUniformLocation, filter.kernelWeight);
                gl.drawArrays(gl.TRIANGLES, 0, 6);
            };

            updateRef.current = function (options: IFilterOption[] = []) {
                gl.bindTexture(gl.TEXTURE_2D, originalImageTexture);
                gl.uniform1f(flipYUniformLocation, 1);

                let fboIdx = 0;
                options.forEach(option => {
                    if (!option.checked) return;

                    const filter = Filters.find(item => item.id === option.id);
                    if (!filter) return;

                    setFramebuffer(framebuffers[fboIdx], image.width, image.height);
                    drawWithFilter(filter);

                    gl.bindTexture(gl.TEXTURE_2D, textures[fboIdx]);

                    fboIdx = (fboIdx + 1) % 2;
                });

                gl.uniform1f(flipYUniformLocation, -1);
                setFramebuffer(null, canvas.width, canvas.height);
                drawWithFilter(NormalFilter);
            };

            updateRef.current();
        });
    }, []);

    return [canvasRef, updateRef] as const;
}

export default function ImageProcess() {
    const ulRef = useRef<HTMLUListElement | null>(null);
    const [options, setOptions] = useState<IFilterOption[]>(
        Filters.map(item => ({
            id: item.id,
            checked: false,
        }))
    );
    const [canvasRef, updateRef] = useWebGL();

    useEffect(() => {
        new Sortable(ulRef.current!, {
            animation: 150,
            onEnd: e => {
                const { oldIndex, newIndex } = e;
                if (oldIndex === undefined || newIndex === undefined) {
                    return;
                }
                setOptions(prev => {
                    const next: IFilterOption[] = [];

                    for (let i = 0; i < prev.length; i++) {
                        if ((i < oldIndex && i < newIndex) || (i > oldIndex && i > newIndex)) {
                            next[i] = prev[i];
                        } else if (i === newIndex) {
                            next[i] = prev[oldIndex];
                        } else if (oldIndex < newIndex) {
                            next[i] = prev[i + 1];
                        } else if (oldIndex > newIndex) {
                            next[i] = prev[i - 1];
                        } else {
                            next[i] = prev[i];
                        }
                    }
                    if (updateRef.current) updateRef.current(next);
                    return next;
                });
            },
        });
    });

    const handleClickOption = (id: Filter) => {
        setOptions(prev => {
            const next = prev.map(item => {
                if (item.id === id) {
                    item.checked = !item.checked;
                }
                return item;
            });
            if (updateRef.current) updateRef.current(next);
            return next;
        });
    };

    return (
        <div className={style['image-process']}>
            <canvas ref={canvasRef} />
            <ul ref={ulRef} className={style['filter-options']}>
                {options.map(option => (
                    <li key={option.id} className={style['filter-option']}>
                        <div className={style['drag-point']}></div>
                        <label className={style['option-wrapper']} onClick={e => e.stopPropagation()}>
                            <input
                                className={style['option-checkbox']}
                                type='checkbox'
                                checked={option.checked}
                                onChange={() => handleClickOption(option.id)}
                            />
                            <span className={style['option-label']}>{option.id}</span>
                        </label>
                    </li>
                ))}
            </ul>
        </div>
    );
}
