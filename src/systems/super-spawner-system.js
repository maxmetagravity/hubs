import { addMedia } from "../utils/media-utils";
import { computeObjectAABB } from "../utils/auto-box-collider";
import { ObjectContentOrigins } from "../object-types";

// WARNING: This system mutates interaction system state!
export class SuperSpawnerSystem {
  maybeSpawn(state, grabPath) {
    const userinput = AFRAME.scenes[0].systems.userinput;
    const superSpawner = state.hovered && state.hovered.components["super-spawner"];
    if (
      superSpawner &&
      superSpawner.spawnedMediaScale &&
      !superSpawner.cooldownTimeout &&
      userinput.get(grabPath) &&
      window.APP.hubChannel.can("spawn_and_move_media")
    ) {
      this.performSpawn(state, grabPath, userinput, superSpawner);
    }
  }

  performSpawn = (function() {
    const box = new THREE.Box3();
    return function performSpawn(state, grabPath, userinput, superSpawner) {
      const data = superSpawner.data;

      const spawnedEntity = addMedia(
        data.src,
        data.template,
        ObjectContentOrigins.SPAWNER,
        null,
        data.resolve,
        true,
        false,
        data.mediaOptions
      ).entity;

      const mesh = superSpawner.el.getObject3D("mesh");
      if (!mesh) {
        console.warn("Tried to clone a spawner without a mesh. Will use its position instead of its mesh center.");
        superSpawner.el.object3D.getWorldPosition(spawnedEntity.object3D.position);
      } else {
        computeObjectAABB(mesh, box);
        spawnedEntity.object3D.position.addVectors(box.min, box.max).multiplyScalar(0.5);
      }
      superSpawner.el.object3D.getWorldQuaternion(spawnedEntity.object3D.quaternion);
      spawnedEntity.object3D.matrixNeedsUpdate = true;

      superSpawner.el.emit("spawned-entity-created", { target: spawnedEntity });

      state.held = spawnedEntity;

      superSpawner.activateCooldown();
      state.spawning = true;

      spawnedEntity.addEventListener(
        "media-loaded",
        () => {
          spawnedEntity.object3D.scale.copy(superSpawner.spawnedMediaScale);
          spawnedEntity.object3D.matrixNeedsUpdate = true;
          state.spawning = false;
          superSpawner.el.emit("spawned-entity-loaded", { target: spawnedEntity });
        },
        { once: true }
      );
    };
  })();

  tick() {
    const interaction = AFRAME.scenes[0].systems.interaction;
    if (!interaction.ready) return; //DOMContentReady workaround
    this.maybeSpawn(interaction.state.leftHand, interaction.options.leftHand.grabPath);
    this.maybeSpawn(interaction.state.rightHand, interaction.options.rightHand.grabPath);
    this.maybeSpawn(interaction.state.rightRemote, interaction.options.rightRemote.grabPath);
    this.maybeSpawn(interaction.state.leftRemote, interaction.options.leftRemote.grabPath);
  }
}
