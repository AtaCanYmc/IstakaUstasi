# Changelog

## [1.3.0](https://github.com/AtaCanYmc/IstakaUstasi/compare/istaka-ustasi-frontend-v1.2.0...istaka-ustasi-frontend-v1.3.0) (2026-07-21)


### Features

* add backend waking toast and implement backend readiness check in app ([13959a5](https://github.com/AtaCanYmc/IstakaUstasi/commit/13959a5c51902a4aaef306379e4c9cdb1d7bc2c0))
* add localization support for Roboflow guide and steps in translations ([874bf2d](https://github.com/AtaCanYmc/IstakaUstasi/commit/874bf2df51e063b270f9bb101883757c031b9fea))
* add robots.txt, humans.txt, and llm.txt to public frontend resources ([2bb6ed4](https://github.com/AtaCanYmc/IstakaUstasi/commit/2bb6ed4b292482d1b93bf895d67f7fb7aa1e2797))
* enhance strategy selector with additional algorithms and localization support ([3838c2e](https://github.com/AtaCanYmc/IstakaUstasi/commit/3838c2eec4f6f9fd4490aac7666601b4972018ed))
* implement backend dynamic localization for error messages based on Accept-Language header ([8a11727](https://github.com/AtaCanYmc/IstakaUstasi/commit/8a11727db579b67be4ea32f93a3eec9823da8751))
* implement global authentication failure handling and automatic logout ([af91b30](https://github.com/AtaCanYmc/IstakaUstasi/commit/af91b30a53060c0e36687098371b2b1077c47607))
* update favicon.svg and add site.webmanifest for PWA support ([c3104fd](https://github.com/AtaCanYmc/IstakaUstasi/commit/c3104fd11935a24ecda3b56573c4bd286f886d66))
* update README with enhanced project overview, features, and architecture details ([1601176](https://github.com/AtaCanYmc/IstakaUstasi/commit/1601176a5b17760141e376ad2d41ffd9780e645a))
* user profile settings section to allow updating username ([ddd5a1f](https://github.com/AtaCanYmc/IstakaUstasi/commit/ddd5a1f68202bd9f101473edfd845147565e9f35))
* user-defined custom Roboflow API keys for unlimited vision scanning ([2d97422](https://github.com/AtaCanYmc/IstakaUstasi/commit/2d9742250851ceb3035e290cac1c9936a29db807))


### Bug Fixes

* change page title in index.html to Istaka Ustası ([f2c1722](https://github.com/AtaCanYmc/IstakaUstasi/commit/f2c1722caceacab66b26d89e3dfb85fe4411301d))
* change PWA manifest filename to site.webmanifest ([bffe2ef](https://github.com/AtaCanYmc/IstakaUstasi/commit/bffe2effd54b5158bcd8425db36adb9a741e8a7e))
* pass allow_one_after and strategy to vision solve endpoint and background tasks ([fc25e62](https://github.com/AtaCanYmc/IstakaUstasi/commit/fc25e62b65cbedd59acc5bc902607b8057ce4194))

## [1.2.0](https://github.com/AtaCanYmc/IstakaUstasi/compare/istaka-ustasi-frontend-v1.1.0...istaka-ustasi-frontend-v1.2.0) (2026-07-19)


### Features

* add allowOneAfter checkbox to configure circular 12-13-1 runs ([1798d9a](https://github.com/AtaCanYmc/IstakaUstasi/commit/1798d9a302c76b154284984ea07b056ecd72298a))
* display total melds score directly underneath the board rack ([37706ed](https://github.com/AtaCanYmc/IstakaUstasi/commit/37706ed5a799086f83db72c8c86cf7cb25265a1b))


### Bug Fixes

* add selectedFile state to manage file uploads in VisionUpload component ([c0a3f7a](https://github.com/AtaCanYmc/IstakaUstasi/commit/c0a3f7a019dd64f1b197a2ed8c54f85ece5bb6cf))
* update npm install command to use legacy-peer-deps option ([02a14f9](https://github.com/AtaCanYmc/IstakaUstasi/commit/02a14f9389ac99cd4c21f0a618ab683b15354ae4))

## [1.1.0](https://github.com/AtaCanYmc/IstakaUstasi/compare/istaka-ustasi-frontend-v1.0.0...istaka-ustasi-frontend-v1.1.0) (2026-07-18)


### Features

* Add Docker configuration with Dockerfile, nginx setup, and Docker Compose for frontend and backend services ([c87ee65](https://github.com/AtaCanYmc/IstakaUstasi/commit/c87ee65e3207e8675c25655a9aca501680f3a0ec))
* Add functionality to generate a random hand of tiles and update translations ([c8d4f9a](https://github.com/AtaCanYmc/IstakaUstasi/commit/c8d4f9ad0c00f3c30b792969e6849b51061fc9f3))
* Add initial project structure with core components and configuration files ([f8b80c0](https://github.com/AtaCanYmc/IstakaUstasi/commit/f8b80c08759b30a0e39b9204f419d5d1bbe3bee2))
* Enhance authentication and image validation with token verification and file signature checks ([11c75d0](https://github.com/AtaCanYmc/IstakaUstasi/commit/11c75d07f0041ebd78880fcf791e3566515e70eb))
* Enhance mobile optimization with safe-area classes and improve user profile caching ([69e43c0](https://github.com/AtaCanYmc/IstakaUstasi/commit/69e43c02c76b2cd2d6fe5b2776848847b8877998))
* Implement job processing for image extraction and solving with background tasks ([efe40ee](https://github.com/AtaCanYmc/IstakaUstasi/commit/efe40ee2099506dcef08e68648186ca612c6805d))
* Implement theme and localization support with language toggle and translations ([6135c99](https://github.com/AtaCanYmc/IstakaUstasi/commit/6135c99dca8e5e297eb576f55a403a1f16adcee9))
* Revise README to enhance project overview, structure, and setup instructions ([07d1f66](https://github.com/AtaCanYmc/IstakaUstasi/commit/07d1f6683226b4b8718322f8947749be5640dcf0))
* Update error messages for solving tiles with localization support ([566e357](https://github.com/AtaCanYmc/IstakaUstasi/commit/566e3573264a9ca6a27d1ff49cec9735252d4264))


### Bug Fixes

* make language selector dropdown tap-controlled for mobile screens ([b693de2](https://github.com/AtaCanYmc/IstakaUstasi/commit/b693de281d7a37e2022da5996e8b7f08eba63ec3))

## 1.0.0 (2026-07-18)


### Features

* Add Docker configuration with Dockerfile, nginx setup, and Docker Compose for frontend and backend services ([c87ee65](https://github.com/AtaCanYmc/IstakaUstasi/commit/c87ee65e3207e8675c25655a9aca501680f3a0ec))
* Add functionality to generate a random hand of tiles and update translations ([c8d4f9a](https://github.com/AtaCanYmc/IstakaUstasi/commit/c8d4f9ad0c00f3c30b792969e6849b51061fc9f3))
* Add initial project structure with core components and configuration files ([f8b80c0](https://github.com/AtaCanYmc/IstakaUstasi/commit/f8b80c08759b30a0e39b9204f419d5d1bbe3bee2))
* Enhance authentication and image validation with token verification and file signature checks ([11c75d0](https://github.com/AtaCanYmc/IstakaUstasi/commit/11c75d07f0041ebd78880fcf791e3566515e70eb))
* Implement job processing for image extraction and solving with background tasks ([efe40ee](https://github.com/AtaCanYmc/IstakaUstasi/commit/efe40ee2099506dcef08e68648186ca612c6805d))
* Implement theme and localization support with language toggle and translations ([6135c99](https://github.com/AtaCanYmc/IstakaUstasi/commit/6135c99dca8e5e297eb576f55a403a1f16adcee9))
* Revise README to enhance project overview, structure, and setup instructions ([07d1f66](https://github.com/AtaCanYmc/IstakaUstasi/commit/07d1f6683226b4b8718322f8947749be5640dcf0))
* Update error messages for solving tiles with localization support ([566e357](https://github.com/AtaCanYmc/IstakaUstasi/commit/566e3573264a9ca6a27d1ff49cec9735252d4264))
