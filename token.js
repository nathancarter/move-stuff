
import * as THREE from 'three'
import { Int3 } from './int3.js'
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
        this.main.castShadow = true
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

    allowsMove ( otherPiece, destination ) {
        // Tokens allow other tokens to bounce off of them
        if ( ( otherPiece instanceof Token ) && destination.equals( this.pos() ) )
            return Piece.SomeMovement
        // Otherwise they behave the same as all other objects
        return super.allowsMove( otherPiece, destination )
    }

    // Now a ton of movement-related behavior for tokens specifically
    play ( actionName, ...params ) {
        switch ( actionName ) {
            case 'shake' :
                this.start( params[0], 'shake' )
                this.shakeDirection = params[1].inView( false )
                this.shakeDirection.normalize()
                break
            case 'bounce' :
                this.start( params[0], 'bounce' )
                this.bounceDirection = params[1].inView( false )
                this.bounceDirection.multiplyScalar( 0.5 )
                break
            case 'moveTo' :
                this.start( params[0], 'moveTo' )
                this.moveDestination = params[1]
                break
            case 'fallTo' :
                this.start( params[0], 'fallTo' )
                this.fallDestination = params[1]
                break
        }
    }

    // utilities for handlers below
    savePos () { this.reprPos = this.repr.position.clone() }
    savedPos () { return this.reprPos }
    offsetPos ( offset ) {
        const result = this.reprPos.clone()
        result.add( offset )
        return result
    }
    restorePos () { this.repr.position.copy( this.reprPos ) }

    // Handlers for the play('shake',...) behavior
    shakeStart () { this.savePos() }
    shakePlay ( t ) {
        const adjustedShake = this.shakeDirection.clone()
        adjustedShake.multiplyScalar( 0.25 * Math.sin( 60 * t ) * ( 1 - t ) )
        this.repr.position.copy( this.offsetPos( adjustedShake ) )
    }
    shakeEnd () { this.restorePos() }

    // Handlers for the play('bounce',...) behavior
    bounceStart () { this.savePos() }
    bouncePlay ( t ) {
        const easedT = 2*t*(1-t)+t*t // slows over time
        const twoWay = 1 - Math.abs( 2 * easedT - 1 ) // goes there and back
        const adjustedBounce = this.bounceDirection.clone()
        adjustedBounce.multiplyScalar( twoWay )
        this.repr.position.copy( this.offsetPos( adjustedBounce ) )
    }
    bounceEnd () { this.restorePos() }

    // Handlers for the play('moveTo',...) behavior
    moveToStart () { this.savePos() }
    moveToPlay ( t ) {
        const easedT = 2*t*(1-t)+t*t // slows over time
        const partialMotion = this.moveDestination.inView()
        partialMotion.sub( this.savedPos() )
        partialMotion.multiplyScalar( easedT )
        partialMotion.add( this.savedPos() )
        this.repr.position.copy( partialMotion )
    }
    moveToEnd () {
        const aboveMe = this.game.pieceAt( this.pos().plus( Int3.U ) )
        this.restorePos()
        this.setPos( this.moveDestination )
        this.freefall()
        if ( aboveMe && ( aboveMe instanceof Token ) ) aboveMe.freefall()
    }

    // Fall from where I am to a reasonable landing zone, or off the board
    freefall () {
        const fallTo = this.game.tracePathInDirection( this.pos(), Int3.D )
        if ( fallTo.equals( this.pos ) ) return
        const accel = 20
        const duration = 1000 * Math.sqrt(
            fallTo.minus( this.pos() ).length() / accel )
        this.play( 'fallTo', duration, fallTo )
    }

    // Handlers for the play('fallTo',...) behavior
    fallToStart () { this.savePos() }
    fallToPlay ( t ) {
        const easedT = t*t // speeds up over time
        const partialMotion = this.fallDestination.inView()
        partialMotion.sub( this.savedPos() )
        partialMotion.multiplyScalar( easedT )
        partialMotion.add( this.savedPos() )
        this.repr.position.copy( partialMotion )
    }
    fallToEnd () {
        if ( this.game.pieceBelow( this.fallDestination ) ) {
            // we fell onto something so stop there
            this.restorePos()
            this.setPos( this.fallDestination )
        } else {
            // we fell into oblivion; delete this piece
            this.game.deletePiece( this )
        }
    }

}
