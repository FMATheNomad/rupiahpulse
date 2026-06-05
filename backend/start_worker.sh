#!/bin/bash
cd /home/fariz/Destop/all-project-running/fma-micro-saas-ecosystems/rupiahpulse/backend
export PYTHONPATH=.
exec /home/fariz/Destop/all-project-running/fma-micro-saas-ecosystems/rupiahpulse/backend/.venv/bin/python -m app.jobs.runner
