FROM node:16.13.1-alpine AS node
FROM alpine/git:v2.32.0@sha256:a8a31155488a93a4d8abb834777c7b5f9d7c93db6051defbad8cc066b4e90072
COPY --from=node /usr/local/bin/node /usr/local/bin/node
COPY --from=node /usr/lib/libstdc++.so.6* /usr/lib/
COPY --from=node /usr/lib/libgcc_s.so.1 /usr/lib/
COPY scripts/git-server.js /server.js
USER 65534:65534
ENTRYPOINT ["node","/server.js"]
