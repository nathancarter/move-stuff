
import * as THREE from 'three'
import { Piece } from './piece.js'

export class Floor extends Piece {

    constructor ( game ) {
        super( game )
        this.finiteProperties.set( 'color', [ 0x888888, 0xaaaaaa, 0xcccccc ] )
    }

    draw () {
        super.draw()
        const extent = 0.495
        const material = new THREE.MeshStandardMaterial( {
            color: this.getFinite( 'color' )
        } )
        this.box = new THREE.Mesh(
            new THREE.BoxGeometry( 2*extent, 2*extent, 2*extent ),
            material
        )
        this.repr.add( this.box )
    }

    valueChanged ( key, value ) {
        super.valueChanged( key, value )
        if ( this.box && key == 'colorIndex' )
            this.box.material.color =
                new THREE.Color( this.getFinite( 'color' ) )
    }

}
