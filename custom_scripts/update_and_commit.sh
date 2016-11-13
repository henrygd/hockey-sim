#! /bin/bash

# can be set as cronjob
# update shebangs in js files to current node location & chmod 774 all
# must run inside this directory

# fetch new ratings & calculate win percentage
./update.sh

echo 'Pushing to repository...'

# push updated team ratings to repo
./commit_to_repo.sh