
import { Int3 } from './int3.js'
import { Game } from './game.js'
import * as THREE from 'three'

export class Piece {

    constructor ( game ) {
        if ( !( game instanceof Game ) )
            throw new Error( 'Cannot construct piece outside of a game' )
        this.game = game
        this.state = { x : 0, y : 0, z : 0 }
        this.repr = null // can be set to a THREE.Object3D by calling draw()
        this.finiteProperties = new Map()
    }

    // Private method.  Other pieces should interact with this object not by
    // calling this method, but by calling do() or play().
    set ( key, value ) {
        this.state[key] = value
        this.valueChanged( key, value )
    }
    get ( key, defaultValue ) {
        return this.state.hasOwnProperty( key ) ? this.state[key] : defaultValue
    }
    del ( key ) { delete this.state[key] }
    setState( obj ) {
        this.state = { x : this.state.x, y : this.state.y, z : this.state.z }
        this.valueChanged( 'x', this.state.x )
        this.valueChanged( 'y', this.state.y )
        this.valueChanged( 'z', this.state.z )
        Object.keys( obj ).forEach( key => this.set( key, obj[key] ) )
    }

    cycleFinite ( key, delta ) {
        if ( typeof( key ) == 'number' )
            key = [ ...this.finiteProperties.keys() ][key]
        if ( this.finiteProperties.has( key ) ) {
            const modulus = this.finiteProperties.get( key ).length
            this.set( `${key}Index`,
                ( this.get( `${key}Index`, 0 ) + modulus + delta ) % modulus )
        }
    }
    getFinite ( key ) {
        return this.finiteProperties.get( key )[this.get( `${key}Index`, 0 )]
    }

    pos () { return new Int3( this.state.x, this.state.y, this.state.z ) }
    setPos ( int3 ) {
        this.set( 'x', int3.x )
        this.set( 'y', int3.y )
        this.set( 'z', int3.z )
    }
    move ( delta ) { this.setPos( this.pos().plus( delta ) ) }

    draw () {
        if ( !this.game.view ) return // refuse to make this if it's useless
        this.repr = new THREE.Object3D() // invisible default; override this!
        this.updateReprPosition()
    }

    start ( duration=1000, name='default' ) {
        const now = new Date()
        this.set( `timer-start-${name}`, now )
        this.set( `timer-duration-${name}`, duration )
        if ( this[`${name}Start`] ) this[`${name}Start`]()
    }
    isAnimating () {
        return Object.keys( this.state ).some(
            key => key.startsWith( 'timer-start-' ) )
    }
    elapsed ( name='default' ) {
        const start = this.get( `timer-start-${name}` )
        const duration = this.get( `timer-duration-${name}` )
        const now = new Date()
        const result = now - start
        if ( result >= duration ) {
            this.del( `timer-start-${name}` )
            this.del( `timer-duration-${name}` )
        }
        return Math.max( 0, Math.min( result, duration ) )
    }
    remaining ( name='default' ) {
        const duration = this.get( `timer-duration-${name}` ) // use 2 steps...
        return duration - this.elapsed( name ) // ...bc this may erase durationm
    }
    t ( name='default' ) {
        const duration = this.get( `timer-duration-${name}` ) // same as above
        return this.elapsed( name ) / duration
    }
    invt ( name='default' ) { return 1 - t( name ) }
    cancelAnimation ( name='default' ) {
        this.del( `timer-start-${name}` )
        this.del( `timer-duration-${name}` )
    }

    // subclasses may override this, or may just create the functions they need
    // to make this do what they want; see naming convention below
    update () {
        Object.keys( this.state ).filter(
            key => key.startsWith( 'timer-start-' )
        ).map(
            key => key.substring( 12 )
        ).forEach( timerName => {
            const t = this.t( timerName )
            if ( t < 1 && this[`${timerName}Play`] )
                this[`${timerName}Play`]( t )
            else if ( t == 1 && this[`${timerName}End`] )
                this[`${timerName}End`]()
        } )
    }
    valueChanged ( key, _ ) {
        if ( [ 'x', 'y', 'z' ].includes( key ) ) this.updateReprPosition()
    }
    updateReprPosition () {
        if ( this.repr )
            this.repr.position.set(
                this.get( 'x' ), this.get( 'y' ), this.get( 'z' ) )
    }

    do ( actionName, ...params ) { } // virtual -- subclasses may override
    play ( actionName, ...params ) { // same, but with some default behaviors
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
    // The rule for how these behave and interact:
    //  1. Together they form the public API for each subclass of Piece.
    //  2. Each should be viewed as doing an action you can think of as the
    //     function call action(...params), execpt with the action given by its
    //     name instead of as a function.  do() and play() handle actions by
    //     cases on the actionName.
    //  3. do() should act instantly and should not manipulate this.repr.
    //     It is for the case in which the game is being played off-screen, and
    //     doesn't need to bother with animating anything.  It may impact other
    //     pieces, but should do so by calling their do() functions.
    //  4. play() should start animations with start() so that the player can
    //     watch the action transpire in real time.  In the end, the sequence of
    //     calls to play() in other pieces made over the course of the animation
    //     should directly correspond to the set of calls that would be made to
    //     do() if we had chosen to do the action immediately instead.  The only
    //     difference is in how slowly the changes take effect.
    //  5. Note that when play() calls start(), that may result in functions of
    //     the form actionNameStart() being called, and then later functions of
    //     the form actionNamePlay() being called many times, and then finally
    //     functions of the form actionNameEnd() being called.  Each of those
    //     should actually alter this.repr so the player can see the change take
    //     place.  Neither the start nor the end functions should make a call to
    //     this.set(), but the end functions may do so.

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
        this.restorePos()
        this.setPos( this.moveDestination )
        this.freefall() // in case I moved to a space w/no floor below it
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

    // If a piece tries to move and cannot even go a short distance, we may
    // animate it as shaking in place.  The status indictor for such a state is:
    static NoMovement = 0
    // If a piece tries to move and can go a short distance, but then bounces
    // back to its original location, the appropriate status indictor is:
    static SomeMovement = 1
    // If a piece tries to move and can succeed in completing the move, then the
    // appropriate status indicator is:
    static FullMovement = 2

    // Does this piece allow the other piece to move to the desired location?
    // By default, it allows any move except to its own destination.
    // Return values should be NoMovement, SomeMovement, or FullMovement, above.
    allowsMove ( otherPiece, destination ) {
        return otherPiece == this               ? Piece.FullMovement :
               destination.equals( this.pos() ) ? Piece.NoMovement :
                                                  Piece.FullMovement
    }

    // Can this piece move to the desired location?
    // Ask all other pieces in the game and return the minimum of their answers.
    canMove ( destination ) {
        return Math.min( ...this.game.board.map( piece =>
            piece == this ? Piece.FullMovement
                            : piece.allowsMove( this, destination ) ) )
    }

    // Try to move this piece to the desired location.
    tryMove ( destination, duration=1000 ) {
        switch ( this.canMove( destination ) ) {
            case Piece.NoMovement :
                this.play( 'shake', 350, destination.minus( this.pos() ) )
                break
            case Piece.SomeMovement :
                this.play( 'bounce', 350, destination.minus( this.pos() ) )
                break
            case Piece.FullMovement :
                this.play( 'moveTo', duration, destination )
                break
        }
    }

    // Is this piece the home location on top of which the other piece belongs?
    // By default, no, but subclasses that count as "homes" can override this.
    isHomeFor ( piece ) { return false }
    // Is this piece home?
    isHome () {
        const whatIsUnderThis = this.game.pieceBelow( this.pos() )
        return whatIsUnderThis && whatIsUnderThis.isHomeFor( this )
    }

    static applyTransformations ( object3d ) {
        object3d.updateMatrix()
        object3d.geometry?.applyMatrix4( object3d.matrix )
        object3d.children.forEach( child => child.applyMatrix4( object3d.matrix ) )
        object3d.position.set( 0, 0, 0 )
        object3d.rotation.set( 0, 0, 0 )
        object3d.scale.set( 1, 1, 1 )
        object3d.updateMatrix()
    }

}
