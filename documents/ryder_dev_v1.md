# Ryder Development

## Project folder structure
```
  |-common                          common files used by both kiosk and videosite
  |  |-assets
  |  |  |-fonts
  |  |  |-localization
  |  |-content
  |  |  |-images                    thumbnails
  |  |  |-videos                    videos in all languages
  |-documents                       documents of dev/deploy
  |-kiosk                           sub project: kiosk app
  |  |-src
  |  |  |-assets
  |  |  |  |-images
  |  |  |  |-js
  |  |  |  |-sass
  |  |  |-config                    configuration file
  |  |-tmp
  |-publish                         publish folder
  |  |-kiosk                        all files to be deployed to BS browser
  |  |-videosite                    all files to be copied to video site wwwroot folder
  |-videosite                       sub project: video site
  |  |-src
  |  |  |-assets
  |  |  |  |-images
  |  |  |-config                    configuration file
  |  |  |-css
  |  |  |-js
  |  |-tmp
```

## Making build
1. Install latest version of npm
2. Goto project folder and run `npm install`
3. Build kiosk app by `cd kiosk && gulp build`
4. Build videosite by `cd videosite && gulp build`
5. Output will be in `kiosk/build` and `videosite/build`

## Launching
The launching url of kiosk is
```
index.html?lang={lang}&location={location}
```
| Param | Value | Mandatory | Default | Desc |
| ------ | ------ | ------ | ------ | ------ |
| lang | 'en-us', 'en-ca', 'fr-ca' | no | 'en-us' | locale for app |
| location | any string | no | try get SN first, if fail, use 'test-location' | used to identify this broswer/location |

