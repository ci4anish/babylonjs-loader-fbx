/**
 * Physics material class
 * Helps setting friction and restitution that are used to compute responding forces in collision response
 */
export class PhysicsMaterial {
    /**
     * Constructor of the physics material.
     * @param friction - The friction of the material.
     * @param restitution - The restitution of the material.
     * @param scene - The scene to which the physics engine belongs.
     *
     * This code is useful for initializing the physics material with the
     * given friction, restitution and scene. It also checks if the
     * physics engine and plugin are available and if the plugin version
     * is correct. If all conditions are met, it initializes the material
     * with the physics plugin.
     */
    constructor(friction, restitution, scene) {
        /**
         * V2 Physics plugin private data for a physics material
         */
        this._pluginData = undefined;
        const physicsEngine = scene.getPhysicsEngine();
        if (!physicsEngine) {
            throw new Error("No Physics Engine available.");
        }
        if (physicsEngine.getPluginVersion() != 2) {
            throw new Error("Plugin version is incorrect. Expected version 2.");
        }
        const physicsPlugin = physicsEngine.getPhysicsPlugin();
        if (!physicsPlugin) {
            throw new Error("No Physics Plugin available.");
        }
        this._physicsPlugin = physicsPlugin;
        this._physicsPlugin.initMaterial(this);
    }
    /**
     * Sets the friction of the physics engine.
     * @param friction - The friction to set.
     *
     * This method is useful for setting the friction of the physics engine, which is important for simulating realistic physics.
     * The friction determines how much an object will slow down when it is in contact with another object.
     * This is important for simulating realistic physics, such as when an object slides across a surface.
     */
    setFriction(friction) {
        this._physicsPlugin.setFriction(this, friction);
    }
    /**
     * Gets the friction of the physics engine.
     *
     * @returns The friction of the physics engine.
     *
     * This method is useful for getting the friction of the physics engine, which is used to calculate the force of friction between two objects.
     * Knowing the friction of the engine can help to accurately simulate the physical behavior of objects in the engine.
     */
    getFriction() {
        return this._physicsPlugin.getFriction(this);
    }
    /**
     * Sets the restitution of the physics body.
     * @param restitution A number between 0 and 1 that represents the restitution of the body.
     *
     * This method is useful for setting the restitution of a physics body, which is the amount of energy that is retained after a collision.
     * A restitution of 0 means that no energy is retained, while a restitution of 1 means that all energy is retained.
     * Setting the restitution of a body can help to create realistic physics simulations.
     */
    setRestitution(restitution) {
        this._physicsPlugin.setRestitution(this, restitution);
    }
    /**
     * Gets the restitution of the physics engine.
     * @returns The restitution of the physics engine.
     *
     * This method is useful for retrieving the restitution of the physics engine, which is the amount of energy that is preserved after two objects collide.
     * Knowing the restitution of the physics engine can help to accurately simulate the behavior of objects in the physics engine.
     */
    getRestitution() {
        return this._physicsPlugin.getRestitution(this);
    }
    /**
     * Disposes the material.
     *
     * This method is useful for cleaning up the material when it is no longer needed.
     * It calls the disposeMaterial method of the physics plugin, which is responsible for disposing the material and freeing up any resources associated with it.
     * This ensures that the material is properly disposed of and does not cause any memory leaks.
     */
    dispose() {
        this._physicsPlugin.disposeMaterial(this);
    }
}
//# sourceMappingURL=physicsMaterial.js.map