var vec2 = require('../math/vec2');

exports.Body = Body;

/**
 * A physics body.
 *
 * @class Body
 * @constructor
 * @param {Object}          [options]
 * @param {Shape}           options.shape           Used for collision detection. If absent the body will not collide.
 * @param {number}          options.mass            A number >= 0. If zero, the body becomes static. Defaults to static [0].
 * @param {Float32Array}    options.position
 * @param {Float32Array}    options.velocity
 * @param {number}          options.angle
 * @param {number}          options.angularVelocity
 * @param {Float32Array}    options.force
 * @param {number}          options.angularForce
 */
function Body(options){
    options = options || {};

    /**
     * The body identifyer
     * @property id
     * @type {Number}
     */
    this.id = ++Body._idCounter;

    /**
     * The shape belonging to the body.
     * @property shape
     * @type {Shape}
     */
    this.shape = options.shape;

    /**
     * The mass of the body.
     * @property mass
     * @type {number}
     */
    this.mass = options.mass || 0;

    /**
     * The inverse mass of the body.
     * @property invMass
     * @type {number}
     */
    this.invMass = 0;

    /**
     * The inertia of the body around the Z axis.
     * @property inertia
     * @type {number}
     */
    this.inertia = 0;

    /**
     * The inverse inertia of the body.
     * @property invInertia
     * @type {number}
     */
    this.invInertia = 0;

    this.updateMassProperties();

    /**
     * The position of the body
     * @property position
     * @type {Float32Array}
     */
    this.position = vec2.create();
    if(options.position) vec2.copy(this.position, options.position);

    /**
     * The velocity of the body
     * @property velocity
     * @type {Float32Array}
     */
    this.velocity = vec2.create();
    if(options.velocity) vec2.copy(this.velocity, options.velocity);

    this.vlambda = vec2.fromValues(0,0);
    this.wlambda = 0;

    /**
     * The angle of the body
     * @property angle
     * @type {number}
     */
    this.angle = options.angle || 0;

    /**
     * The angular velocity of the body
     * @property angularVelocity
     * @type {number}
     */
    this.angularVelocity = options.angularVelocity || 0;

    /**
     * The force acting on the body
     * @property force
     * @type {Float32Array}
     */
    this.force = vec2.create();
    if(options.force) vec2.copy(this.force, options.force);

    /**
     * The angular force acting on the body
     * @property angularForce
     * @type {number}
     */
    this.angularForce = options.angularForce || 0;

    /**
     * The type of motion this body has. Should be one of: Body.STATIC, Body.DYNAMIC and Body.KINEMATIC.
     * @property motionState
     * @type {number}
     */
    this.motionState = this.mass == 0 ? Body.STATIC : Body.DYNAMIC;
};

Body._idCounter = 0;

Body.prototype.updateMassProperties = function(){
    // Mass should already be given
    var m = this.mass,
        I = this.inertia,
        s = this.shape;

    if(s){
        I = s.computeMomentOfInertia(m);
    } else {
        m = 0;
        I = 0;
    }

    this.mass = m;
    this.inertia = I;

    // Inverse mass properties are easy
    this.invMass = m > 0 ? 1/m : 0;
    this.invInertia = I>0 ? 1/I : 0;
};

/**
 * Apply force to a world point. This could for example be a point on the RigidBody surface. Applying force this way will add to Body.force and Body.angularForce.
 * @method applyForce
 * @param {Float32Array} force The force to add.
 * @param {Float32Array} worldPoint A world point to apply the force on.
 */
var Body_applyForce_r = vec2.create();
Body.prototype.applyForce = function(force,worldPoint){
    // Compute point position relative to the body center
    var r = Body_applyForce_r;
    vec2.sub(r,worldPoint,this.position);

    // Add linear force
    vec2.add(this.force,this.force,force);

    // Compute produced rotational force
    var rotForce = vec2.crossLength(r,force);

    // Add rotational force
    this.angularForce += rotForce;
};

/**
 * Dynamic body.
 * @property DYNAMIC
 * @type {Number}
 * @static
 */
Body.DYNAMIC = 1;

/**
 * Static body.
 * @property STATIC
 * @type {Number}
 * @static
 */
Body.STATIC = 2;

/**
 * Kinematic body.
 * @property KINEMATIC
 * @type {Number}
 * @static
 */
Body.KINEMATIC = 4;
