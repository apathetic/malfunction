// ASCII ➤ terser --compress --mangle --toplevel --mangle-props -- LL.js
var rand = Math.random;
var nRows = 30, nCols = 60;
var iFPS = 18;
var chars = "  ``^^''\"\"*+-~=rcvunoeaszmwxgqypjt&dfhkb?27TYFPV3456890%$UOZRBNXWMQHGAKESDCJLI1li;:\\\\\\/////][)(}{|!!..,,__";
var solidChars = "3489ABDEGHKMNRSWXZ";
// -------------------------
var empty = fill(" ");
var random = fill("#");
var solidRandom = fill("@");
var ll = ["                                                            ", "                                                            ", "                                                            ", "                  `/sdNMMMMNdo:          :sdNMMMMNms/`      ", "                `yNMMMMMNs-  `.`      `oNMMMMMMy:. `.`      ", "               :NMMMMMMh`.sdMMMNdo`  .dMMMMMMm-`+dNMMMms-   ", "              .NMMMMMMM`.ydMMMMMMMm``dMMMMMMM/`sdNMMMMMMM-  ", "              sMMMMMMMM    .mMMMMMM+/MMMMMMMM:   .dMMMMMMh  ", "              hMMMMMMMM    `mMMMMMM+/MMMMMMMM:   `hMMMMMMh  ", "              hMMMMMMMM   /NMMMMMMM:/MMMMMMMM:  -mMMMMMMMs  ", "              hMMMMMMMM `yMMMMMMMMy /MMMMMMMM: oMMMMMMMMd`  ", "              hMMMMMMMM:mMMMMMMMMo  /MMMMMMMM+dMMMMMMMMy`   ", "              hMMMMMMMMMMMMMMMMm-   /MMMMMMMMMMMMMMMMN/     ", "              hMMMMMMMMMMMMMMMs`    /MMMMMMMMMMMMMMMh.      ", "              hMMMMMMMMMMMMMN:      /MMMMMMMMMMMMMN+        ", "              hMMMMMMMMMMMMh`       /MMMMMMMMMMMMm-         ", "              hMMMMMMMMMMM+         /MMMMMMMMMMMs`          ", "              hMMMMMMMMMd.          /MMMMMMMMMN:            ", "              hMMMMMMMMs            /MMMMMMMMh`             ", "           `` hMMMMMMMM           ` /MMMMMMMM:              ", "          -d: hMMMMMMMM         .d: /MMMMMMMM:              ", "         +NM: hMMMMMMMM        +NM: /MMMMMMMM:              ", "       .hMMM: hMMMMMMMM`     .hMMMs /MMMMMMMMy`             ", "      /NMMMM+ oMMMMMMMMd:.`.sNMMMMm``NMMMMMMMMNhyyyyyyy+    ", "    `yMMMMMMN.`mMMMMMMMMMMMMMMMMMMMy /MMMMMMMMMMMMMMMMMh    ", "   :NMMMMMMMMo -mMMMMMMMMMMMMMMMMMMh` :mMMMMMMMMMMMMMMMh    ", " `sMMMMMMMMN:   `oNMMMMMMMMMMMMMMy-     /mMMMMMMMMMMMMMh    ", " shhhhhhhhy`      `:sdMMMMMMMmy/`         `/oshhhhhhhhho    ", "                                                            ", "                                                            ", "                                                            "];

// higher pow is "faster" transition
var timeLine = [
  { dur:3.0, fn:fader, arg:{ from: random,     to: ll, pow:0.2 }},
  { dur:3.0, fn:fader, arg:{ from: ll,         to: empty,       pow:0.4 }},
  { dur:3.0, fn:fader, arg:{ from: empty,      to: solidRandom, pow:1 }},
  { dur:3.0, fn:fader, arg:{ from: solidRandom,to: ll,          pow:0.6 }},
  { dur:3.0, fn:fader, arg:{ from: ll,         to: random,      pow:0.8 }},
];

var startDate = new Date();
var iShiftPhase = 0;
var nShift = 20;

function fill(char) { return new Array(nRows).fill(char.repeat(nCols), 0, nRows); }

function thread() {
  var nTime = (new Date() - startDate) / 1000; // Time since start
  var nTimeLineTime = 0;
  for (var i = 0; i < timeLine.length; i++) {
    var segment = timeLine[i];
    if (nTime < nTimeLineTime + segment.dur) {
      var iProgress = (nTime - nTimeLineTime) / segment.dur; // 0-1
      segment.fn(iProgress, segment.arg);
      // Only execute one (the first) event.
      setTimeout(thread, 1000/iFPS);
      // requestAnimationFrame(thread);
      return;
    } else {
      // Calculate the time it would have taken to reach the events end.
      nTimeLineTime += segment.dur;
    }
  }
}

function shiftFader() {
  return nShift * rand() * rand() * rand() * rand() * rand();
}

function fader(iProgress, aArgs) {
  var sContents = "";
  var nFader = Math.pow((1 - Math.cos(iProgress * Math.PI)) / 2, aArgs.pow); // 0-1 sine
  var iShiftFader = shiftFader();
  iShiftPhase += shiftFader();
  for (var line = 0; line < nRows; line++) {
    nShift = iShiftFader * Math.cos(Math.PI * 2 * line / nRows + iShiftPhase);
    for (var row = 0; row < nCols; row++) {
      var nShiftRow = (row + nCols + nShift) % nCols;
      var nCharFrom = getChar(aArgs.from, line, nShiftRow);
      var nCharTo   = getChar(aArgs.to, line, nShiftRow);
      var nChar     = nCharFrom + (nCharTo - nCharFrom) * nFader;
      while (nChar < 0) nChar += chars.length;
      sContents += chars.charAt(nChar % chars.length);
    }
    sContents += "<br />";
  }
  document.body.innerHTML = "<pre>" + sContents + "</pre>";
}

function getChar(asSourceImage, line, row) {
  var sChar = asSourceImage[line].charAt(row);
  switch (sChar) {
    case "#": // Random
      sChar = chars.charAt(Math.floor(rand() * chars.length));
      break;
    case "@": // Random solid char
      sChar = solidChars.charAt(Math.floor(rand() * solidChars.length));
      break;
  }
  var nChar = (chars.indexOf(sChar) + chars.lastIndexOf(sChar)) / 2;
  if (rand()<0.05) nChar += rand() * 5 - 2.5;
  else nChar += rand() - 0.5;
  return nChar;
}


// window.onload = thread;
// window._ = thread;
thread();
