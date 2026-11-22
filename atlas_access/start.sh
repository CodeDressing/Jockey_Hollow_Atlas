#!/usr/bin/env bash
set -euo pipefail
[[ "${ATLAS_LOCAL_TEST:-}" != "1" ]]
export DJANGO_SETTINGS_MODULE=atlas_access.settings
python -m django migrate --noinput
python -m django createcachetable
python -c 'from atlas_access.viewer import inventory, showcase; inventory(); showcase()'
exec gunicorn atlas_access.wsgi --bind "0.0.0.0:${PORT:?}" --workers 2 --threads 4
