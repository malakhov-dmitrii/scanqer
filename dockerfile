FROM ubuntu:18.04

# Install Node.js
RUN apt-get update
RUN apt-get -y install curl
RUN apt-get -y install sudo
RUN useradd -m docker && echo "docker:docker" | chpasswd && adduser docker sudo
RUN curl -fsSL https://deb.nodesource.com/setup_14.x | sudo -E bash -
RUN apt-get install -y build-essential
RUN apt-get install -y nodejs

# Install Yarn
RUN curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | sudo apt-key add -
RUN echo "deb https://dl.yarnpkg.com/debian/ stable main" | sudo tee /etc/apt/sources.list.d/yarn.list
RUN sudo apt-get update
RUN sudo apt-get install yarn


# create & set working directory
RUN apt-get update && apt-get install -y graphicsmagick

RUN mkdir -p /usr/src
WORKDIR /usr/src

# copy source files
COPY . /usr/src

# install dependencies
RUN npm install

# start app
RUN npm run build
EXPOSE 3000
CMD npm run start


# # Install graphics magick

# # Create app directory
# RUN mkdir -p /usr/src/app
# WORKDIR /usr/src/app

# # Install app dependencies
# COPY package.json /usr/src/app/
# RUN npm install

# # Bundle app source
# COPY . /usr/src/app

# EXPOSE 3000
# CMD [ "npm", "start" ]
# @Hennessy811
