# Imagem de Origem
FROM node:lts-alpine

# Diretório de trabalho(é onde a aplicação ficará dentro do container).
WORKDIR /app

# Adicionando `/app/node_modules/.bin` para o $PATH
ENV PATH /app/node_modules/.bin:$PATH

# Instalando dependências da aplicação e armazenando em cache.
COPY package.json /app/package.json

RUN npm install --silent
RUN npm install react-scripts@5.0.1 -g --silent
RUN npm install -g serve

#Copiando fodlers
COPY . .

# Inicializa a aplicação
RUN npm run build

CMD ["serve","-s","build"]
