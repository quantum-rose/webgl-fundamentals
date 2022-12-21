import { BufferAttribute, BufferGeometry, Group, Mesh, Object3D, Program } from '../core';

interface IGeometry {
    object: string;
    groups: string[];
    material: string;
    data: {
        position: number[];
        texcoord: number[];
        normal: number[];
        color: number[];
    };
}

export class OBJLoader {
    private static _keywordRE = /(\w*)(?: )*(.*)/;

    public program: Program;

    public objPositions: number[][];

    public objTexcoords: number[][];

    public objNormals: number[][];

    public objColors: number[][];

    /**
     * [顶点，纹理坐标，法线，颜色]
     */
    public objVertexData: [number[][], number[][], number[][], number[][]];

    public geometries: IGeometry[];

    public materialLibs: string[];

    /**
     * [顶点，纹理坐标，法线，颜色]
     */
    private _currentVertexData: [number[], number[], number[], number[]];

    private _currentOBJ: string;

    private _currentGroups: string[];

    private _currentMaterial: string;

    private _currentGeometry?: IGeometry;

    constructor(program: Program) {
        this.program = program;

        this.objPositions = [[0, 0, 0]];
        this.objTexcoords = [[0, 0]];
        this.objNormals = [[0, 0, 0]];
        this.objColors = [[0, 0, 0]];
        this.objVertexData = [this.objPositions, this.objTexcoords, this.objNormals, this.objColors];

        this.geometries = [];
        this.materialLibs = [];

        this._currentVertexData = [[], [], [], []];
        this._currentOBJ = 'Default';
        this._currentMaterial = 'Default';
        this._currentGroups = ['Default'];
    }

    public async load(src: string): Promise<Object3D> {
        const response = await fetch(src);
        const text = await response.text();
        this.parseOBJ(text);

        const bufferGeometries: BufferGeometry[] = [];
        this.geometries.forEach(geometry => {
            const { position, texcoord, normal, color } = geometry.data;
            const bufferGeometry = new BufferGeometry();
            if (position.length > 0) {
                bufferGeometry.setAttribute('position', new BufferAttribute(new Float32Array(position), 3));
            }
            if (texcoord.length > 0) {
                bufferGeometry.setAttribute('uv', new BufferAttribute(new Float32Array(texcoord), 2));
            }
            if (normal.length > 0) {
                bufferGeometry.setAttribute('normal', new BufferAttribute(new Float32Array(normal), 3));
            }
            if (color.length > 0) {
                bufferGeometry.setAttribute('color', new BufferAttribute(new Float32Array(color), 3));
            }
            bufferGeometries.push(bufferGeometry);
        });

        const object = new Group();
        bufferGeometries.forEach(geometry => {
            const mesh = new Mesh(geometry, this.program);
            mesh.setParent(object);
        });

        return object;
    }

    public parseOBJ(text: string) {
        const lines = text.split('\n');
        for (let lineNo = 0; lineNo < lines.length; ++lineNo) {
            const line = lines[lineNo].trim();
            if (line === '' || line.startsWith('#')) {
                continue;
            }

            const m = OBJLoader._keywordRE.exec(line);
            if (!m) {
                continue;
            }

            const [, keyword, unparsedArgs] = m;
            const parts = line.split(/\s+/).slice(1);
            switch (keyword) {
                case 'v':
                    this._v(parts);
                    break;
                case 'vt':
                    this._vt(parts);
                    break;
                case 'vn':
                    this._vn(parts);
                    break;
                case 'f':
                    this._f(parts);
                    break;
                case 'o':
                    this._o(parts, unparsedArgs);
                    break;
                case 'g':
                    this._g(parts);
                    break;
                case 'usemtl':
                    this._usemtl(parts, unparsedArgs);
                    break;
                case 'mtllib':
                    this._mtllib(parts, unparsedArgs);
                    break;
                case 's':
                    break;
                default:
                    console.warn('unhandled keyword:', keyword, ' at line', lineNo + 1);
            }
        }
    }

    private _v(parts: string[]) {
        // 如果超过 3 个值，就是顶点颜色
        if (parts.length > 3) {
            this.objPositions.push(parts.slice(0, 3).map(parseFloat));
            this.objColors.push(parts.slice(3).map(parseFloat));
        } else {
            this.objPositions.push(parts.map(parseFloat));
        }
    }

    private _vt(parts: string[]) {
        this.objTexcoords.push(parts.map(parseFloat));
    }

    private _vn(parts: string[]) {
        this.objNormals.push(parts.map(parseFloat));
    }

    private _f(parts: string[]) {
        this._setGeometry();
        const numTriangles = parts.length - 2;
        for (let tri = 0; tri < numTriangles; ++tri) {
            this._addVertex(parts[0]);
            this._addVertex(parts[tri + 1]);
            this._addVertex(parts[tri + 2]);
        }
    }

    private _addVertex(vert: string) {
        const ptn = vert.split('/');
        ptn.forEach((objIndexStr, i) => {
            if (!objIndexStr) {
                return;
            }
            const objIndex = parseInt(objIndexStr);
            const index = objIndex + (objIndex >= 0 ? 0 : this.objVertexData[i].length);
            this._currentVertexData[i].push(...this.objVertexData[i][index]);
            if (i === 0 && this.objColors.length > 1) {
                this._currentVertexData[3].push(...this.objVertexData[3][index]);
            }
        });
    }

    private _o(_parts: string[], unparsedArgs: string) {
        this._currentOBJ = unparsedArgs;
        this._newGeometry();
    }

    private _g(parts: string[]) {
        this._currentGroups = parts;
        this._newGeometry();
    }

    private _usemtl(_parts: string[], unparsedArgs: string) {
        this._currentMaterial = unparsedArgs;
        this._newGeometry();
    }

    private _newGeometry() {
        // 如果有存在的几何体并且不是空的，销毁
        if (this._currentGeometry && this._currentGeometry.data.position.length) {
            this._currentGeometry = undefined;
        }
    }

    private _setGeometry() {
        if (!this._currentGeometry) {
            const position: number[] = [];
            const texcoord: number[] = [];
            const normal: number[] = [];
            const color: number[] = [];
            this._currentVertexData = [position, texcoord, normal, color];
            this._currentGeometry = {
                object: this._currentOBJ,
                groups: this._currentGroups,
                material: this._currentMaterial,
                data: {
                    position,
                    texcoord,
                    normal,
                    color,
                },
            };
            this.geometries.push(this._currentGeometry);
        }
    }

    private _mtllib(_parts: string[], unparsedArgs: string) {
        this.materialLibs.push(unparsedArgs);
    }
}
