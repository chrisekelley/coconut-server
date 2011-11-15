#! /usr/bin/python

import datetime

from couchdbkit import *

class Greeting(Document):
      author = StringProperty()
      content = StringProperty()
      date = DateTimeProperty()

# server object
server = Server('http://admin:luvcouch@localhost:5984')

# create database
db = server.get_or_create_db("greeting")

# associate Greeting to the db
Greeting.set_db(db)

# create a new greet
greet = Greeting(
     author="Benoit",
     content="Welcome to couchdbkit world",
     date=datetime.datetime.utcnow()
)

# save it 
greet.save()

