FROM node:24
ENV NODE_ENV=production

ARG image_commit
ARG image_tag
ENV IMAGE_COMMIT=${image_commit}
ENV IMAGE_TAG=${image_tag}

WORKDIR /home/node/app

COPY package*.json ./

RUN chown -R node:node /home/node/app

USER node

RUN npm install

COPY --chown=node:node . .

CMD [ "npm", "start" ]
