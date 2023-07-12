
import * as THREE from 'three'
import { Piece } from './piece.js'

const makeBox = ( x1, y1, z1, x2, y2, z2, material ) => {
    const result = new THREE.Mesh(
        new THREE.BoxGeometry(
            Math.abs( x2-x1 ), Math.abs( y2-y1 ), Math.abs( z2-z1 ) ),
        material )
    result.position.set( (x1+x2)/2, (y1+y2)/2, (z1+z2)/2 )
    result.receiveShadow = true
    Piece.applyTransformations( result )
    return result
}

export class Floor extends Piece {

    constructor ( game ) {
        super( game )
        this.finiteProperties.set( 'color', [ 0x888888, 0xaaaaaa, 0xcccccc ] )
        this.finiteProperties.set( 'style',
            [ 'box', 'table', 'grid', 'cake' ] )
    }

    draw () {
        super.draw()
        this.build()
    }

    build () {
        const extent = 0.495
        const material = new THREE.MeshStandardMaterial( {
            color: this.getFinite( 'color' )
        } )
        switch ( this.getFinite( 'style' ) ) {
            case 'box':
                this.main = new THREE.Mesh(
                    new THREE.BoxGeometry( 2*extent, 2*extent, 2*extent ),
                    material
                )
                this.main.receiveShadow = true
                break
            case 'table':
                this.main = makeBox(
                    -extent, 0.35, -extent, extent, extent, extent, material )
                for ( let i = -extent ; i <= extent ; i += 2*extent ) {
                    this.main.add( makeBox(
                        i, -0.05, -extent, 0.9*i, 0.05, extent, material ) )
                    this.main.add( makeBox(
                        -extent, -0.05, i, extent, 0.05, 0.9*i, material ) )
                    for ( let j = -extent ; j <= extent ; j += 2*extent )
                        this.main.add( makeBox( i, -extent, j,
                            0.75*i, 0.9*extent, 0.75*j, material ) )
                }
                break
            case 'grid':
                const numBars = 5
                const thickness = 0.02
                const start = -extent+thickness/2
                const end = -start
                const dist = end - start
                const bars = new THREE.Object3D()
                for ( let i = 0 ; i < numBars ; i++ ) {
                    const pct = i / ( numBars - 1 )
                    bars.add( makeBox(
                        start+pct*dist-thickness/2, -thickness/2, -extent,
                        start+pct*dist+thickness/2, thickness/2, extent,
                        material ) )
                }
                const grid = new THREE.Object3D()
                grid.add( bars.clone() )
                let tmp = bars.clone()
                tmp.rotation.y = Math.PI / 2
                grid.add( tmp )
                grid.position.y += end
                Piece.applyTransformations( grid )
                this.main = new THREE.Object3D()
                this.main.add( grid.clone() )
                this.main.add( tmp = grid.clone() )
                tmp.rotation.x = Math.PI / 2
                this.main.add( tmp = grid.clone() )
                tmp.rotation.x = -Math.PI / 2
                this.main.add( tmp = grid.clone() )
                tmp.rotation.z = Math.PI / 2
                this.main.add( tmp = grid.clone() )
                tmp.rotation.z = -Math.PI / 2
                this.main.add( grid )
                break
            case 'cake':
                this.main = new THREE.Mesh(
                    new THREE.BoxGeometry( 0.25, 2*extent, 0.25 ),
                    material
                )
                this.main.receiveShadow = true
                const numLayers = 4
                const layerSize = 1 / ( 2 * numLayers - 1 )
                for ( let i = 0 ; i < numLayers ; i++ ) {
                    const layer = new THREE.Mesh(
                        new THREE.BoxGeometry( 2*extent, layerSize, 2*extent ),
                        material
                    )
                    layer.receiveShadow = true
                    layer.position.y += -0.5 + layerSize / 2 + 2 * i * layerSize
                    this.main.add( layer )
                }
                break
        }
        this.repr.add( this.main )
    }
    destroy () {
        this.repr.remove( this.main )
    }
    rebuild () {
        this.destroy()
        this.build()
    }

    valueChanged ( key, value ) {
        super.valueChanged( key, value )
        if ( this.main && [ 'colorIndex', 'styleIndex' ].includes( key ) )
            this.rebuild()
    }

}
