# Ryder Deploy

## Prepare contents

1. Provide all videos/thumbnails, and also the menifest file to development team, they will integrate contents with code.
** Note:
- An video could be bilingual as long as 2 physical files are provided;
- If secound language version is provided, the primary language version is MANDATORY.**

2. Get publish folders from dev team. Usually they are at here:

https://cridevteam.visualstudio.com/_git/Ryder?path=%2Fpublish&version=GBdevelop&_a=contents


## Deploy kiosk app to production

1. Kiosk app expects 1 parameter, and need to be configured in BS CMS.
| Param | Possible Value | Mandatory | Desc |
| ------ | ------ | ------ | ------ | ------ |
| lang | 'en-us', 'en-ca', 'fr-ca' | yes | locale for app |


2. Kiosk app needs to access BrightSign "BrightScript-Javascript Objects" to fetch SN of BS player, like:
```javascript
var deviceInfo = new BSDeviceInfo(),
    serialNumber = deviceInfo.deviceUniqueId;
```
And this has to be enabled at presentation creation/schedule time: 

http://docs.brightsign.biz/display/DOC/Enabling+BrightScript-JavaScript+Objects

## Deploy video site to production

Copy `publish/videosite/*` to proper www folder lacated on desired HTTP server.

