#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Vraies requêtes HTTP sur un serveur local isolé ; aucun site public modifié."""
import portable_io
from pathlib import Path
import socket
import subprocess
import sys
import time
import unittest
from urllib.error import HTTPError
from urllib.request import HTTPRedirectHandler, Request, build_opener, urlopen

ROOT=Path(__file__).resolve().parents[1]


class NoRedirect(HTTPRedirectHandler):
    def redirect_request(self,*args,**kwargs):
        return None


class PreviewHTTP(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        with socket.socket() as candidate:
            candidate.bind(('127.0.0.1',0))
            port=candidate.getsockname()[1]
        cls.origin='http://127.0.0.1:'+str(port)
        cls.server=subprocess.Popen([sys.executable,str(ROOT/'scripts/preview.py'),'--port',str(port)],
                                    cwd=ROOT,stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)
        deadline=time.monotonic()+10
        try:
            while True:
                if cls.server.poll() is not None:
                    raise RuntimeError('Le serveur local ne démarre pas')
                try:
                    with urlopen(cls.origin+'/Thot/',timeout=1) as response:
                        assert response.read()==(ROOT/'index.html').read_bytes(), 'Mauvaise copie du site'
                    break
                except OSError:
                    if time.monotonic()>=deadline:
                        raise
                    time.sleep(.1)
        except BaseException:
            cls.server.terminate();cls.server.wait(timeout=5)
            raise

    @classmethod
    def tearDownClass(cls):
        cls.server.terminate();cls.server.wait(timeout=5)

    def test_get_and_head_match(self):
        for path in ['/Thot/','/Thot/index.html','/Thot/assets/navigation.js','/Thot/assets/navigation.css']:
            with self.subTest(path=path):
                with urlopen(self.origin+path,timeout=5) as get:
                    body=get.read();length=get.headers['Content-Length'];mime=get.headers['Content-Type']
                    self.assertEqual(get.status,200)
                with urlopen(Request(self.origin+path,method='HEAD'),timeout=5) as head:
                    self.assertEqual(head.status,200)
                    self.assertEqual(head.headers['Content-Length'],length)
                    self.assertEqual(head.headers['Content-Type'],mime)
                    self.assertEqual(head.read(),b'')
                self.assertEqual(int(length),len(body))

    def test_redirects(self):
        opener=build_opener(NoRedirect)
        for path in ['/','/Thot']:
            for method in ['GET','HEAD']:
                with self.subTest(path=path,method=method),self.assertRaises(HTTPError) as raised:
                    opener.open(Request(self.origin+path,method=method),timeout=5)
                error=raised.exception
                self.assertEqual(error.code,302)
                self.assertEqual(error.headers['Location'],'/Thot/')
                error.close()

    def test_404(self):
        for path in ['/hors-prefixe','/Thot/absent.html']:
            for method in ['GET','HEAD']:
                with self.subTest(path=path,method=method),self.assertRaises(HTTPError) as raised:
                    urlopen(Request(self.origin+path,method=method),timeout=5)
                error=raised.exception
                self.assertEqual(error.code,404)
                self.assertEqual(error.headers['Content-Type'],'text/html; charset=utf-8')
                self.assertEqual(error.read(),b'' if method=='HEAD' else (ROOT/'404.html').read_bytes())
                error.close()

    def test_existing_internal_http_suite(self):
        subprocess.run([sys.executable,str(ROOT/'scripts/test-explorer-http.py'),'--origin',self.origin],
                       cwd=ROOT,check=True,timeout=30)


if __name__=='__main__':
    unittest.main(verbosity=2)
