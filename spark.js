
import * as THREE from 'three'

export const makeSpark = (
    scene,
    startingPos = new THREE.Vector3( 0, 2, 0 ),
    minY = -20
) => {

    const spark = new THREE.Mesh(
        new THREE.OctahedronGeometry( 0.1, 0 ),
        new THREE.MeshBasicMaterial()
    )
    spark.material.color.setRGB( Math.random(), Math.random(), Math.random() )
    const p0 = startingPos
    const angleFromY = Math.random() * Math.PI / 2 * 0.75
    const angleInXZ = Math.random() * Math.PI * 2
    const magnitude = Math.random() * 5
    const v0 = new THREE.Vector3(
        Math.cos( angleInXZ ) * Math.sin( angleFromY ) * magnitude + p0.x,
        Math.cos( angleFromY ) * magnitude,
        Math.sin( angleInXZ ) * Math.sin( angleFromY ) * magnitude + p0.z
    )
    const a0 = new THREE.Vector3( 0, -5, 0 )
    const t0 = new Date
    const rot = new THREE.Vector3(
        Math.random() / 10,
        Math.random() / 10,
        Math.random() / 10
    )
    const interval = setInterval( () => {
        const t = ( new Date - t0 ) / 1000
        spark.position.set(
            p0.x + t * v0.x + 0.5 * t * t * a0.x,
            p0.y + t * v0.y + 0.5 * t * t * a0.y,
            p0.z + t * v0.z + 0.5 * t * t * a0.z
        )
        spark.rotation.x += rot.x
        spark.rotation.y += rot.y
        spark.rotation.z += rot.z
        if ( spark.position.y < minY ) {
            spark.removeFromParent()
            clearInterval( interval )
        }
    }, 10 )
    scene.add( spark )

}
