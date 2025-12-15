fx_version 'cerulean'
game 'gta5'

author 'loku'
description 'hud'
version '1.0.0'

ui_page 'html/index.html'

files {
    'html/*',
    'stream/squaremap.ytd',
    'html/index.html',
    'html/assets/*.js',
    'html/assets/*.css',
    'html/*.png',
    'html/*.jpg'
}

dependency 'qb-core'

client_script 'client.lua'