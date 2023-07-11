
import * as THREE from 'three'
import { Piece } from './piece.js'

export class Cursor extends Piece {

    draw () {
        super.draw()
        const extent = 0.5
        const thickness = 0.025
        const material = new THREE.MeshBasicMaterial( { color: 0xffffff } )
        for ( let i = -extent ; i <= extent ; i += 2*extent ) {
            for ( let j = -extent ; j <= extent ; j += 2*extent ) {
                let stick = new THREE.Mesh(
                    new THREE.BoxGeometry( thickness, thickness, 2*extent+thickness ),
                    material
                )
                stick.position.add( new THREE.Vector3( i, j, 0 ) )
                this.repr.add( stick )
                stick = new THREE.Mesh(
                    new THREE.BoxGeometry( thickness, 2*extent+thickness, thickness ),
                    material
                )
                stick.position.add( new THREE.Vector3( i, 0, j )  )
                this.repr.add( stick )
                stick = new THREE.Mesh(
                    new THREE.BoxGeometry( 2*extent+thickness, thickness, thickness ),
                    material
                )
                stick.position.add( new THREE.Vector3( 0, i, j ) )
                this.repr.add( stick )
            }
        }
    }

}
