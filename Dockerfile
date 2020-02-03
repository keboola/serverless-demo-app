FROM amazonlinux

# node + yarn
RUN yum -y groupinstall 'Development Tools'
RUN curl --silent --location https://rpm.nodesource.com/setup_12.x | bash -
RUN curl --silent https://dl.yarnpkg.com/rpm/yarn.repo > /etc/yum.repos.d/yarn.repo
RUN yum -y install nodejs yarn

RUN curl --location --silent --show-error --fail \
    https://raw.githubusercontent.com/vishnubob/wait-for-it/master/wait-for-it.sh > ./wait-for-it.sh \
    && chmod +x ./wait-for-it.sh

# serverless
RUN npm install -g serverless@1.60

# cache dependencies
WORKDIR /code
COPY ./yarn.lock /code/yarn.lock
COPY ./package.json /code/package.json
RUN yarn install

# working directory
COPY ./ /code
