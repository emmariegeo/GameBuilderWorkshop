import sys
import time
import http.server
import threading
import webbrowser

HandlerClass = http.server.SimpleHTTPRequestHandler
ServerClass  = http.server.HTTPServer
Protocol     = "HTTP/1.0"

if sys.argv[1:]:
    port = int(sys.argv[1])
else:
    port = 8000
url = f"http://127.0.0.1:{port}"

def start_server():
    server_address = ('127.0.0.1', port)
    HandlerClass.protocol_version = Protocol
    HandlerClass.extensions_map[".js"] = "text/javascript"
    HandlerClass.extensions_map[".mjs"] = "text/javascript"
    httpd = ServerClass(server_address, HandlerClass)

    sa = httpd.socket.getsockname()
    print("Serving HTTP on", sa[0], "port", sa[1], "...")
    httpd.serve_forever()

def main():
    threading.Thread(target=start_server).start()
    webbrowser.open_new(url)
    while True:
        try:
            time.sleep(1)
        except KeyboardInterrupt:
            sys.exit(0)

if __name__ == '__main__':
    main()