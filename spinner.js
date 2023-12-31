
import * as THREE from 'three'
import { Piece } from './piece.js'
import { Token } from './token.js'
import { Int3 } from './int3.js'

export class Spinner extends Piece {

    constructor ( game ) {
        super( game )
        this.finiteProperties.set( 'arms',
            [ 0b1000, 0b1100, 0b1010, 0b1110, 0b1111 ] )
        this.finiteProperties.set( 'rotation', [ 0, 1, 2, 3 ] )
        this.finiteProperties.set( 'direction',
            [ 'clockwise', 'counterclockwise' ] )
    }

    // arm 0 = Far right
    // arm 1 = Near right         3 0
    // arm 2 = Near left          2 1
    // arm 3 = Far left
    hasArm ( index ) {
        const armCode = this.getFinite( 'arms' )
        const armArray = Array(4).fill(0).map( (_,i) => 0+!!((1<<i)&armCode) )
        let rotation = this.getFinite( 'rotation' )
        if ( this.getFinite( 'direction' ) == 'counterclockwise' )
            rotation = 4 - rotation
        const rotatedArmArray = Array(4).fill(0).map(
            (_,i) => armArray[(i+4-rotation)%4] )
        return rotatedArmArray[index]
    }
    dir01 () { return this.get( 'directionIndex', 0 ) }
    dirPM1 () { return [-1,1][this.dir01()] }

    draw () {
        super.draw() // makes a container Object3D
        this.build() // puts the token's shape inside that
    }

    build () {
        const material = new THREE.MeshStandardMaterial( { color: 0xaaaacc } )
        this.main = new THREE.Mesh(
            new THREE.CylinderGeometry( 0.25, 0.25, 0.8, 24 ), material )
        this.main.translateY( -0.1 )
        this.main.castShadow = true
        this.repr.add( this.main )
        for ( let i = 0 ; i < 4 ; i++ ) {
            if ( !this.hasArm( i ) ) continue
            const arm = new THREE.Mesh(
                new THREE.CylinderGeometry( 0.07, 0.07, 0.8, 8 ), material )
            const cone = new THREE.Mesh( new THREE.ConeGeometry( 0.075, 0.3, 6 ), material )
            // 0 = clockwise, 1 = counterclockwise:
            cone.rotateZ( Math.PI / 2 + Math.PI * this.dir01() )
            Piece.applyTransformations( cone )
            cone.translateX( 0.15 * this.dirPM1() )
            cone.castShadow = true
            arm.add( cone )
            arm.translateY( 0.5 )
            Piece.applyTransformations( arm )
            arm.rotateX( Math.PI / 2 )
            Piece.applyTransformations( arm )
            arm.rotateY( 3 * Math.PI / 4 - Math.PI / 2 * i )
            arm.castShadow = true
            this.main.add( arm )
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
        if ( this.main
          && [ 'armsIndex', 'rotationIndex', 'directionIndex' ].includes( key ) )
            this.rebuild()
    }

    allowsMove ( otherPiece, destination ) {
        // From the side, spinners allow tokens to bounce off of them
        if ( otherPiece.get( 'y' ) == this.get( 'y' )
          && ( otherPiece instanceof Token )
          && destination.equals( this.pos() ) )
            return Piece.SomeMovement
        // Otherwise they behave the same as all other objects
        return super.allowsMove( otherPiece, destination )
    }

    play ( actionName, ..._ ) {
        if ( actionName == 'use' ) return this.start( 250, 'spin' )
    }
    spinPlay ( t ) {
        // show rotation on-screen only
        // do not actually edit internal data until animation completes
        this.repr.rotation.y = Math.PI / 2 * t * this.dirPM1()
        // handle collisions with neighbors
        if ( t > 0.35 && !this.pokedNeighbors ) {
            // Declare general data about how spinners affect their neighbors:
            const pokeOptions = [
                [
                    [ Int3.R, Int3.B ],
                    [ Int3.B, Int3.L ],
                    [ Int3.L, Int3.F ],
                    [ Int3.F, Int3.R ]
                ],
                [
                    [ Int3.F, Int3.L ],
                    [ Int3.R, Int3.F ],
                    [ Int3.B, Int3.R ],
                    [ Int3.L, Int3.B ]
                ]
            ]
            // Compute which part of that data is relevant for this spinner:
            const pokeData = (
                pokeOptions[this.get( 'directionIndex', 0 )]
            ).filter(
                ( _, index ) => this.hasArm( index )
            ).map(
                data => [ this.pos().plus( data[0] ), data[1] ]
            )
            // Figure out if any neighboring tokens prevent the spin:
            const tokensToMove = [ ]
            pokeData.forEach( datum => {
                const target = this.game.pieceAt( datum[0] )
                if ( !target || !( target instanceof Token ) ) return
                const dest = datum[0].plus( datum[1] )
                tokensToMove.push( {
                    target, dest, howFar : target.canMove( dest )
                } )
            } )
            const blockers =
                tokensToMove.filter( token => token.howFar == Piece.NoMovement )
            // If they do, set the blockers to shaking and stop this spin:
            if ( blockers.length > 0 ) {
                blockers.forEach( token => token.target.tryMove( token.dest ) )
                this.cancelAnimation( 'spin' )
                this.start( 80, 'unspin' )
                return
            }
            // They don't, so let it happen:
            pokeData.forEach( datum => {
                const cell = datum[0]
                const target = this.game.pieceAt( cell )
                if ( !target || !( target instanceof Token ) ) return
                // console.log( 'actually poking a ' + target.get( 'type' ) )
                const dir = datum[1]
                target.tryMove( target.pos().plus( dir ), 250 )
            } )
            this.pokedNeighbors = true
        }
    }
    spinEnd () {
        // stop rotation on-screen because animation is complete
        // therefore also record the result in our internal data permanently
        this.repr.rotation.y = 0
        this.cycleFinite( 'rotation', 1 )
        // clear this variable for next spin
        this.pokedNeighbors = false
    }
    unspinPlay ( t ) {
        this.repr.rotation.y = Math.PI / 2 * 0.35 * ( 1 - t ) * this.dirPM1()
    }
    unspinEnd () {
        this.repr.rotation.y = 0
    }

}
