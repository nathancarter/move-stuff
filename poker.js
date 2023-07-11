
import * as THREE from 'three'
import { Piece } from './piece.js'
import { Token } from './token.js'
import { Int3 } from './int3.js'

export class Poker extends Piece {

    constructor ( game ) {
        super( game )
        this.finiteProperties.set( 'rotation', [ 0, 1, 2, 3 ] )
    }

    draw () {
        super.draw() // makes a container Object3D
        this.build() // puts the token's shape inside that
    }

    build () {
        const material = new THREE.MeshStandardMaterial( { color: 0x8888aa } )
        this.main = new THREE.Mesh(
            new THREE.CylinderGeometry( 0.15, 0.15, 0.5, 24 ), material )
        this.main.translateY( -0.25 )
        this.main.castShadow = true
        this.repr.add( this.main )
        this.cone = new THREE.Mesh(
            new THREE.ConeGeometry( 0.3, 1.0, 24 ), material )
        this.cone.rotateZ( Math.PI / 2 )
        Piece.applyTransformations( this.cone )
        this.cone.translateY( 0.3 )
        Piece.applyTransformations( this.cone )
        this.cone.rotateY( Math.PI / 2 * this.getFinite( 'rotation' ) )
        this.cone.castShadow = true
        this.main.add( this.cone )
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
        if ( this.main && key == 'rotationIndex' )
            this.rebuild()
    }

    allowsMove ( otherPiece, destination ) {
        // From the side, pokers allow tokens to bounce off of them
        if ( otherPiece.get( 'y' ) == this.get( 'y' )
          && ( otherPiece instanceof Token )
          && destination.equals( this.pos() ) )
            return Piece.SomeMovement
        // Otherwise they behave the same as all other objects
        return super.allowsMove( otherPiece, destination )
    }

    pokeDir () {
        return [ Int3.L, Int3.B, Int3.R, Int3.F ][this.getFinite( 'rotation' )]
    }
    coneMotion ( t ) {
        const motion = this.pokeDir().inView( false )
        motion.multiplyScalar( t * 0.4 )
        const result = this.origConePos.clone()
        result.add( motion )
        return result
    }

    play ( actionName, ..._ ) {
        if ( actionName == 'use' ) return this.start( 100, 'poke' )
    }
    pokeStart () {
        this.origConePos = this.cone.position.clone()
    }
    pokePlay ( t ) {
        this.cone.position.copy( this.coneMotion( t ) )
    }
    pokeEnd () {
        this.start( 100, 'unpoke' )
        const targetDir = this.pokeDir()
        const targetPos = this.pos().plus( targetDir )
        const target = this.game.pieceAt( targetPos )
        if ( !target ) return
        const dest = this.game.tracePathInDirection( targetPos, targetDir, 12 )
        target.tryMove( dest, 100 * dest.minus( targetPos ).length() )
    }
    unpokePlay( t ) {
        this.cone.position.copy( this.coneMotion( 1 - t ) )
    }
    unpokeEnd () {
        this.cone.position.copy( this.origConePos )
    }

}
