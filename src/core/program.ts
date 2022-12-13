import { AttributeName, FrontFaceMode, UniformName, Uniforms } from '../interfaces';
import { WebGLUtils } from '../utils/webglutils';
import { BufferAttribute } from './bufferattribute';

export type AttributeSetter = (attribute: BufferAttribute) => void;

export type UniformSetter = (v: any) => void;

export class Program {
    private static _currentId = 0;

    public id: number;

    public gl: WebGLRenderingContext;

    public program: WebGLProgram;

    public uniforms: Uniforms;

    public attributeSetters: Map<AttributeName, AttributeSetter>;

    public uniformSetters: Map<UniformName, UniformSetter>;

    constructor(gl: WebGLRenderingContext, vertex: string, fragment: string, uniforms: Uniforms = {}) {
        this.id = Program._currentId++;
        this.gl = gl;
        this.program = WebGLUtils.createProgram(gl, vertex, fragment);
        this.uniforms = uniforms;
        this.attributeSetters = new Map();
        this.uniformSetters = new Map();
        this._createAttributeSetters();
        this._createUniformSetters();
    }

    public frontFace(mode: FrontFaceMode) {
        this.gl.frontFace(this.gl[mode]);
    }

    public setUniforms() {
        const { uniforms, uniformSetters } = this;
        uniformSetters.forEach((setter, name) => {
            if (uniforms.hasOwnProperty(name)) {
                setter(uniforms[name]);
            }
        });
    }

    private _createAttributeSetters() {
        const { gl, program } = this;

        const numAttribs = gl.getProgramParameter(program, gl.ACTIVE_ATTRIBUTES);
        for (let i = 0; i < numAttribs; i++) {
            const attribInfo = gl.getActiveAttrib(program, i);
            if (!attribInfo) {
                break;
            }
            const index = gl.getAttribLocation(program, attribInfo.name);
            this.attributeSetters.set(attribInfo.name, this._createAttributeSetter(index));
        }
    }

    private _createAttributeSetter(index: number): AttributeSetter {
        return (attribute: BufferAttribute) => {
            const { gl } = this;
            const { array, size, type, normalized, stride, offset, needsUpdate } = attribute;

            let { buffer } = attribute;
            if (!buffer) {
                buffer = gl.createBuffer();
                attribute.buffer = buffer;
                gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
                gl.bufferData(gl.ARRAY_BUFFER, array, gl.STATIC_DRAW);
            } else if (needsUpdate) {
                gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
                gl.bufferData(gl.ARRAY_BUFFER, array, gl.STATIC_DRAW);
                attribute.needsUpdate = false;
            }

            gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
            gl.enableVertexAttribArray(index);
            gl.vertexAttribPointer(index, size, gl[type], normalized, stride, offset);
        };
    }

    private _createUniformSetters() {
        const { gl, program } = this;

        const numUniforms = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);

        for (let i = 0; i < numUniforms; i++) {
            const uniformInfo = gl.getActiveUniform(program, i);
            if (!uniformInfo) {
                break;
            }
            let { name } = uniformInfo;
            // remove the array suffix.
            if (name.substring(name.length - 3) === '[0]') {
                name = name.substring(0, name.length - 3);
            }
            this.uniformSetters.set(name, this._createUniformSetter(uniformInfo));
        }
    }

    private _textureUnit = 0;

    private _createUniformSetter(uniformInfo: WebGLActiveInfo): UniformSetter {
        const { gl, program } = this;
        const location = gl.getUniformLocation(program, uniformInfo.name);
        const type = uniformInfo.type;
        // Check if this uniform is an array
        const isArray = uniformInfo.size > 1 && uniformInfo.name.substring(uniformInfo.name.length - 3) === '[0]';

        if (type === gl.FLOAT && isArray) {
            return function (v: Iterable<number>) {
                gl.uniform1fv(location, v);
            };
        }

        if (type === gl.FLOAT) {
            return function (v: number) {
                gl.uniform1f(location, v);
            };
        }

        if (type === gl.FLOAT_VEC2) {
            return function (v: Iterable<number>) {
                gl.uniform2fv(location, v);
            };
        }

        if (type === gl.FLOAT_VEC3) {
            return function (v: Iterable<number>) {
                gl.uniform3fv(location, v);
            };
        }

        if (type === gl.FLOAT_VEC4) {
            return function (v: Iterable<number>) {
                gl.uniform4fv(location, v);
            };
        }

        if (type === gl.INT && isArray) {
            return function (v: Iterable<number>) {
                gl.uniform1iv(location, v);
            };
        }

        if (type === gl.INT) {
            return function (v: number) {
                gl.uniform1i(location, v);
            };
        }

        if (type === gl.INT_VEC2) {
            return function (v: Iterable<number>) {
                gl.uniform2iv(location, v);
            };
        }

        if (type === gl.INT_VEC3) {
            return function (v: Iterable<number>) {
                gl.uniform3iv(location, v);
            };
        }

        if (type === gl.INT_VEC4) {
            return function (v: Iterable<number>) {
                gl.uniform4iv(location, v);
            };
        }

        if (type === gl.BOOL) {
            return function (v: Iterable<number>) {
                gl.uniform1iv(location, v);
            };
        }

        if (type === gl.BOOL_VEC2) {
            return function (v: Iterable<number>) {
                gl.uniform2iv(location, v);
            };
        }

        if (type === gl.BOOL_VEC3) {
            return function (v: Iterable<number>) {
                gl.uniform3iv(location, v);
            };
        }

        if (type === gl.BOOL_VEC4) {
            return function (v: Iterable<number>) {
                gl.uniform4iv(location, v);
            };
        }

        if (type === gl.FLOAT_MAT2) {
            return function (v: Iterable<number>) {
                gl.uniformMatrix2fv(location, false, v);
            };
        }

        if (type === gl.FLOAT_MAT3) {
            return function (v: Iterable<number>) {
                gl.uniformMatrix3fv(location, false, v);
            };
        }

        if (type === gl.FLOAT_MAT4) {
            return function (v: Iterable<number>) {
                gl.uniformMatrix4fv(location, false, v);
            };
        }

        if ((type === gl.SAMPLER_2D || type === gl.SAMPLER_CUBE) && isArray) {
            const units: number[] = [];
            for (let i = 0; i < uniformInfo.size; i++) {
                units.push(this._textureUnit++);
            }
            const bindPoint = this._getBindPointForSamplerType(type)!;
            return function (textures: WebGLTexture[]) {
                gl.uniform1iv(location, units);
                textures.forEach(function (texture, index) {
                    gl.activeTexture(gl.TEXTURE0 + units[index]);
                    gl.bindTexture(bindPoint, texture);
                });
            };
        }

        if (type === gl.SAMPLER_2D || type === gl.SAMPLER_CUBE) {
            const bindPoint = this._getBindPointForSamplerType(type)!;
            const unit = this._textureUnit++;
            return function (texture: WebGLTexture) {
                gl.uniform1i(location, unit);
                gl.activeTexture(gl.TEXTURE0 + unit);
                gl.bindTexture(bindPoint, texture);
            };
        }

        throw 'unknown type: 0x' + type.toString(16); // we should never get here.
    }

    private _getBindPointForSamplerType(type: number) {
        const { gl } = this;
        if (type === gl.SAMPLER_2D) return gl.TEXTURE_2D;
        if (type === gl.SAMPLER_CUBE) return gl.TEXTURE_CUBE_MAP;
        return undefined;
    }
}
