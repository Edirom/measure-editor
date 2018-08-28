#!/bin/sh

TARGET=/usr/share/nginx/html/config.js

echo "'use strict';" > $TARGET

if [ ! -z "$EDITOR_BACKEND" ]; then
    echo "window.env={EDITOR_BACKEND: '$EDITOR_BACKEND'};" > /usr/share/nginx/html/config.js
fi

nginx -g "daemon off;"
