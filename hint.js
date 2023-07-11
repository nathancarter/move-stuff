
import * as THREE from 'three'
import { Piece } from './piece.js'

const bounceUntilRemoved = object => {
    const startTime = new Date
    const interval = setInterval( () => {
        if ( object.parent ) {
            const elapsed = new Date - startTime
            object.position.y = Math.sin( elapsed / 150 ) * 0.15
        } else {
            clearInterval( interval )
        }
    }, 10 )
}

export class Hint extends Piece {

    constructor ( game ) {
        super( game )
        this.finiteProperties.set( 'index', [ 1, 2, 3, 4, 5 ] )
    }

    text () {
        return this.game.isEditing() ? `↓${this.getFinite( 'index' )}↓` : '↓'
    }

    draw () {
        super.draw()
        this.build()
    }

    // not a physical object, so must not block any motion anywhere:
    allowsMove () { return Piece.FullMovement }

    build () {
        const canvas = document.createElement( 'canvas' )
        canvas.width = canvas.height = 100
        const context = canvas.getContext( '2d' )
        context.font = '40px Arial'
        context.fillStyle = 'white'
        context.textAlign = 'center'
        context.textBaseline = 'middle'
        context.fillText( this.text(), 50, 50 )
        const texture = new THREE.CanvasTexture( canvas, THREE.UVMapping )
        const material = new THREE.SpriteMaterial( { map : texture } )
        this.main = new THREE.Sprite( material )
        this.main.scale.set( 1, 1, 1 )
        this.repr.add( this.main )
        bounceUntilRemoved( this.main )
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
        if ( this.main && key == 'indexIndex' ) this.rebuild()
    }

}
