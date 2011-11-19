#! /usr/bin/python

import datetime
import urllib
import urllib2
import logging
import json

from couchdbkit  import Server, Consumer

server_account_name="ugnotify@gmail.com"
server_account_password="12$gug56"
collapse_key=1
# accountName = "chris@vetula.com"
accountName = "kayunganda@gmail.com"
url = "http://192.168.0.3:8080/sender?accountName="+accountName
f = urllib2.urlopen(url)
registrationId = f.read()
print registrationId
text="This is a test from python."

def sendMessage( accountName, registrationId, text ):
    global collapse_key
    global server_account_name
    authToken = getAuthToken()
    if authToken=="":
        return "Cannot authenticate "+server_account_name 
    form_fields = {
        "registration_id": registrationId,
        "collapse_key": str(collapse_key),
        "data.message": text
    }
    logging.info( "authToken: "+authToken )
    form_data = urllib.urlencode(form_fields)
    c2dmUrl="http://android.apis.google.com/c2dm/send"
    req = urllib2.Request(c2dmUrl, form_data)
    # req.add_header("Authorization," "GoogleLogin auth="+authToken)
    req.add_header('Authorization', 'GoogleLogin auth=' + authToken)
    response = urllib2.urlopen(req)
    statuscode = response.getcode()
    collapse_key=collapse_key+1
    result = response.read()    
    return result

def getAuthToken():
    global server_account_name
    global server_account_password
    form_fields = {
        "accountType": "GOOGLE",
        "Email": server_account_name,
        "Passwd": server_account_password,
        "service": "ac2dm",
        "source": "kims"
    }
    form_data = urllib.urlencode(form_fields)
    authLoginUrl="https://www.google.com/accounts/ClientLogin"
    req = urllib2.Request(authLoginUrl, form_data)
    response = urllib2.urlopen(req)
    statuscode = response.getcode()
    result = response.read()                    
    logging.info( "result: "+result )
                        
    if statuscode==200:
        logging.info( "Auth response: "+result )
        lines=result.split('\n')
        authToken=""
        for line in lines:
            if line.startswith( "Auth=" ):
                authToken=line[5:len(line)]
        return authToken
    logging.error( "error code: "+str(result.status_code)+"; error message: "+result.content )
    return ""

# server object
server = Server('http://admin:luvcouch@localhost:5984')

# create database
db = server.get_or_create_db("coconut")

c = Consumer(db)
def sendCouchMessage(line): 
    #print "got %s" % line 
    print json.dumps(line)
    id = line['id']
    
    print "id: " + id
    doc = db.get(id) 
    if 'phone' in doc:
    	phone = doc['phone']
    	print json.dumps(doc)
    	message = "Message from " + phone
    	status = sendMessage( accountName, registrationId, message )

c.wait(sendCouchMessage,since=5,heartbeat=True) # Go into receive loop

