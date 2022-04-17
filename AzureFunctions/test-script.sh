#!/usr/bin/env bash

# Script to test the functions locally
# removes most of typing

if [[ "$1" == "blob" ]]; then # blob store
    shift

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
        echo "valid commands for \`blob\` are [list, up, clear, delete <name>]"
    fi
elif [[ "$1" == "db" ]]; then # cosmos db
    shift

    if [[ "$1" == "up" ]]; then
        http http://localhost:7071/api/UploadToDatabase
    else
        echo "valid commands for \`blob\` are [up]"
    fi
else
    echo "invalid category; valid categories are [blob, db]"
fi
