remote-control-motors
============

## Purpose ##

This is a proof-of-concept project to actuate devices via an HTML5/CSS3/JavaScript app targeted for mobile devices. (There is also a basic TCP/IP protocol, REST API, and some hardware thrown in for good measure). I realize there are cloud services to do many parts of this process for you, but I wanted to roll my own from the ground up to find out what it was like. There are four parts to this project:

1. **User Interface**: HTML5/CSS3/JavaScript targeted to small-screen mobile devices.

2. **Middleware**: Connects to the user interface via a REST API (via HTTP) and to the the motor controller via a basic (non-HTTP) TCP/IP protocol. I made a separate middleware layer for two reasons: First, there is more logic in the middleware layer than I wanted to put onto a little Arduino.  Second, later versions of this project will coordinate several independent hardware devices.

3. **Embedded Controller Software**: This creates a simple TCP port that accepts text-based commands to control the motors. It could be retooled to control other things with PWM.

4. **Physical Circuit**: This operates the motors based on signals from the Arduino software.

## Directories ##

There are two directories of source code for this project.

**RemoteControlMotors** Enables a simple (*not* HTTP) protocol to remotely control 4 motors. This is written in C and covers parts 3 and 4 (Embedded Controller Software and Physical Circuit) of the project.

**webapp** A webapp made with [Express](http://expressjs.org "Express.js homepage") and [jQuery Mobile](http://jquerymobile.com "jQuery Mobile website") built on [Node.js](http://nodejs.org "Node.js homepage") to provide a mobile interface to a mobile device. This is written in JavaScript and covers parts 1 and 2 (User Interface and Middleware) of this project.

## Hardware ##

This section is supplemental to the page at [akey7.com/remote-control-motors](http://akey7.com/remote-control-motors "Remote control motors webpage"). Go there to see more pictures and other things I did to stick this prpject together.

This project wasn't necessarily designed to set any electrical engineering high-water marks, just to hook up motors to a web interface. I will later use more elaborate motor drivers.

### Parts List ###

Here are the parts as of the time of this writing

+ **Arduino Uno R3 SMD**. Available as [SparkFun Part DEV-11224](https://www.sparkfun.com/products/11224? "Arduino Uno R3 SMD on SparkFun"). Of course the [non-SMD version](https://www.sparkfun.com/products/11021 "Non-SMD arduino uno r3")" works as well.

+ **Arduino Ethernet Shield**. Available as [SparkFun Part DEV-09026](https://www.sparkfun.com/products/9026? "Arduino Ethernet shield on AparkFun")

+ **4 4.5 VDC Volt DC motors**. I used [SparkFun ROB-10171 Hobby Motors](https://www.sparkfun.com/products/10171? "Hobby motors on SparkFun"). I run them on 3 VDC in this experiment.

+ **4 50V rectifier diodes**. 1N4001 or similar. I purchased a 25 pack assortment from [RadioShack 276-1653](http://www.radioshack.com/product/index.jsp?productId=2062589&filterName=Type&filterValue=Diodes "25 Pack diodes"). Nothing fancy here, just low-cost blowback diodes.

+ **4 TIP-120 NPN Darlington Transistors**. I purchased [RadioShack 276-2068](http://www.radioshack.com/product/index.jsp?productId=2062617 ""darlington transistor from RadioShack").

+ 4 AA batteries, 2 3 volt AA holders [RadioShack 270-382](http://www.radioshack.com/product/index.jsp?productId=2062238 "2 AA holder") and [9V snap connectors 270-324](http://www.radioshack.com/product/index.jsp?productId=2062218 "9V battery clips") See note regarding power sources below.

+ 9 VDC wall adpater with coaxial plug for Arduino. [SparkFun TOL-00298](https://www.sparkfun.com/products/298 "Sparkfun power adapter.")

I listed the sources for the parts only because those are the places where I obtained the parts. You can probably find them somewhere else if you prefer.

### Note on power requirements ###

For the motor power supplies, I used 2 sets of 2 AA holders. Each AA holder supplies 3 VDC, and I wired the holders in parallel to supply more and maintain longer batter life. Other power 3 VDC power supplies are possible, as long as they supply enough current to run all the motors at the same time (according to the [datasheet](http://www.sparkfun.com/datasheets/Robotics/hobbymotor.JPG "motor datasheet") this is 4 x 320ma = 1280 ma)

For the Arduino power supply, I used the wall adapater. Again, other power sources are possible.

Finally, I wired the grounds together in this experiment. This is a simple design and does not protect the motor circuitry from the Arduino circuitry. This doesn't appear to be a problem here, but could be an isue in more complex designs.

## Embedded Controller Software ##

The controller software should be customized for your network installation. Anecdotally, I had heard of repeatedly reloading Arduino sketches that use DHCP leases would take out a bunch of leases for the same device. So I used a static IP. Customize the following lines to setup the interface for your network, located at approximately line 90.

```
const int serverPort = 17;
EthernetServer server(serverPort);
byte mac[] = { 0x90, 0xA2, 0xDA, 0x00, 0xD7, 0xD2 };
IPAddress gateway(192, 168, 0, 1);
IPAddress subnet(255, 255, 255, 0);
IPAddress ip(192, 168, 0, 33);
```

By default, the controller opens TCP server port 17. It accepts strings sent to this port to operate the motors. The 3 supported commands are the following:

+ `full speed` Runs all the motors at full speed.

+ `all stop` Stops all motors

+ *motor,[motor number],[motor speed]* This sets the speed for an individual motor. Speeds range from 0 to 100, and motor numbers are 0, 1, 2, or 3. For example, the following commands would set motors 0 and 2 to a high speed and motors 1 and 3 to a low speed.

```
motor,0,95
motor,2,95
motor,1,23
motor,3,23
```

Test commands can be sent with the `telnet` command. For example `telnet 192.168.0.1 17` with the default configuration given above. Substitute your own IP address.

Use the MAC address that came with your device if it came with one. Otherwise, create a MAC address unique to your network. See the [Arduino Ethernet Board page](http://arduino.cc/en/Main/ArduinoBoardEthernet "Arduino Ethernet board") for more information.

## Middleware and User Interface ##

**First**: You will need [Node.js](http://nodejs.org "Node.js homepage") to operate the middle ware and the user interface. Install it on your system.

**Second**: You need to install the npm files for the web app server. From the `webapp/` directory, execute the command

```
npm install
```

 **Third**: There is one change to `webapp/motor-driver.js` to be made to connect the middleware to the controller. Customize the following lines to match th IP address and TCP port.

```
var controller_hostname = '192.168.0.33';
var controller_port = 17;
```

**Fourth** Execute the server with the following command:

```
node server.js
```

**Fifth**: Connect to the interface with a browser. It runs on port 8088. For example, the following IP address will access it from a browser running on the same machine as the server `http://127.0.0.1:8088`

## Legal and License Stuff ##

Copyright (c) 2013 Alicia M. F. Key

Permission is hereby granted, free of charge, to any person obtaining a 
copy of this software and associated documentation files (the 
"Software"), to deal in the Software without restriction, including 
without limitation the rights to use, copy, modify, merge, publish, 
distribute, sublicense, and/or sell copies of the Software, and to 
permit persons to whom the Software is furnished to do so, subject to 
the following conditions:

The above copyright notice and this permission notice shall be included 
in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS 
OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF 
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. 
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY 
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, 
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE 
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
