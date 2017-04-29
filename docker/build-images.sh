#!/bin/bash

cd `dirname ${0}`

docker pull ubuntu:17.04
docker build -t "wireless-guard-base" ./base
docker build -t "wireless-guard-mysql" ./mysql
