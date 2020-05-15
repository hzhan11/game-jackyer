import socket

HOST = '127.0.0.1'  # The server's hostname or IP address
PORT = 8888

with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
    s.connect((HOST, PORT))
    s.sendall(b'1')
    for i in range(100):
        data = s.recv(4096)
        print(str(data, 'utf-8'))