
import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { Int3 } from './int3.js'
import { Cursor } from './cursor.js'
import { makeSpark } from './spark.js'

import { Floor } from './floor.js'
import { Token } from './token.js'
import { Goal } from './goal.js'
import { Spinner } from './spinner.js'
import { Poker } from './poker.js'
const pieceTypes = new Map()
pieceTypes.set( 'floor', Floor )
pieceTypes.set( 'token', Token )
pieceTypes.set( 'goal', Goal )
pieceTypes.set( 'spinner', Spinner )
pieceTypes.set( 'poker', Poker )

export class Game {

    static maxPosition = new Int3( 5, 3, 5 )
    static minPosition = new Int3( -5, 0, -5 )

    constructor () {
        this.board = [ ]
        this.view = null // can be set later to a THREE.Renderer if desired
        this.scene = null // same as previous
        setInterval( () => {
            this.board.forEach( piece => piece.update() )
            this.view.render( this.scene, this.camera )
            if ( this.scene && this.isWon() ) {
                const start = new THREE.Vector3(
                    Math.random() * 2 - 1, 2, Math.random() * 2 - 1 )
                makeSpark( this.scene, start )
            }
        }, 10 )
        this.setEditing( false )
    }

    setEditing ( on=true ) {
        if ( !this.view ) return
        if ( this.cursor && ( this.editing = on ) )
            this.scene.add( this.cursor.repr )
        else
            this.scene.remove( this.cursor.repr )
    }
    isEditing () { return this.editing }

    isWon () {
        const allTokens = this.board.filter( piece => piece instanceof Token )
        return allTokens.length > 0
            && allTokens.every( token => token.isHome() )
    }

    moveCursor ( delta ) {
        const newLoc = this.cursor.pos().plus( delta )
        if ( Game.minPosition.x <= newLoc.x && newLoc.x <= Game.maxPosition.x
          && Game.minPosition.y <= newLoc.y && newLoc.y <= Game.maxPosition.y
          && Game.minPosition.z <= newLoc.z && newLoc.z <= Game.maxPosition.z )
        {
            this.cursor.move( delta )
            this.cursor.update()
            this.orientCamera()
        }
    }

    add ( piece ) {
        if ( this.pieceAt( piece.pos() ) ) return
        this.board.push( piece )
        if ( this.view && this.scene ) {
            piece.draw()
            this.scene.add( piece.repr )
        }
    }
    addFromJSON ( json, atCursor=false ) {
        const pos = atCursor && this.cursor ? this.cursor.pos() :
            new Int3( json.x, json.y, json.z )
        if ( this.pieceAt( pos ) ) return
        const subclass = pieceTypes.get( json.type )
        const piece = new subclass( this )
        piece.setState( json )
        if ( atCursor && this.cursor && this.isEditing() )
            piece.setPos( this.cursor.pos() )
        this.add( piece )
    }
    pieceAt ( pos ) {
        return this.board.filter( piece => piece.pos().equals( pos ) )[0]
    }
    pieceBelow ( pos ) { return this.pieceAt( pos.plus( Int3.D ) ) }
    // If I start walking in a given direction, when will I stop (if at all)?
    tracePathInDirection ( fromPos, dir, maxSteps=20 ) {
        let result = fromPos.copy()
        for ( let i = 0 ; i < maxSteps ; i++ ) {
            const next = result.plus( dir )
            if ( this.pieceAt( next ) ) break
            result = next
        }
        return result
    }
    deletePiece ( piece ) {
        if ( piece.repr ) this.scene.remove( piece.repr )
        this.board = this.board.filter( x => x != piece )
    }
    deletePieceAtCursor () {
        if ( !this.cursor || !this.isEditing() ) return
        const toDelete = this.pieceAt( this.cursor.pos() )
        if ( toDelete ) this.deletePiece( toDelete )
    }

    copy () {
        if ( !this.cursor || !this.isEditing() ) return
        const toCopy = this.pieceAt( this.cursor.pos() )
        if ( toCopy )
            this.clipboard = JSON.parse( JSON.stringify( toCopy.state ) )
    }
    cut () {
        this.copy()
        this.deletePieceAtCursor()
    }
    paste () {
        if ( !this.cursor || !this.isEditing() || !this.clipboard ) return
        this.deletePieceAtCursor()
        this.addFromJSON( this.clipboard, true )
    }

    clear () {
        const representations =
            this.board.map( piece => piece.repr ).filter( x => !!x )
        if ( representations.length > 0 )
            this.scene.remove( ...representations )
        this.board = [ ]
    }

    isAnimating () { return this.board.some( piece => piece.isAnimating() ) }

    state () { return this.board.map( piece => piece.state ) }
    setState ( jsonData ) {
        this.clear()
        jsonData.board.forEach( json => this.addFromJSON( json ) )
        if ( this.view && this.camera ) this.orientCamera()
    }

    makeView () {
        this.view = new THREE.WebGLRenderer( { antialias : true } )
        // shadows
        this.view.shadowMap.enabled = true
        this.view.shadowMap.type = THREE.PCFSoftShadowMap
        // scene
        this.scene = new THREE.Scene()
        // lights
        const light1 = new THREE.DirectionalLight( 0xffffdd, 1 )
        light1.position.set( 3, 5, 1 )
        light1.castShadow = true
        this.scene.add( light1 )
        const light2 = new THREE.DirectionalLight( 0xffaaaa, 0.2 )
        light2.position.set( -3, 2, 1 )
        light2.castShadow = true
        this.scene.add( light2 )
        const light3 = new THREE.DirectionalLight( 0xaaaaff, 0.2 )
        light3.position.set( 0, 2, -3 )
        light3.castShadow = true
        this.scene.add( light3 )
        const ambient = new THREE.AmbientLight( 0x404040 )
        this.scene.add( ambient )
        // camera
        const w = window.innerWidth
        const h = window.innerHeight
        this.view.setSize( w, h )
        this.camera = new THREE.PerspectiveCamera( 75, w / h, 0.1, 1000 )
        this.camera.position.set( 1, 5, 10 )
        this.camera.position.normalize()
        this.camera.position.multiplyScalar( 7 )
        this.orientCamera()
        window.addEventListener( 'resize', () => {
            const w = window.innerWidth
            const h = window.innerHeight
            this.camera.aspect = w / h
            this.camera.updateProjectionMatrix()
            this.view.setSize( w, h )
        } )
        // click-and-drag controls for spinning the view
        const controls = new OrbitControls( this.camera, this.view.domElement )
        controls.minDistance = 1
        controls.maxDistance = 20
        // build cursor
        this.cursor = new Cursor( this )
        this.cursor.draw()
        // return it
        return this.view.domElement
    }

    // Commenting this out because the user can use the mouse wheel to do it
    orientCamera () {
    //     let min = new Int3( -1, -1, -1 )
    //     let max = new Int3(  1,  1,  1 )
    //     this.board.forEach( piece => {
    //         min.minWith( piece.pos() )
    //         max.maxWith( piece.pos() )
    //     } )
    //     if ( this.cursor ) {
    //         min.minWith( this.cursor.pos() )
    //         max.maxWith( this.cursor.pos() )
    //     }
    //     const extent = Math.max( -min.x, max.x, max.z*1.2, max.y*1.5 )
    //     this.camera.position.normalize()
    //     this.camera.position.multiplyScalar( 2 + extent * 1.5 )
    //     this.camera.lookAt( 0, 0, 0 )
    //     this.camera.updateMatrixWorld()
    }

    objectsUnderMouse ( event ) {
        const mouse = new THREE.Vector2(
            ( event.clientX / window.innerWidth ) * 2 - 1,
            -( event.clientY / window.innerHeight ) * 2 + 1
        )
        if ( !this.raycaster ) this.raycaster = new THREE.Raycaster()
        this.raycaster.setFromCamera( mouse, this.camera )
        return this.raycaster.intersectObjects(
            this.board.map( obj => obj.repr ).filter( x => !!x )
        ).map( object => {
            let walk = object?.object
            while ( walk && ( walk instanceof THREE.Object3D )
              && !this.board.some( piece => piece.repr == walk ) )
                walk = walk.parent
            return walk
        } ).filter( item => !!item )
    }

}
