<VirtualHost 173.255.249.114:80>
  ServerAdmin rupert@2rmobile.com
  ServerName node.itrackmygps.com
  ServerAlias node.itrackmygps.com
  
  DocumentRoot /srv/nodejs/itrackmygps-node

  ProxyRequests Off
  ProxyPreserveHost On

  #ProxyPass /map http://173.255.249.114:8080/map
  #ProxyPassReverse /map http://173.255.249.114:8080/map
  #ProxyPass /location http://173.255.249.114:8080/location
  #ProxyPassReverse /location http://173.255.249.114:8080/location
  #ProxyPass /socket.io http://173.255.249.114:8080/socket.io
  #ProxyPassReverse /socket.io http://173.255.249.114:8080/socket.io
  #ProxyPass /devices http://173.255.249.114:8080/devices
  #ProxyPassReverse /devices http://173.255.249.114:8080/devices

  ProxyPass / http://173.255.249.114:8080/
  ProxyPassReverse / http://173.255.249.114:8080/

  ErrorLog /var/log/apache2/itrackmygps-node.error.log
  
  # Possible values include: debug, info, notice, warn, error, crit,
  # alert, emerg.
  LogLevel warn
  
  CustomLog /var/log/apache2/itrackmygps-node.access.log combined
</VirtualHost>
