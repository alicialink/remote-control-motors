/*
 * server.js
 *
 * The Express Node app that runs the web interface for the RemoteControlMotors
 * project. See README.md and motor-driver.js for more details.
 */

/*
* Copyright (c) 2013 Alicia M. F. Key
* 
* Permission is hereby granted, free of charge, to any person obtaining a 
* copy of this software and associated documentation files (the 
* "Software"), to deal in the Software without restriction, including 
* without limitation the rights to use, copy, modify, merge, publish, 
* distribute, sublicense, and/or sell copies of the Software, and to 
* permit persons to whom the Software is furnished to do so, subject to 
* the following conditions:
* 
* The above copyright notice and this permission notice shall be included 
* in all copies or substantial portions of the Software.
* 
* THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS 
* OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF 
* MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. 
* IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY 
* CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, 
* TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE 
* SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

'use strict';

var express = require('express'),
    driver = require('./motor-driver.js'),
    connect = require('connect');

var app = express();

app.set('view engine', 'jade');
app.set('views', __dirname + '/views');
app.use(connect.logger('dev'));

// Renders out the index.jade file.
app.get('/', function(req, res, next) {
  res.render('index');
});

// Grabs the frontend javascript file
app.get('/frontend.js', function(req, res, next) {
  res.sendfile(__dirname + '/views/frontend.js');
});

// Runs all motors at full speed
app.put('/full-speed', function(req, res, next) {
  process.nextTick(function() {
    driver.fullSpeed();
  });
  res.type('text');
  res.send('rev it up!');
  res.end();
});

// Sends the all stop command.
app.put('/all-stop', function(req, res, next) {

  process.nextTick(function() {
    driver.allStop();
  });

  res.type('text');
  res.send('Arretez-vous!');
  res.end();
});


// Route to set motor speed:
//
//    /motor?motor_number=1&speed=100
//
// Would set motor number 1 to speed 100

app.put('/motor',  function(req, res, next) {

  var motor_number = parseInt(req.param('motor_number')),
      speed = parseInt(req.param('speed'));

  process.nextTick(function() {
    driver.setMotorSpeed(motor_number, speed);
  });

  res.type('text');
  res.send('Motor ' + motor_number + ' set to speed ' + speed);
  res.end();
});

// Turn the server on to port 8088.
app.listen(8088);
