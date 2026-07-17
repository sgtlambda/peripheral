import Matter, {Body, Vector} from 'matter-js';

///
///				code by Isaiah Smith
///		technostalgic.itch.io  |  @technostalgicGM
///
///						repo:
///	https://github.com/Technostalgic/MatterJS_Raycast.git
///


//raycast functionality integrated with matter.js since there
//is no built-in method for raycasting that returns the ray's
//intersection points

//function 'raycast' - returns an array of 'raycol' objects
//param 'bodies' - bodies to check collision with; passed
//	through 'Matter.Query.ray()'
//param 'start' - start point of raycast
//param 'end' - end point of raycast
//param 'sort' - whether or not the ray collisions should be
//	sorted based on distance from the origin

export function raycast(bodies: Body[], start: Vector, end: Vector, sort: boolean = true): raycol[] {
    //convert the start & end parameters to my custom
    //'vec2' object type
    const startVec = vec2.fromOther(start);
    const endVec   = vec2.fromOther(end);

    //The bodies that the raycast will be tested against
    //are queried and stored in the variable 'query'.
    //This uses the built-in raycast method which takes
    //advantage of the broad-phase collision optomizations
    //instead of iterating through each body in the list
    //(`body` is attached to each collision by `Query.ray` at
    //runtime but is missing from the type definitions)
    const query = Matter.Query.ray(bodies, startVec, endVec) as unknown as { body: Body }[];

    //'cols': the array that will contain the ray
    //collision information
    const cols: raycol[] = [];
    //'raytest': the ray object that will be tested for
    //collision against the bodies
    const raytest = new ray(startVec, endVec);

    //Next, since all the bodies that the ray collides with
    //have already been queried, we iterate through each
    //one to see where the ray intersects with the body
    //and gather other information
    for (let i = query.length - 1; i >= 0; i--) {
        const bcols = ray.bodyCollisions(raytest, query[i].body);
        for (let k = bcols.length - 1; k >= 0; k--) {
            cols.push(bcols[k]);
        }
    }

    //if desired, we then sort the collisions based on the
    //distance from the ray's start
    if (sort)
        cols.sort(function (a, b) {
            return a.point.distance(startVec) - b.point.distance(startVec);
        });

    return cols;
}

//data type that contains information about an intersection
//between a ray and a body
class raycol {
    //initailizes a 'raycol' object with the given data
    //param 'body' - stores the body that the ray has
    //	collided with
    //param 'point' - stores the collision point
    //param 'normal' - stores the normal of the edge that
    //	the ray collides with
    //param 'verts' - stores the vertices of the edge that
    //	the ray collides with
    constructor(
        public body: Body,
        public point: vec2,
        public normal: vec2,
        public verts: [Vector, Vector],
    ) {
    }
}

//data type that contains information and methods for a
//ray object
class ray {

    verts?: [Vector, Vector];

    //initializes a ray instance with the given parameters
    //param 'start' - the starting point of the ray
    //param 'end' - the ending point of the ray
    constructor(
        public start: vec2,
        public end: vec2,
    ) {
    }

    yValueAt(x: number): number {
        //returns the y value on the ray at the specified x
        //slope-intercept form:
        //y = m * x + b
        return this.offsetY + this.slope * x;
    }

    xValueAt(y: number): number {
        //returns the x value on the ray at the specified y
        //slope-intercept form:
        //x = (y - b) / m
        return (y - this.offsetY) / this.slope;
    }

    pointInBounds(point: vec2): boolean {
        //checks to see if the specified point is within
        //the ray's bounding box (inclusive)
        const minX = Math.min(this.start.x, this.end.x);
        const maxX = Math.max(this.start.x, this.end.x);
        const minY = Math.min(this.start.y, this.end.y);
        const maxY = Math.max(this.start.y, this.end.y);
        return (
            point.x >= minX &&
            point.x <= maxX &&
            point.y >= minY &&
            point.y <= maxY);
    }

    calculateNormal(ref: vec2): vec2 {
        //calulates the normal based on a specified
        //reference point
        const dif = this.difference;

        //gets the two possible normals as points that lie
        //perpendicular to the ray
        const norm1 = dif.normalized().rotate(Math.PI / 2);
        const norm2 = dif.normalized().rotate(Math.PI / -2);

        //returns the normal that is closer to the provided
        //reference point
        if (this.start.plus(norm1).distance(ref) < this.start.plus(norm2).distance(ref))
            return norm1;
        return norm2;
    }

    get difference(): vec2 {
        //pretty self explanitory
        return this.end.minus(this.start);
    }

    get slope(): number {
        const dif = this.difference;
        return dif.y / dif.x;
    }

    get offsetY(): number {
        //the y-offset at x = 0, in slope-intercept form:
        //b = y - m * x
        //offsetY = start.y - slope * start.x
        return this.start.y - this.slope * this.start.x;
    }

    get isHorizontal(): boolean {
        return compareNum(this.start.y, this.end.y);
    }

    get isVertical(): boolean {
        return compareNum(this.start.x, this.end.x);
    }

    static intersect(rayA: ray, rayB: ray): vec2 | null {
        //returns the intersection point between two rays
        //null if no intersection

        //conditional checks for axis aligned rays
        if (rayA.isVertical && rayB.isVertical) return null;
        if (rayA.isVertical) return new vec2(rayA.start.x, rayB.yValueAt(rayA.start.x));
        if (rayB.isVertical) return new vec2(rayB.start.x, rayA.yValueAt(rayB.start.x));
        if (compareNum(rayA.slope, rayB.slope)) return null;
        if (rayA.isHorizontal) return new vec2(rayB.xValueAt(rayA.start.y), rayA.start.y);
        if (rayB.isHorizontal) return new vec2(rayA.xValueAt(rayB.start.y), rayB.start.y);

        //slope intercept form:
        //y1 = m2 * x + b2; where y1 = m1 * x + b1:
        //m1 * x + b1 = m2 * x + b2:
        //x = (b2 - b1) / (m1 - m2)
        const x = (rayB.offsetY - rayA.offsetY) / (rayA.slope - rayB.slope);
        return new vec2(x, rayA.yValueAt(x));
    }

    static collisionPoint(rayA: ray, rayB: ray): vec2 | null {
        //returns the collision point of two rays
        //null if no collision
        const intersection = ray.intersect(rayA, rayB);
        if (!intersection) return null;
        if (!rayA.pointInBounds(intersection)) return null;
        if (!rayB.pointInBounds(intersection)) return null;
        return intersection;
    }

    static bodyEdges(body: Body): ray[] {
        //returns all of the edges of a body in the
        //form of an array of ray objects
        const r: ray[] = [];
        for (let i = body.parts.length - 1; i >= 0; i--) {
            for (let k = body.parts[i].vertices.length - 1; k >= 0; k--) {
                let k2 = k + 1;
                if (k2 >= body.parts[i].vertices.length)
                    k2 = 0;
                const tray = new ray(
                    vec2.fromOther(body.parts[i].vertices[k]),
                    vec2.fromOther(body.parts[i].vertices[k2]));

                //stores the vertices inside the edge
                //ray for future reference
                tray.verts = [
                    body.parts[i].vertices[k],
                    body.parts[i].vertices[k2]];

                r.push(tray);
            }
        }
        return r;
    }

    static bodyCollisions(rayA: ray, body: Body): raycol[] {
        //returns all the collisions between a specified ray
        //and body in the form of an array of 'raycol' objects
        const r: raycol[] = [];

        //gets the edge rays from the body
        const edges = ray.bodyEdges(body);

        //iterates through each edge and tests for collision
        //with 'rayA'
        for (let i = edges.length - 1; i >= 0; i--) {
            //gets the collision point
            const colpoint = ray.collisionPoint(rayA, edges[i]);

            //if there is no collision, then go to next edge
            if (!colpoint) continue;

            //calculates the edge's normal
            const normal = edges[i].calculateNormal(rayA.start);

            //adds the ray collision to the return array
            r.push(new raycol(body, colpoint, normal, edges[i].verts!));
        }

        return r;
    }
}

//in order to avoid miscalculations due to floating point
//errors
//example:
//	var m = 6; m -= 1; m -= 3; m += 4
//	now 'm' probably equals 6.0000000008361 or something stupid
function compareNum(a: number, b: number, leniency: number = 0.00002): boolean {
    return Math.abs(b - a) <= leniency;
}

//
//included external dependencies:
//
//2d vector data type; contains information and methods for
//2-dimensional vectors
class vec2 {

    x: number;
    y: number;

    //initailizes a 'vec2' object with specified values
    constructor(x: number = 0, y: number = x) {
        this.x = x;
        this.y = y;
    }

    normalized(magnitude: number = 1): vec2 {
        //returns a vector 2 with the same direction as this but
        //with a specified magnitude
        return this.multiply(magnitude / this.distance());
    }

    get inverted(): vec2 {
        //returns the opposite of this vector
        return this.multiply(-1);
    }

    multiply(factor: number): vec2 {
        //returns this multiplied by a specified factor
        return new vec2(this.x * factor, this.y * factor);
    }

    plus(vec: vec2): vec2 {
        //returns the result of this added to another
        //specified 'vec2' object
        return new vec2(this.x + vec.x, this.y + vec.y);
    }

    minus(vec: vec2): vec2 {
        //returns the result of this subtracted by another
        //specified 'vec2' object
        return this.plus(vec.inverted);
    }

    rotate(rot: number): vec2 {
        //rotates the vector by the specified angle
        let ang = this.direction;
        const mag = this.distance();
        ang += rot;
        return vec2.fromAng(ang, mag);
    }

    toPhysVector(): Vector {
        //converts this to a vector compatible with the
        //matter.js physics engine
        return Matter.Vector.create(this.x, this.y);
    }

    get direction(): number {
        //returns the angle this vector is pointing in radians
        return Math.atan2(this.y, this.x);
    }

    distance(vec: vec2 = new vec2()): number {
        //returns the distance between this and a specified
        //'vec2' object
        return Math.sqrt(
            Math.pow(this.x - vec.x, 2) +
            Math.pow(this.y - vec.y, 2));
    }

    clone(): vec2 {
        //returns a new instance of a 'vec2' object with the
        //same value
        return new vec2(this.x, this.y);
    }

    static fromAng(angle: number, magnitude: number = 1): vec2 {
        //returns a vector which points in the specified angle
        //and has the specified magnitude
        return new vec2(
            Math.cos(angle) * magnitude,
            Math.sin(angle) * magnitude);
    }

    static fromOther(vector: Vector): vec2 {
        //converts other data types that contain 'x' and 'y'
        //properties to a 'vec2' object type
        return new vec2(vector.x, vector.y);
    }

    toString(): string {
        return 'vector<' + this.x + ', ' + this.y + '>';
    }
}
