
import * as THREE from 'three'
import { Piece } from './piece.js'

export class Token extends Piece {

    constructor ( game ) {
        super( game )
        this.finiteProperties.set( 'size', [ 0.3, 0.5, 0.7 ] )
        this.finiteProperties.set( 'color',
            [ 0x3C5B66, 0xFEF2B8, 0xD7A151, 0x923330, 0x4D1211 ] )
        this.finiteProperties.set( 'shape',
            [ 'cube', 'sphere', 'cylinder', 'octahedron' ] )
    }

    draw () {
        super.draw() // makes a container Object3D
        this.build() // puts the token's shape inside that
    }

    build () {
        const material = new THREE.MeshStandardMaterial( {
            color: this.getFinite( 'color' )
        } )
        const size = this.getFinite( 'size' )
        const geometry = this.getFinite( 'shape' )
        this.repr.add( this.main = new THREE.Mesh(
            geometry == 'cube' ? new THREE.BoxGeometry( size, size, size ) :
            geometry == 'sphere' ? new THREE.SphereGeometry( size/2, 12, 8 ) :
            geometry == 'cylinder' ? new THREE.CylinderGeometry( size/2, size/2, size, 16 ) :
            geometry == 'octahedron' ? new THREE.OctahedronGeometry( size/2 ) : null,
            material
        ) )
        this.repr.castShadow = true
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
        if ( this.main ) {
            // color is easy to change
            if ( key == 'colorIndex' )
                this.main.material.color =
                    new THREE.Color( this.getFinite( 'color' ) )
            // if other core properties change, just rebuild from scratch
            if ( key == 'sizeIndex' || key == 'shapeIndex' )
                this.rebuild()
        }
    }

}
