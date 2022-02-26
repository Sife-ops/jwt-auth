#!/bin/sh

. ./env.sh

cp ./docker-compose-vpc.yml ../docker-compose.yml

pushd ../
pushd ./frontend

if ! command -v npm 1>/dev/null 2>&1 ; then
    echo 'Error: npm not found'
    exit 1
fi

if ! stat ./node_modules 1>/dev/null 2>&1 ; then
    npm install
fi

npm run build

popd

docker-compose up --build $@
