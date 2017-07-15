#!/bin/bash
cd app/

grep "<script src=\"vendor.*></script>" index.html | cut -d '"' -f 2 | xargs /opt/nodejs/bin/uglifyjs -c -m -o lib.min.js
echo "minify lib js"

grep "<script src=\"js.*></script>" index.html | cut -d '"' -f 2 | xargs /opt/nodejs/bin/uglifyjs -c -m -o app.min.js
echo "minify app js"

