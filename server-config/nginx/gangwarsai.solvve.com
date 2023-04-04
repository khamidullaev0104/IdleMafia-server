server {
    index index.html;
    server_name gangwarsai.solvve.com ;
    root /home/gangwars/www/client/build;
    location / {
        try_files $uri $uri/ /index.html;
    }

    listen [::]:443 ssl ipv6only=on;
    listen 443 ssl;
    ssl_certificate /etc/letsencrypt/live/gangwarsai.solvve.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/gangwarsai.solvve.com/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;
}
server {
    listen 80 ;
    listen [::]:80 ;
    server_name gangwarsai.solvve.com www.gangwarsai.solvve.com;

    return 302 https://$host$request_uri;
}

server {
  server_name www.gangwarsai.solvve.com;
  listen 443 ssl;
  return 302 $scheme://gangwarsai.solvve.com$request_uri;
}

server {
    server_name gangwarsai.solvve.com;
    listen [::]:5000 ssl;
    listen 5000 ssl;
    ssl_certificate /etc/letsencrypt/live/gangwarsai.solvve.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/gangwarsai.solvve.com/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

  location / {
    proxy_pass http://127.0.0.1:4000;
  }
}