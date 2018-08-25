#!/bin/bash
bundle exec jekyll clean
bundle exec jekyll build -I 

sudo cp -R _site/* /var/www/panxw.com
sudo rm /var/www/panxw.com/deploy.sh
sudo rm /var/www/panxw.com/Gemfile
sudo rm /var/www/panxw.com/Gemfile.lock
sudo rm /var/www/panxw.com/README.md
sudo rm /var/www/panxw.com/index_*/ -rf

exit

