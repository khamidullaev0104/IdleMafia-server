server {
    server_name db-gangwarsai.solvve.com;
    location / {
        proxy_pass http://127.0.0.1:4321;
    }

    listen [::]:443 ssl;
    listen 443 ssl;
    ssl_certificate /etc/letsencrypt/live/db-gangwarsai.solvve.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/db-gangwarsai.solvve.com/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;
}

server {
    listen 80 ;
    listen [::]:80;
    server_name db-gangwarsai.solvve.com;

    return 302 https://$host$request_uri;
}

# sudo certbot --nginx -d db-gangwarsai.solvve.com