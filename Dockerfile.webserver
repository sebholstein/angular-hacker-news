FROM abiosoft/caddy

COPY dist /srv/dist
COPY Caddyfile /srv/Caddyfile

EXPOSE 80 443
ENV CADDYPATH /root/.caddy

VOLUME /root/.caddy

ENTRYPOINT ["/usr/bin/caddy"]
CMD ["--conf", "/srv/Caddyfile", "--log", "stdout"]
