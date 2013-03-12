/*
 * frontend.js
 *
 * Runs the frontend of the motor interface.
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

$(document).bind("pageinit", function() {

  // Sends the full speed command via AJAX
  function fullSpeed() {
    console.log("Sending full speed command");
    $.ajax({
      type: "PUT",
      url: "/full-speed"
    });
  }

  // Sends the all stop command via AJAX
  function allStop() {
    console.log("Sending all stop command");
    $.ajax({
      type: "PUT",
      url: "/all-stop"
    });
  }

  // Set the motor speed via AJAX
  function motor(motor_number, speed) {
    console.log("Setting motor " + motor_number + "  to speed " + speed);
    $.ajax({
      type: "PUT",
      url: "/motor?motor_number=" + motor_number + "&speed=" + speed
    });
  }

  // When the start all motors button is pressed, send the full speed 
  // request and update the position on all the buttons.
  $("#start-all-motors-button").on("click", function() {
    fullSpeed();
    $("[data-motor-speed='99']").attr("checked", "checked").checkboxradio("refresh");
    $("[data-motor-speed='0']").removeAttr("checked").checkboxradio("refresh");

    $("[data-motor-speed='19']").removeAttr("checked").checkboxradio("refresh");
    $("[data-motor-speed='59']").removeAttr("checked").checkboxradio("refresh");
  });

  // When the stop all motors button is pressed, send the all stop 
  // request and update the position on all the buttons.
  $("#stop-all-motors-button").on("click", function() {
    allStop();
    $("[data-motor-speed='0']").attr("checked", "checked").checkboxradio("refresh");
    $("[data-motor-speed='99']").removeAttr("checked").checkboxradio("refresh");

    $("[data-motor-speed='19']").removeAttr("checked").checkboxradio("refresh");
    $("[data-motor-speed='59']").removeAttr("checked").checkboxradio("refresh");
  });



  // All radio buttons on the interface are for setting the speed on individual
  // motors. Each button has attributes data-motor-number and data-motor-speed
  // that can be checked to find the speed and motor it should control, that 
  // way one function can handle all radio button click events.

  $("[type=radio]").on("click", function() {
    var motor_number = $(this).attr("data-motor-number"),
        speed = $(this).attr("data-motor-speed");
    motor(parseInt(motor_number), parseInt(speed));
  });
});
