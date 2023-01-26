# FBX Loader for babylon js

## CDN

[https://metameta-libs.s3.eu-central-1.amazonaws.com/FBXLoader.js](https://metameta-libs.s3.eu-central-1.amazonaws.com/FBXLoader.js)

After the import you can access to FBXLoaderModule global object and use it like this

```bash
BABYLON.SceneLoader.RegisterPlugin(new FBXLoaderModule.FBXLoader());
```

## NPM

To install va npm package manager use:

```bash
npm i babylon-fbx-loader
```

This will allow you to import it using:

```bash
import { FBXLoader } from 'babylon-fbx-loader';

BABYLON.SceneLoader.RegisterPlugin(new FBXLoader());
```

## YARN

Additionally, you can install with yarn:

```bash
yarn add babylon-fbx-loader
```

## Known issues:
* mainly supports geometries, bones
* partially supports materials (only standard material and no video support at the moment)
* no support of morph targets
* no support of cameras and lights