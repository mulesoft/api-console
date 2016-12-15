FROM node:4.1

# Install Ruby (for Gem)
RUN apt-get update \
    && apt-get install -y ruby libssl1.0.0 openssl \
    && rm -rf /var/lib/apt/lists/*

# Install Bower, Grunt & SASS
RUN npm install -g bower grunt-cli \
    && gem install sass

# Define working directory.
WORKDIR /data

COPY . /data

RUN npm install && bower --allow-root install

EXPOSE 9000

ENTRYPOINT ["/usr/local/bin/grunt"]
CMD ["default"]