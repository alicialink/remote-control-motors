/*
 * motor-driver.js
 *
 * This loads motor-driver.js and runs the motors through a series of tests.
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

var motor_controller = require('./motor-driver.js');

var motionPattern = [];

motionPattern[0] = function() {
  setTimeout(function() {
    motor_controller.setMotorSpeed(3, 33);
  },200);

  setTimeout(function() {
    motor_controller.setMotorSpeed(2, 33);
    motor_controller.setMotorSpeed(3, 13);
  },2200);

  setTimeout(function() {
    motor_controller.setMotorSpeed(1, 33);
    motor_controller.setMotorSpeed(2, 13);
    motor_controller.setMotorSpeed(3, 0);
  },4200);

  setTimeout(function() {
    motor_controller.setMotorSpeed(0, 33);
    motor_controller.setMotorSpeed(1, 13);
    motor_controller.setMotorSpeed(2, 0);
  },6200);

  setTimeout(function() {
    motor_controller.setMotorSpeed(0, 13);
    motor_controller.setMotorSpeed(1, 0);
  },8200);

  setTimeout(function() {
    motor_controller.setMotorSpeed(0, 0);
  },20200);
};

motionPattern[1] = function() {
  setTimeout(function() {
    motor_controller.setMotorSpeed(1, 20);
    motor_controller.setMotorSpeed(3, 20);
  },200);

  setTimeout(function() {
    motor_controller.setMotorSpeed(1, 0);
    motor_controller.setMotorSpeed(3, 0);
  },3200);

  setTimeout(function() {
    motor_controller.setMotorSpeed(0, 20);
    motor_controller.setMotorSpeed(2, 40);
  },3350);

  setTimeout(function() {
    motor_controller.setMotorSpeed(0, 0);
    motor_controller.setMotorSpeed(2, 0);
  },5350);
};

motionPattern[1]();
