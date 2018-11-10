# Setting up Berkeleytime

reclone the repo! the `requirements.txt` has changed.

## Installing Services
### Mac
    brew update
    brew install postgresql
    brew services start postgresql
    brew install redis
    brew services start redis

### Linux
    apt-get update
    apt-get install postgresql
    apt-get install redis

### All
    psql -d postgres -U postgres
    create database bt_main;
    \q
    psql -d bt_main -U postgres
    create role bt with superuser login;
    alter role bt password 'yuxinsucks';
    \q
    psql bt_main < bt_main.bak

## Pip
    pip install --upgrade pip
    pip install virtualenv
    cd berkeleytime-copy
    virtualenv venv
    source venv/bin/activate
    pip install -r requirements.txt

## Running
    cd berkeleytime 
    python manage.py runserver
    
## Example
This is a list of commands I ran to get it working on Ubuntu. The ones you have to run should be similar, minus all the weird `apt-get` calls. 

    sudo apt-get update
    sudo apt-get install python-pip
    git clone https://github.com/hantaowang/berkeleytime-copy
    cd berkeleytime-copy/
    pip install virtualenv
    virtualenv venv
    source venv/bin/activate
    sudo apt-get install python-dev       build-essential libssl-dev libffi-dev      libxml2-dev libxslt1-dev zlib1g-dev      python-pip
    sudo apt-get install libjpeg-dev
    sudo apt-get install libncurses5-dev
    pip install -r requirements.txt
    sudo apt-get install redis
    sudo apt-get install postgresql postgresql-contrib
    psql -U postgres
    create database bt_main;
    create role bt with superuser login;
    alter role bt password 'yuxinsucks';
    \q
    psql bt_main < bt_main.bak
    cd berkeleytime/
    python manage.py runserver
