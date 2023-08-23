"""
Basic web server to host X16 debuggers
trick #1 : force no cache
trick #2 : read outside of the debugger folder /code/ => redirected to config.json::sources
"""

import os
import json
from http.server import SimpleHTTPRequestHandler, HTTPServer

f = open("config.json")
config = json.load(f)
f.close()

class app(SimpleHTTPRequestHandler):
  def end_headers(self):
      self.send_my_headers()  
      super().end_headers()

  def send_my_headers(self):
      self.send_header("Cache-Control", "no-cache, no-store, must-revalidate")
      self.send_header("Pragma", "no-cache")
      self.send_header("Expires", "0")     

  def translate_path(self, path: str) -> str:
    global config
    if path[0:6] == "/code/":
       path = path.replace("/code/", config['sources']+"/")
       print(path)
       return path
    return super().translate_path(path)
  
  def do_GET(self):
    super().do_GET()

with HTTPServer(('', 8000), app) as server:
  server.serve_forever()