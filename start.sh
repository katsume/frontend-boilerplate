#!/bin/sh

DIR=$(cd $(dirname $0) && pwd)
NAME=${DIR##*/}

if ! docker ps | grep $NAME > /dev/null ; then
	docker run -d --rm --name $NAME -p 8000:80 -v $(cd build && pwd):/usr/share/nginx/html/ nginx:alpine
fi

gulp
