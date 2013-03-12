/*
 * RemoteMotors.ino
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

#include <SPI.h>
#include <Ethernet.h>

/*** END included libraries ***/


/*** BEGIN motor operation variables ***/

// Number of pins that motors are conneted to (length of the array below)
// The #define lets me staticially allocate the array below for the
// structures.
const int kNumberOfMotors = 4;

// Minimum and maximum duty cycles for the motors. I determined these
// by experimentation, and they may need to be tweaked for other motors.
const int kMinPwmDutyCycle = 75;
const int kMaxPwmDutyCycle = 224;

// Maximum and minimum speeds that can be requested of the motors.
// These can be changed for a specific situation. The minimum is the
// "off" value, the maximum is the "full throttle" value.
//
// These are for values entered over the TCP interface. They are mapped
// to the PwmDutyCycle values above by convertSpeedToPwmDutyCycle().
const int kMinSpeed = 0;
const int kMaxSpeed = 100;

// The pins the motors are connected to customize this to your
// installation. Make sure that these are all PWM capable pins
const int kMotorPins[] = { 9, 6, 5, 3 };

// This is the structure that holds settings for motor pins
// and their duty cycles
typedef struct {
  int pin;
  int dutyCycle;
} motorState;

// Holds the state of each motor.
motorState motor[kNumberOfMotors];

// Number of milliseconds to operate motors without a command
// on the TCP server. If no commands are reeived after this timeout,
// all motors will shut down.
const unsigned long kShutdownTimeoutMillis = 60000;
unsigned long timestampOfLastCommand;

/*** END motor operation variables ***/


/*** BEGIN network customization ***/

// Note: I have created a brand new MAC on the fly since there was not
// one on the box it came in
const int serverPort = 17;
EthernetServer server(serverPort);
byte mac[] = { 0x90, 0xA2, 0xDA, 0x00, 0xD7, 0xD2 };
IPAddress gateway(192, 168, 0, 1);
IPAddress subnet(255, 255, 255, 0);
IPAddress ip(192, 168, 0, 33);

/*** END network customization ***/


/*** BEGIN Buffer declaration ***/

// These are buffer declarations to hold strings for TCP/IP input and output
//
// statusBuffer holds status messages to be written to TCP/IP
//
// tcpReadBuffer holds data as it is received bt TCP/IP
//
// tcpShouldDisconnect is true if the TCP/IP interface should disconnect. Not
// a buffer, but does deal with its management
//
// All the text handling is through C strings.

#define BUFFER_SIZE 256

char statusBuffer[BUFFER_SIZE];
char tcpReadBuffer[BUFFER_SIZE];
bool tcpShouldDisconnect;

/*** END Buffer declaration ***/


/*** BEGIN Main setup and loop functions ***/

// setup() calls all the subsystem setup functions.
void setup() {
  Serial.begin(9600);
  Serial.println("ProtocolRunner: Hello! Serial interface started");
  setupTcpServer();
  setupMotors();
  setupShutdownTimeoutWatchdog();
}

// loop() loops through all subsystem loop functions.
void loop() {
  loopShutdownTimeoutWatchdog();
  loopStatus();
  loopTcpServer();
  loopCommands();
  loopMotors();
}

/*** END Main setup and loop functions ***/


/*** BEGIN Motor handling functions ***/

// Setup the initial states of the motors and their pins
void setupMotors() {
  for (int i=0; i<kNumberOfMotors; i++) {
    pinMode(kMotorPins[i], OUTPUT);
    motor[i].pin = kMotorPins[i];
    motor[i].dutyCycle = 0;
  }
}

// Loop through the states of the motors and set PWM control outputs to
// those values.
void loopMotors() {
  for (int i=0; i<kNumberOfMotors; i++) {
    analogWrite(motor[i].pin, motor[i].dutyCycle);
  }
}

// Shuts down all the motors by writing their duty cycels as 0. After this is
// called, the next invocation of loopMotors() will halt the motors.
void shutdownAllMotors() {
  for(int i=0; i<kNumberOfMotors; i++) {
    motor[i].dutyCycle = 0;
  }
}

// Sets all the motors to full duty cycle. When loopMotors() runs, then the 
// states of all the motors are written to PWM.
void fullSpeedAllMotors() {
  for(int i=0; i<kNumberOfMotors; i++) {
    motor[i].dutyCycle = convertSpeedToPwmDutyCycle(kMaxSpeed);
  }
}

// The external TCP/IP interface presents a range of values between
// kMinSpeed and kMaxSpeed. But the PWM outputs are set between 
// kMinPwmDutyCycle and kMaxPwmDutyCycle. This function converts between the 
// two ranges.
//
// kMinPwmDutyCycle and kMaxPwmDutyCycle should be calibrated to the motors
// connected to the device.
//
// kMinSpeed and kMaxSpeed should be set to what you want the external TCP/IP
// interface to be.

int convertSpeedToPwmDutyCycle(int speed) {
  int step1 = constrain(speed, kMinSpeed, kMaxSpeed);
  int step2 = step1>kMinSpeed ? map(step1, kMinSpeed, kMaxSpeed, kMinPwmDutyCycle, kMaxPwmDutyCycle) : 0;

  Serial.print("Converted speed ");
  Serial.print(speed);
  Serial.print(" to duty cycle ");
  Serial.println(step2);

  return step2;
}
/*** END Motor handling functions ***/


/*** BEGIN TCP Server handling functions ***/

// Network settings
// BE SURE TO CHANGE THESE TO MATCH YOUR INTERFACE AND IP ADDRESS
// AND PORT OF YOUR ETHERNET MODULE!
//
// Also, the SD Card reader is EXPLICITLY DISABLED by setting pin
// 4 to high

void setupTcpServer() {
  pinMode(4, OUTPUT);
  digitalWrite(4, HIGH);
  Ethernet.begin(mac, ip, gateway, subnet);
  server.begin();
  Serial.print("ProtocolRunner: Server operational at ");
  Serial.print(Ethernet.localIP());
  Serial.print(" port ");
  Serial.println(serverPort);
  tcpShouldDisconnect = false;
}

// Services the TCP/IP interface and copies bytes received into
// tcpReceivedBuffer. This buffer is then read during the command parsing
// to extract commands to operate the motors.

void loopTcpServer() {
  unsigned tcpReadBufferCursor = 0;
  EthernetClient client = server.available();

  for (int i=0; i<BUFFER_SIZE; i++) {
    tcpReadBuffer[i] = '\0';
  }

  if (client) {

    while (client.connected()) {

      if (tcpShouldDisconnect) {
        client.stop();
        tcpShouldDisconnect = false;
      }

      if(client.available()) {
        char symbol = client.read();

        if (symbol == '\r') {
          //Serial.print("TCP: ");
          //Serial.println("Ignoring \\r");

        } else if (symbol == '\n') {
          //Serial.print("TCP command: ");
          //Serial.println(tcpReadBuffer);
          //client.println("whatever");
          client.println(statusBuffer);
          break;

        } else {
          if (tcpReadBufferCursor < BUFFER_SIZE) {
            tcpReadBuffer[tcpReadBufferCursor] = symbol;
            tcpReadBufferCursor++;

          } else {
            Serial.println("TCP: Buffer overflow caught!");
          }
        }
      }
    }
  }
}
/*** END TCP Server handling functions ***/


/*** BEGIN Status looping function ***/

// Creates the strings for status reports to report back to client.
void loopStatus() {
  snprintf(statusBuffer, BUFFER_SIZE, "READY,motorCount=%d,kShutdownTimeoutMillis=%u", kNumberOfMotors, kShutdownTimeoutMillis);
}

/*** END Status looping function ***/


/*** BEGIN command handling functions ***/
/*void setupCommands() {
}*/

// Pasrses and executes commands received over TCP/IP
void loopCommands() {
  if (strlen(tcpReadBuffer) > 0) {
    Serial.print("Command ");
    Serial.print(strlen(tcpReadBuffer));
    Serial.print(": ");
    Serial.println(tcpReadBuffer);

    char *cmd;
    cmd = strtok(tcpReadBuffer, ",");

    // Update the timestamp of the command. 
    //
    // TODO: Actually, should probably be
    // refactored into the individual successful command executions
    // for maximum security
    resetShutdownTimeoutWatchdog();

    // This is somewhat buggy, because a disconnect doesn't seem to happen
    // without an extra carriage return.
    if (strcmp(cmd, "QUIT") == 0) {
      Serial.println("Disconnect requested");
      tcpShouldDisconnect = true;

    } else if (strcmp(cmd, "status") == 0) {
      Serial.println("Dummy status command");

    } else if (strcmp(cmd, "motor") == 0) {
      char *szMotorNumber = strtok(NULL, ",");
      char *szMotorSpeed = strtok(NULL, ",");
      int motorNumber = atoi(szMotorNumber);
      int motorSpeed = atoi(szMotorSpeed);

      if (!(motorNumber >= 0 && motorNumber < kNumberOfMotors)) {
        motorNumber = 0;
        Serial.println("Bad motor number requested");
      }

      motor[motorNumber].dutyCycle = convertSpeedToPwmDutyCycle(motorSpeed);

      /*Serial.print("Motor ");
      Serial.print(motorNumber);
      Serial.print(" duty_cycle ");
      Serial.print(duty_cycle);
      Serial.println(" requested");*/

    } else if (strcmp(cmd, "full speed") == 0) {
      fullSpeedAllMotors();
      Serial.println("Setting all motors to full speed.");

    } else if (strcmp(cmd, "all stop") == 0) {
      shutdownAllMotors();
      Serial.println("Stopping all motors");

    } else {
      Serial.println("User gave an unrecognized command.");
    }
  }
}
/*** END command handling functions ***/

/*** BEGIN watchdog  and shutdown function  ***/

//  kShutdownTimeoutMillis and timestampOfLastCommand establish a timeout 
//  for motor operations in case connections break and we don't want the 
//  motors to run forever (or at least until the batteries run out)

void loopShutdownTimeoutWatchdog() {
  if (millis() - timestampOfLastCommand > kShutdownTimeoutMillis) {
    Serial.println("Shutting down because of watchdog");
    shutdownAllMotors();
    resetShutdownTimeoutWatchdog();
  }
}

void setupShutdownTimeoutWatchdog() {
  resetShutdownTimeoutWatchdog();
}

void resetShutdownTimeoutWatchdog() {
  timestampOfLastCommand = millis();
  Serial.println("Shutdown timeout watchdog reset");
}

/*** BEGIN watchdog  and shutdown function  ***/
