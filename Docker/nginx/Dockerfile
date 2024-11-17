FROM nginx:alpine


COPY ./globalfuel.local.crt /etc/nginx/globalfuel.local.crt
COPY ./globalfuel.local.key /etc/nginx/globalfuel.local.key
COPY ./server.conf /etc/nginx/sites-enabled/server.conf

# Expose ports
EXPOSE 80 443

# Start services
CMD nginx -g "daemon off;"

