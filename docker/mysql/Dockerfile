FROM wireless-guard-base:latest

ENV DEBIAN_FRONTEND noninteractive
RUN apt-get update
RUN apt-get install -yq mysql-server gosu
RUN mkdir /docker-entrypoint-initdb.d
RUN rm -rf /var/lib/mysql \
	&& mkdir -p /var/lib/mysql \
	&& mkdir -p /var/run/mysqld \
  && chown mysql:mysql /var/lib/mysql \
	&& chown mysql:mysql /var/run/mysqld
RUN sed -Ei 's/^(bind-address|log)/#&/' /etc/mysql/mysql.conf.d/mysqld.cnf \
	&& echo 'skip-name-resolve' | awk '{ print } $1 == "[mysqld]" && c == 0 { c = 1; system("cat") }' /etc/mysql/mysql.conf.d/mysqld.cnf > /tmp/mysqld.cnf \
	&& mv /tmp/mysqld.cnf /etc/mysql/mysql.conf.d/mysqld.cnf \
	&& echo 'skip-host-cache' | awk '{ print } $1 == "[mysqld]" && c == 0 { c = 1; system("cat") }' /etc/mysql/mysql.conf.d/mysqld.cnf > /tmp/mysqld.cnf \
	&& mv /tmp/mysqld.cnf /etc/mysql/mysql.conf.d/mysqld.cnf

VOLUME /var/lib/mysql

ENV MYSQL_ALLOW_EMPTY_PASSWORD 1
COPY docker-entrypoint.sh /usr/local/bin/
RUN chmod a+x /usr/local/bin/docker-entrypoint.sh
ENTRYPOINT ["docker-entrypoint.sh"]

EXPOSE 3306
CMD ["mysqld"]
