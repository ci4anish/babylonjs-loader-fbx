# FBX Loader for babylon js

This repo is a browser port of the [Babylonjs Editor FBXLoader](https://github.com/BabylonJS/Editor/tree/master/src/renderer/editor/loaders/fbx)

# Installation

### CDN

[https://metameta-libs.s3.eu-central-1.amazonaws.com/FBXLoader.js](https://metameta-libs.s3.eu-central-1.amazonaws.com/FBXLoader.js)

After the import you can access to FBXLoaderModule global object and use it like this

```bash
BABYLON.SceneLoader.RegisterPlugin(new FBXLoaderModule.FBXLoader());
```

### NPM

To install va npm package manager use:

```bash
npm i babylon-fbx-loader
```

This will allow you to import it using:

```bash
import { FBXLoader } from 'babylon-fbx-loader';

BABYLON.SceneLoader.RegisterPlugin(new FBXLoader());
```

### YARN

Additionally, you can install with yarn:

```bash
yarn add babylon-fbx-loader
```

# Known issues:
* mainly supports geometries, bones
* partially supports materials (only standard material and no video support at the moment)
* issues with animations
* no support of morph targets
* no support of cameras and lights

The loader is in the pretty raw state, but if you need static meshes rather than dynamic it can give pretty decent results:

![Carriage image](https://metameta-libs.s3.eu-central-1.amazonaws.com/carriage.png)
![Formula 1 image](https://metameta-libs.s3.eu-central-1.amazonaws.com/formula-1.png)