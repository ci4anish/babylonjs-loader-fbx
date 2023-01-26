# FBX Loader for babylon js

## CDN

[https://metameta-libs.s3.eu-central-1.amazonaws.com/FBXLoader.js](https://metameta-libs.s3.eu-central-1.amazonaws.com/FBXLoader.js)

After the import you can access to FBXLoaderModule global object and use it like this

```bash
BABYLON.SceneLoader.RegisterPlugin(new FBXLoaderModule.FBXLoader());
```

## NPM

babylon-fbx-loader is published on npm with full typing support. To install, use:

```bash
npm i babylon-fbx-loader
```

This will allow you to import it using:

```bash
import { FBXLoader } from 'babylonjs';

BABYLON.SceneLoader.RegisterPlugin(new FBXLoader());
```