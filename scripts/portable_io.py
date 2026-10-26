# -*- coding: utf-8 -*-
"""Encodage identique pour les outils CLI, y compris un terminal Windows legacy."""
import sys

sys.dont_write_bytecode = True
for stream in (sys.stdout, sys.stderr):
    if hasattr(stream, 'reconfigure'):
        stream.reconfigure(encoding='utf-8')
