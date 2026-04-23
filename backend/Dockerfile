FROM node:18-alpine

# Install nmap and iptables for port scanning and firewall control
RUN apk add --no-cache nmap iptables

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 5000

CMD ["node", "server.js"]
