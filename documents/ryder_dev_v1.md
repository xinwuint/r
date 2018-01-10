# Ryder Development

## Folder structure

```
  |-common                          common files used by both kiosk and videosite
  |  |-assets
  |  |  |-fonts
  |  |  |-localization
  |  |-content
  |  |  |-images                    thumbnails
  |  |  |-videos                    videos in all languages
  |-documents                       documents of dev/deploy
  |-kiosk                           kiosk app main folder
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
  |-videosite                       video site main folder
  |  |-src
  |  |  |-assets
  |  |  |  |-images
  |  |  |-config                    configuration file
  |  |  |-css
  |  |  |-js
  |  |-tmp
```