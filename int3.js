
import * as THREE from 'three'

export class Int3 {

    constructor ( ...args ) {
        if ( args.length == 1 && ( args[0] instanceof Int3 ) ) {
            this.x = args[0].x
            this.y = args[0].y
            this.z = args[0].z
        } else if (
            args.length == 3 && args.every(
                arg => typeof( arg ) == 'number' && Number.isInteger( arg ) )
        ) {
            this.deserialize( args )
        } else if ( args.length == 0 ) {
            this.x = this.y = this.z = 0
        } else {
            throw new Error( 'Invalid arguments to Int3 constructor: ' + args )
        }
    }

    static L = new Int3( -1,  0,  0 )
    static R = new Int3(  1,  0,  0 )
    static U = new Int3(  0,  1,  0 )
    static D = new Int3(  0, -1,  0 )
    static F = new Int3(  0,  0, -1 )
    static B = new Int3(  0,  0,  1 )
    static sides = [ Int3.L, Int3.R, Int3.F, Int3.B ]
    static corners = [ Int3.L+Int3.F, Int3.L+Int3.B, Int3.R+Int3.F, Int3.R+Int3.B ]
    static neighbors = [ ...Int3.sides, ...Int3.corners ]
    static box = [-1,0,1].map( x =>
        [-1,0,1].map( y =>
            [-1,0,1].map( z => new Int3(x,y,z) )
        ).flat( 1 )
    ).flat( 1 ).filter( point => point.x != 0 || point.y != 0 || point.z != 0 )

    copy () { return new Int3( this ) }
    equals ( other ) {
        return this.x == other.x && this.y == other.y && this.z == other.z
    }

    add ( other ) {
        this.x += other.x
        this.y += other.y
        this.z += other.z
    }
    plus ( other ) {
        const result = this.copy()
        result.add( other )
        return result
    }

    multiply ( scalar ) {
        if ( typeof( scalar ) != 'number' || !Number.isInteger( scalar ) )
            throw new Error( 'Int3 instance cannot be multiplied by ' + scalar )
        this.x *= scalar
        this.y *= scalar
        this.z *= scalar
    }
    times ( scalar ) {
        const result = this.copy()
        result.multiply( scalar )
        return result
    }

    negate () { this.multiply( -1 ) }
    negated () { return this.times( -1 ) }

    subtract ( other ) { this.add( other.negated() ) }
    minus ( other ) { return this.plus( other.negated() ) }

    length () { return Math.sqrt( this.x*this.x + this.y*this.y + this.z*this.z ) }

    serialize () { return [ this.x, this.y, this.z ] }
    deserialize ( obj ) {
        this.x = obj[0]
        this.y = obj[1]
        this.z = obj[2]
    }

    // the following can be manipulated if we need a non-identity embedding
    inView ( asPoint=true ) {
        // if you make this a non-identity embedding, treat points and vectors
        // differently; points get translated but vectors do not
        return new THREE.Vector3( this.x, this.y, this.z )
    }

    // piecewise minning and maxing for finding bounding boxes
    minWith ( other ) {
        this.x = Math.min( this.x, other.x )
        this.y = Math.min( this.y, other.y )
        this.z = Math.min( this.z, other.z )
    }
    maxWith ( other ) {
        this.x = Math.max( this.x, other.x )
        this.y = Math.max( this.y, other.y )
        this.z = Math.max( this.z, other.z )
    }

    toString () { return `(${this.x},${this.y},${this.z})` }

}
