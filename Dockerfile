FROM node:20
WORKDIR /app
COPY package*.json yarn.lock ./
RUN yarn install --frozen-lockfile
COPY prisma ./prisma/
RUN npx prisma generate
COPY . .
COPY env .env
RUN yarn build
EXPOSE 3000
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/main"]
