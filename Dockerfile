FROM amazonlinux

# node + yarn
RUN yum -y groupinstall 'Development Tools'
RUN curl --silent --location https://rpm.nodesource.com/setup_8.x | bash -
RUN curl --silent https://dl.yarnpkg.com/rpm/yarn.repo > /etc/yum.repos.d/yarn.repo
RUN yum -y install nodejs npm yarn python27

# serverless
RUN yarn global add serverless@1.32

# working directory
ADD ./ /code
WORKDIR /code

RUN yarn install
