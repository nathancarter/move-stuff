
import * as THREE from 'three'
import { Piece } from './piece.js'
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

    hasArm ( index ) {
        const mask = 1 << ( 3 - ( index + this.getFinite( 'rotation' ) ) % 4 )
        return !!( this.getFinite( 'arms' ) & mask )
    }
    dir01 () { return this.get( 'directionIndex', 0 ) }
    dirPM1 () { return [-1,1][this.dir01()] }

    draw () {
        super.draw() // makes a container Object3D
        this.build() // puts the token's shape inside that
    }

    build () {
        const material = new THREE.MeshStandardMaterial( { color: 0x555577 } )
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
            arm.rotateY( Math.PI / 2 * i + Math.PI / 4 )
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

    play ( actionName, ..._ ) {
        if ( actionName == 'use' ) return this.start( 250, 'spin' )
    }
    spinPlay ( t ) {
        // show rotation on-screen only
        // do not actually edit internal data until animation completes
        this.repr.rotation.y = Math.PI / 2 * t * this.dirPM1()
        // handle collisions with neighbors
        if ( t > 0.35 && !this.pokedNeighbors ) {
            const pokeOptions = [
                [
                    [ Int3.B, Int3.L ],
                    [ Int3.L, Int3.F ],
                    [ Int3.F, Int3.R ],
                    [ Int3.R, Int3.B ]
                ],
                [
                    [ Int3.R, Int3.F ],
                    [ Int3.B, Int3.R ],
                    [ Int3.L, Int3.B ],
                    [ Int3.F, Int3.L ]
                ]
            ]
            // console.log( 'basic data', this.getFinite( 'arms' ),
            //              JSON.stringify(
            //                  Array(4).fill(0).map((_,i)=>this.hasArm(i)) 
            //              ),
            //              this.getFinite( 'rotation' ),
            //              this.getFinite( 'direction' ) )
            // console.log( 'direction index', this.get( 'directionIndex', 0 ) )
            // console.log( 'direction poke data', JSON.stringify(
            //     pokeOptions[this.get( 'directionIndex', 0 )], null, 4 ) )
            const pokeData = (
                pokeOptions[this.get( 'directionIndex', 0 )]
            ).filter(
                ( _, index ) => this.hasArm( index )
            ).map(
                data => [ this.pos().plus( data[0] ), data[1] ]
            )
            // console.log( 'filtered poke data', JSON.stringify( pokeData, null, 4 ) )
            pokeData.forEach( datum => {
                const cell = datum[0]
                const target = this.game.pieceAt( cell )
                if ( !target ) return
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
        this.cycleFinite( 'rotation', -this.dirPM1() )
        // clear this variable for next spin
        this.pokedNeighbors = false
    }

}
