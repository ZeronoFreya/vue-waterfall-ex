/**
 * A section of the Window.
 * Window Sections are used to group nearby cells.
 * This enables us to more quickly determine which cells to display in a given region of the Window.
 * Sections have a fixed size and contain 0 to many cells (tracked by their indices).
 */
interface cellMetadatumObj {
    _x: number;
    _y: number;
    _width: number;
    _height: number;
}

export default class Section {
    private height: number
    private width: number
    private x: number
    private y: number
    private _indexMap: {[key:string]: boolean}
    private _indices: number[]
    
    constructor({ _height, _width, _x, _y }: cellMetadatumObj) {
        this.height = _height
        this.width = _width
        this.x = _x
        this.y = _y

        this._indexMap = {}
        this._indices = []
    }

    /** Add a cell to this section. */
    addCellIndex({ index }:{index:number}) {
        if (!this._indexMap[index]) {
            this._indexMap[index] = true
            this._indices.push(index)
        }
    }

    /** Get all cell indices that have been added to this section. */
    getCellIndices() {
        return this._indices
    }

    /** Intended for debugger/test purposes only */
    toString() {
        return `${this.x},${this.y} ${this.width}x${this.height}`
    }
}
