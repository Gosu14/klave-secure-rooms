# KlaveSecureRooms

<a alt="Nx logo" href="https://nx.dev" target="_blank" rel="noreferrer"><img src="https://raw.githubusercontent.com/nrwl/nx/master/images/nx-logo.png" width="45"></a>



## Description

The secure data room app leverages on Klave's confidential computing to allow you to encrypt files and collaborate with selected users.

This contract implements an API that provides the following functions:

- Set a super admin for the secure data room
- Super admin creates a single data room
- Super admin approves participants upon request to become admin or viewers of the data room
- Super admin approves the storage server upon request to become an admin of the data room
- Creation of signature / verification pair of keys for both klave and storage server
- Ability to store file definition in klave to provide a secure access only to participants of the data room

## Build your back-end locally

Fork the repo https://github.com/secretarium/klave-secure-rooms and clone it on your machine.
You can build your template into wasm locally, allowing you to validate the hash of the application deployed on Klave.

> Note: You should have node and yarn installed to be able to build locally.

```bash
yarn install
yarn build
```

## Deploy your own back-end

You can deploy the back-end of the secure data room to Klave with one click:
[![Deploy on Klave](https://klave.com/images/deploy-on-klave.svg)](https://app.klave.com/template/github/secretarium/klave-secure-rooms)

Retrieve the address of your honest application after deployment on klave website as you will target it within the UI and the storage server.

## Build UI and run it locally

Change the .env file in apps/ui with the following
  VITE_APP_SECRETARIUM_GATEWAYS="SDR#Secure data room#wss://klave-prod.secretarium.org"
  VITE_APP_KLAVE_CONTRACT="address of your deployed klave contract"
  
Run `npx nx build ui` to build the application. The build artifacts are stored in the output directory (e.g. `dist/` or `build/`), ready to be deployed.
Run `npx nx build ui` to deploy the UI locally.

## Build Storage server and run it locally

Change the .env file in apps/uploader with the following
  VITE_APP_SECRETARIUM_GATEWAYS="SDR#Secure data room#wss://klave-prod.secretarium.org"
  VITE_APP_KLAVE_CONTRACT="address of your deployed klave contract"
  
Run `npx nx build uploader` to build the application. The build artifacts are stored in the output directory (e.g. `dist/` or `build/`), ready to be deployed.
Run `npx nx server uploader` to run the storage server locally.


Targets can be defined in the `package.json` or `projects.json`. Learn more [in the docs](https://nx.dev/features/run-tasks).


## Authors

This library is created by [Klave](https://klave.com) and [Secretarium](https://secretarium.com) team members, with contributions from:

- Jeremie Labbe ([@jlabbeklavo](https://github.com/jlabbeKlavo)) - [Klave](https://klave.com) | [Secretarium](https://secretarium.com)
- Florian Guitton ([@fguitton](https://github.com/fguitton)) - [Klave](https://klave.com) | [Secretarium](https://secretarium.com)
- Damian Tziamtzis ([@damtzi](https://github.com/damtzi)) - [Klave](https://klave.com) | [Secretarium](https://secretarium.com)
- Etienne Bosse ([@Gosu14](https://github.com/Gosu14)) - [Klave](https://klave.com) | [Secretarium](https://secretarium.com)
