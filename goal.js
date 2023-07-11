
import * as THREE from 'three'
import { Int3 } from './int3.js'
import { Piece } from './piece.js'
import { Token } from './token.js'

export class Goal extends Piece {

    constructor ( game ) {
        super( game )
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
        const extent = 0.49
        this.main = new THREE.Mesh(
            new THREE.CylinderGeometry( extent, extent, 2*extent, 24 ),
            material
        )
        this.repr.add( this.main )
        let geometry = this.getFinite( 'shape' )
        const size = 0.5 * (
            geometry == 'octahedron' ? 0.75 :
            geometry == 'cube' ? 0.5 : 0.6
        )
        const decorator = new THREE.Mesh(
            geometry == 'cube' ? new THREE.BoxGeometry( size, size, size ) :
            geometry == 'sphere' ? new THREE.SphereGeometry( size/2, 12, 8 ) :
            geometry == 'cylinder' ? new THREE.CylinderGeometry( size/2, size/2, size, 16 ) :
            geometry == 'octahedron' ? new THREE.OctahedronGeometry( size/2 ) : null,
            material
        )
        const offset = 0.5 - 0.65 * size
        for ( let i = -offset ; i <= offset ; i += 2*offset ) {
            for ( let j = -offset ; j <= offset ; j += 2*offset ) {
                const temp = decorator.clone()
                temp.position.set( i, 0.5, j )
                this.main.add( temp )
            }
        }
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
        if ( this.main && ( key == 'colorIndex' || key == 'shapeIndex' ) )
            this.rebuild()
    }

    isHomeFor ( piece ) {
        return ( piece instanceof Token )
            && piece.getFinite( 'color' ) == this.getFinite( 'color' )
            && piece.getFinite( 'shape' ) == this.getFinite( 'shape' )
    }
    update () {
        super.update()
        if ( !this.repr || this.game.isEditing() || this.game.isAnimating() )
            return
        const pieceAbove = this.game.pieceAt( this.pos().plus( Int3.U ) )
        if ( pieceAbove && this.isHomeFor( pieceAbove ) ) {
            if ( this.repr.scale.y == 1 ) this.start( 500, 'showHome' )
        } else {
            if ( this.repr.scale.y > 1 ) this.start( 500, 'unshowHome' )
        }
    }
    showHomePlay ( t ) { this.repr.scale.y = 1 + 0.5 * t }
    showHomeEnd () { this.repr.scale.y = 1.5 }
    unshowHomePlay ( t ) { this.repr.scale.y = 1.5 - 0.5 * t }
    unshowHomeEnd ( t ) { this.repr.scale.y = 1 }

}
