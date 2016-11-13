#! /bin/bash

cd ..
git add -A
git commit -m "Update ratings -- $(date)"
git push origin master