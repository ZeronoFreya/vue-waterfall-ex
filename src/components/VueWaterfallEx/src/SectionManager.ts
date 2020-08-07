import Section from "./Section"

interface cellMetadatumObj{
    _x: number; 
    _y: number; 
    _width: number; 
    _height: number;
}

const SECTION_SIZE = 600

export default class SectionManager {
    private _cellMetadata: {[key:string]: any}[]
    private _sectionSize: number
    private _sections: {[key:string]: Section}
    
    constructor(sectionSize = SECTION_SIZE) {
        this._sectionSize = sectionSize

        this._cellMetadata = []
        this._sections = {}
    }

    registerCell({ cellMetadatum, index }: { 
        cellMetadatum: cellMetadatumObj; 
        index: number}) {
        const frozenCellMetadatum = Object.freeze(cellMetadatum);
        this._cellMetadata[index] = frozenCellMetadatum
        this.getSections(frozenCellMetadatum).forEach(section => section.addCellIndex({ index }))
    }

    freezeCells() {
        Object.freeze(this._cellMetadata)
    }

    /** Get all Sections overlapping the specified region. */
    getSections({ _height, _width, _x, _y }: cellMetadatumObj) {
        const sectionXStart = Math.floor(_x / this._sectionSize)
        const sectionXStop = Math.floor((_x + _width - 1) / this._sectionSize)
        const sectionYStart = Math.floor(_y / this._sectionSize)
        const sectionYStop = Math.floor((_y + _height - 1) / this._sectionSize)

        const sections = []

        for (let sectionX = sectionXStart; sectionX <= sectionXStop; sectionX++) {
            for (let sectionY = sectionYStart; sectionY <= sectionYStop; sectionY++) {
                const key = `${sectionX}.${sectionY}`

                if (!this._sections[key]) {
                    this._sections[key] = new Section({
                        _height: this._sectionSize,
                        _width: this._sectionSize,
                        _x: sectionX * this._sectionSize,
                        _y: sectionY * this._sectionSize
                    })
                }

                sections.push(this._sections[key])
            }
        }

        return sections
    }

    /** Total number of Sections based on the currently registered cells. */
    getTotalSectionCount() {
        return Object.keys(this._sections).length
    }

    /**
     * Gets all cell indices contained in the specified region.
     * A region may encompass 1 or more Sections.
     */
    getCellIndices({ _height, _width, _x, _y }: cellMetadatumObj) {
        const indices:{[key:string]:number} = {}

        this.getSections({ _height, _width, _x, _y }).forEach(section =>
            section.getCellIndices().forEach(index => {
                indices[index] = index
            })
        )

        // Object keys are strings; this function returns numbers
        return Object.keys(indices).map((index: string) => indices[index])
    }

    getCellMetadata(index:number) {
        return this._cellMetadata[index]
    }
}
