import { AssetContainer } from '@babylonjs/core/assetContainer';
import { Scene } from '@babylonjs/core/scene';
import * as BrowserBuffer from 'buffer/';
import { FBXData, FBXReader, FBXReaderNode, parseText } from 'fbx-parser';

import { FBXAnimations } from './animation/animations';
import './augmentations/binary-reader';
import { parseBinary } from './augmentations/parse-binary';
import { FBXConnections, IFBXConnections } from './connections';
import { INumberDictionary } from './interfaces';
import { FBXMaterial } from './material/material';
import { FBXGeometry, IFBXGeometryResult } from './mesh/geometry';
import { FBXMesh } from './mesh/mesh';
import { FBXSkeleton, IFBXSkeleton } from './mesh/skeleton';
import { FBXTransform } from './node/transform';
import { Bone } from '@babylonjs/core/Bones/bone';
import { TransformNode } from '@babylonjs/core/Meshes/transformNode';
import { Material } from '@babylonjs/core/Materials/material';
import {
    ISceneLoaderAsyncResult,
    ISceneLoaderPluginAsync,
    ISceneLoaderPluginExtensions,
    ISceneLoaderProgressEvent,
} from '@babylonjs/core/Loading/sceneLoader';
import { Nullable } from '@babylonjs/core/types';

const root = typeof self !== 'undefined' ? self : typeof global !== 'undefined' ? global : this;
// @ts-ignore
root.Buffer = BrowserBuffer.Buffer;

export interface IFBXLoaderRuntime {
    scene: Scene;
    rootUrl: string;
    result: AssetContainer;

    objects: FBXReaderNode;

    models: FBXReaderNode[];
    deformers: FBXReaderNode[];
    geometries: FBXReaderNode[];

    connections: Map<number, IFBXConnections>;

    cachedModels: INumberDictionary<TransformNode | Bone>;
    cachedGeometries: INumberDictionary<IFBXGeometryResult>;
    cachedSkeletons: INumberDictionary<IFBXSkeleton>;
    cachedMaterials: INumberDictionary<Material>;
}

export class FBXLoader implements ISceneLoaderPluginAsync {
    /**
     * The friendly name of this plugin.
     */
    public name = 'Babylon.JS Editor FBX Loader';

    /**
     * The file extensions supported by this plugin.
     */
    public extensions: ISceneLoaderPluginExtensions = {
        '.fbx': {
            isBinary: true,
        },
    };

    public constructor() {
        // Empty for now...
    }

    /**
     * Import meshes into a scene.
     * @param meshesNames An array of mesh names, a single mesh name, or empty string for all meshes that filter what meshes are imported
     * @param scene The scene to import into
     * @param data The data to import
     * @param rootUrl The root url for scene and resources
     * @param onProgress The callback when the load progresses
     * @param fileName Defines the name of the file to load
     * @returns The loaded objects (e.g. meshes, particle systems, skeletons, animation groups, etc.)
     */
    public async importMeshAsync(
        meshesNames: any,
        scene: Scene,
        data: any,
        rootUrl: string,
        onProgress?: (event: ISceneLoaderProgressEvent) => void,
        fileName?: string,
    ): Promise<ISceneLoaderAsyncResult> {
        // Compute meshes names to import
        if (meshesNames) {
            meshesNames = Array.isArray(meshesNames) ? meshesNames : [meshesNames];
        }

        meshesNames ??= [];

        const container = await this.loadAssetContainerAsync(scene, data, rootUrl, onProgress, fileName);
        container.addAllToScene();

        return {
            lights: container.lights,
            meshes: container.meshes,
            skeletons: container.skeletons,
            geometries: container.geometries,
            transformNodes: container.transformNodes,
            animationGroups: container.animationGroups,
            particleSystems: container.particleSystems,
        };
    }

    /**
     * Load into a scene.
     * @param scene The scene to load into.
     * @param data The data to import.
     * @param rootUrl The root url for scene and resources.
     * @param onProgress The callback when the load progresses.
     * @param fileName Defines the name of the file to load.
     */
    public async loadAsync(
        scene: Scene,
        data: any,
        rootUrl: string,
        onProgress?: (event: ISceneLoaderProgressEvent) => void,
        fileName?: string,
    ): Promise<void> {
        const container = await this.loadAssetContainerAsync(scene, data, rootUrl, onProgress, fileName);
        container.addAllToScene();
    }

    /**
     * Load into an asset container.
     * @param scene The scene to load into
     * @param data The data to import
     * @param rootUrl The root url for scene and resources
     * @param onProgress The callback when the load progresses
     * @param fileName Defines the name of the file to load
     * @returns The loaded asset container
     */
    public async loadAssetContainerAsync(
        scene: Scene,
        data: any,
        rootUrl: string,
        _?: (event: ISceneLoaderProgressEvent) => void,
        fileName?: string,
    ): Promise<AssetContainer> {
        const result = new AssetContainer(scene);
        scene._blockEntityCollection = true;
        // Parse FBX
        let fbx: FBXData;
        try {
            // try binary file encoding
            const binary = Buffer.from(data);
            fbx = parseBinary(binary);
        } catch (e) {
            try {
                // try text file encoding
                fbx = parseText(Buffer.from(data).toString('utf-8'));
            } catch (e) {
                throw new Error(`Can't parse FBX file. format is unknown or unsupported.`);
            }
        }

        const reader = new FBXReader(fbx);

        // Check version first
        const version = reader.node('FBXHeaderExtension')?.node('FBXVersion')?.prop(0, 'number') ?? 0;
        if (version < 7000) {
            throw new Error(
                `Can't parse FBX: version (${version}) not supported. FBX Loader supports versions >= 7000.`,
            );
        }

        // Build data
        const objects = reader.node('Objects');
        if (!objects) {
            return result;
        }

        const connections = FBXConnections.ParseConnections(reader.node('Connections')!);

        const models = objects.nodes('Model');
        if (!models) {
            return result;
        }

        const deformers = objects.nodes('Deformer');
        const geometries = objects.nodes('Geometry').filter((g) => g.prop(2, 'string') === 'Mesh');

        // Runtime
        const runtime: IFBXLoaderRuntime = {
            scene,
            result,
            rootUrl,

            models,
            objects,
            deformers,
            geometries,

            cachedModels: {},
            cachedSkeletons: {},
            cachedMaterials: {},
            cachedGeometries: {},

            connections: FBXConnections.ParseConnections(reader.node('Connections')!),
        };

        // Parse materials
        FBXMaterial.ParseMaterials(runtime);

        // Parse raw skeletons
        FBXSkeleton.ParseRawSkeletons(runtime);

        // Parse geometries
        FBXGeometry.ParseGeometries(runtime);

        // Build models
        for (const m of models) {
            const id = m.prop(0, 'number')!;
            const type = m.prop(2, 'string');
            const name = m.prop(1, 'string')!;
            const relationships = connections.get(id);

            if (!relationships) {
                continue;
            }

            FBXSkeleton.CheckSkeleton(runtime, m, name, relationships);

            let model: Nullable<TransformNode | Bone> = null;
            switch (type) {
                case 'Mesh':
                    model = FBXMesh.CreateMesh(runtime, m, relationships);
                    break;

                case 'Light':
                case 'Camera':
                case 'NurbsCurve':
                    break;

                case 'Root':
                case 'LimbNode':
                    // model = scene.getBoneByName(`Deformer::-${name}`);
                    break;

                case 'Null':
                default:
                    model = new TransformNode(name, scene, true);
                    result.transformNodes.push(model as TransformNode);
                    break;
            }

            if (model) {
                runtime.cachedModels[id] = model;
                FBXTransform.ParseTransform(model, m);
            }
        }

        // Parenting
        for (const modelKey in runtime.cachedModels) {
            const modelId = parseInt(modelKey);
            const model = runtime.cachedModels[modelKey];

            const parentConnections = connections.get(modelId)?.parents;
            parentConnections?.forEach((p) => {
                const parent = runtime.cachedModels[p.id];
                if (parent) {
                    model.parent = parent;
                }
            });

            model.computeWorldMatrix(true);
        }

        // Apply transform
        for (const m in runtime.cachedModels) {
            const model = runtime.cachedModels[m];
            FBXTransform.ApplyTransform(model);
        }

        // Bind skeletons
        FBXSkeleton.BindSkeletons(runtime);

        // Parse animation groups
        FBXAnimations.ParseAnimationGroups(runtime);

        scene._blockEntityCollection = false;
        return result;
    }
}
