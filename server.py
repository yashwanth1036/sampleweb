from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer


class AppHandler(SimpleHTTPRequestHandler):
    def do_GET(self):
        if self.path.split("?", 1)[0] in {"/login", "/createaccount", "/home"}:
            self.path = "/index.html"
        super().do_GET()


if __name__ == "__main__":
    host = "0.0.0.0"
    port = 8000
    print(f"Northstar is listening on {host}:{port}")
    ThreadingHTTPServer((host, port), AppHandler).serve_forever()
