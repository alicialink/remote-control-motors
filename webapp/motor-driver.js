/*
 * motor-driver.js
 *
 * This connects to the sketch found in RemoteMotors.ino via the text TCP/IP
 * interface.
 *
 * The controller software in RemoteControlMotors.ino handles the error
 * control for the motors, so this JavaScript pretty much just passes
 * the commands straight to the motor controller.
 *
 * See README.md for more details.
 *
 * TODO: Do not hardcode the motor controller IP address into the sketch.
 *
 * This is a sketch to control brushless DC motors with PWM via a simple
 * text-based TCP/IP interface. See the README.md file for more information.
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

/*** BEGIN included libraries ***/

"use strict";

var net = require('net');

var controller_hostname = '192.168.0.33';
var controller_port = 17;

// In all these functions, the controller posses enough error handling
// logic to prevent things from going to far awry, so I'll just leave it
// to the controller to catch error and make sure that nothing bad happens
//
// These errors, for now, will be invisible to the developer.

// PRIVATE to this module
function send(message) {
  var client = net.connect({host: controller_hostname, port: controller_port}, function() {
    client.write(message);
    client.end();
  });
}

// exported
// Set all motors in the controller at full speed.
function fullSpeed() {
  send("full speed");
}

// exported
function allStop() {
  send("all stop");
}

// exported
function setMotorSpeed(motor_number, speed) {
  var command = "motor," + motor_number + "," + speed;  
  send(command);
}

// Export the API
module.exports = {
  allStop: allStop,
  fullSpeed: fullSpeed,
  setMotorSpeed: setMotorSpeed
};
