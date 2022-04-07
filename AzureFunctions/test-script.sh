#!/usr/bin/env bash

if [[ "$1" == "list" ]]; then
    http http://localhost:7071/api/ListImageBlobs
elif [[ "$1" == "up" ]]; then
    http http://localhost:7071/api/UploadImageBlob @testImage.jpg
elif [[ "$1" == "clear" ]]; then
    http http://localhost:7071/api/ClearImageBlobs
elif [[ "$1" == "delete" ]]; then
    echo "(deleting $2)"
    http http://localhost:7071/api/DeleteImageBlob <<<"$2"
else
    echo "valid commands are [list, up, clear, delete <name>]"
fi
