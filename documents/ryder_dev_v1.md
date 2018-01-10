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
- Install latest version of npm
- Goto project folder and run `npm install`
- Build kiosk app by `cd kiosk && gulp build`
- Build videosite by `cd videosite && gulp build`
- Runnable build will be in `kiosk/build` and `videosite/build`

## Application behavior

The launching url is `index.html?lang=<locale>&location=<locationid>`