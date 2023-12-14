# This file has been bundled into launchgame.exe executable
import sys
import time
import http.server
import threading
import webbrowser
import tkinter as tk

if getattr(sys,'frozen', False):
    # pyinstaller splash screen
    import pyi_splash

if sys.argv[1:]:
    port = int(sys.argv[1])
else:
    port = 8000
url = f"http://127.0.0.1:{port}"

HandlerClass = http.server.SimpleHTTPRequestHandler
ServerClass  = http.server.HTTPServer
Protocol     = "HTTP/1.0"
server_address = ('127.0.0.1', port)
HandlerClass.protocol_version = Protocol
HandlerClass.extensions_map[".js"] = "text/javascript"
HandlerClass.extensions_map[".mjs"] = "text/javascript"
httpd = ServerClass(server_address, HandlerClass)

# Start http server
def start_server():
    sa = httpd.socket.getsockname()
    print("Serving HTTP on", sa[0], "port", sa[1], "...")
    print("Your game is now accessible at url", url)
    httpd.serve_forever()

# Launch browser
def launch(event):
    webbrowser.open_new(url)

# Stop server when button clicked
def stop_server(event):
    httpd.shutdown()
    sys.exit('Shutting down server. Thanks for playing!')

# Stop server when window closed
def close_window():
    httpd.shutdown()
    sys.exit('Shutting down server. Thanks for playing!')

# UI window
window = tk.Tk()
window.title('Your Game - Game Builder Workshop')

window.geometry('800x600')
frame = tk.Frame(window, background='white')
frame.pack(anchor=tk.CENTER, expand=True)
frame.rowconfigure([0,1,2,3], minsize=30, weight=1)
frame.columnconfigure([0, 1], minsize=50, weight=1)
title = tk.Label(frame, text='Your Game Launcher',background='white',font=("Inter", 24,) )
subtitle = tk.Label(frame, text='Powered by Game Builder Workshop',background='white',font=("Inter", 10) )
title.grid(row=0,column=0,columnspan=2)
subtitle.grid(row=1,column=0,columnspan=2)
launchButton = tk.Button(frame, text='Launch Game', font=("Inter", 14))
launchButton.grid(row=2, column=0, sticky="nsew",padx=10, pady=10)
launchButton.bind("<Button-1>", launch)
exitButton = tk.Button(frame, text='Exit', font=("Inter", 14))
exitButton.grid(row=2, column=1, sticky="nsew",padx=10, pady=10)
exitButton.bind("<Button-1>", stop_server)
desc = tk.Label(frame, text='The game launcher is running your game on a local server. \n Click above to launch your game in the browser window or exit the program.',background='white',font=("Inter", 10) )
desc.grid(row=3,column=0,columnspan=2)
window.protocol("WM_DELETE_WINDOW", close_window)

def main():
    threading.Thread(target=start_server).start()
    if getattr(sys,'frozen', False):
    # pyinstaller splash screen
        pyi_splash.close()
    window.mainloop()
    while True:
        try:
            time.sleep(1)
        except KeyboardInterrupt:
            sys.exit(0)

if __name__ == '__main__':
    main()