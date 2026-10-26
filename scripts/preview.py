#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Aperçu local fidèle au préfixe GitHub Pages : http://127.0.0.1:8765/Thot/."""
import portable_io  # Encodage CLI stable, sans dépendance système.
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import urlsplit
import argparse

ROOT = Path(__file__).resolve().parents[1]

class Preview(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)

    def do_GET(self):
        path = urlsplit(self.path).path
        if path in ('/', '/Thot'):
            self.send_response(302)
            self.send_header('Location', '/Thot/')
            self.end_headers()
            return
        if not path.startswith('/Thot/'):
            self.send_error(404)
            return
        self.path = self.path[len('/Thot'):]
        super().do_GET()

    def send_error(self, code, message=None, explain=None):
        if code != 404:
            return super().send_error(code, message, explain)
        body = (ROOT / '404.html').read_bytes()
        self.send_response(404)
        self.send_header('Content-Type', 'text/html; charset=utf-8')
        self.send_header('Content-Length', str(len(body)))
        self.end_headers()
        if self.command != 'HEAD':
            self.wfile.write(body)

if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--port', type=int, default=8765)
    args = parser.parse_args()
    print(f'Aperçu local : http://127.0.0.1:{args.port}/Thot/', flush=True)
    ThreadingHTTPServer(('127.0.0.1', args.port), Preview).serve_forever()
