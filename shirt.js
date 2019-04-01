const fs = require('fs');
let kCode = "";

let sleeveWidth = 6;
let bodyWidth = 24;

let sleeveHeight = 50;
let bodyHeight = 40;
let shoulderHeight = 26;

let carriers = ["1", "2", "3"];
let nylonYarn = "4";

/*
Operation:

Knits a small shirt-like shape using three carriers.
*/

knit();

function knit(){

	let totalHeight = Math.max(sleeveHeight, bodyHeight);

	let sleeve0Min = 2;
	let sleeve0Max = sleeve0Min + sleeveWidth;

	let bodyMin = sleeve0Max + 2;
	let bodyMax = bodyMin + bodyWidth;

	let sleeve1Min = bodyMax + 2;
	let sleeve1Max = sleeve1Min + sleeveWidth;

	kCode += setup();


	for (var r = 0; r < totalHeight; r++){
		if ((totalHeight - r) - sleeveHeight == 0){
			//cast on both sleeves
			kCode += castOn(carriers[0], sleeve0Min, sleeve0Max, sleeve1Max+1);
			kCode += castOn(carriers[1], sleeve1Min, sleeve1Max, sleeve1Max+1);
		}
		if ((totalHeight - r) - sleeveHeight == 0){
			//cast on body
			kCode += castOn(carriers[2], bodyMin, bodyMax, sleeve1Max+1);
		}
		//alternate front bed - direction and back bed + direction
		if (r % 2 == 0) {
			for (let n = sleeve1Max; n >= sleeve0Min; --n) {
				//knit on alternate needles
				if (n % 2 == 0){
					//knit the sleeves and body if/when called for
					if (n <= sleeve0Max){
						if ((totalHeight - r) - sleeveHeight <= 0){
							kCode += ("knit - f" + n + " " + carriers[0] + "\n");
						}
					} else if (n >= bodyMin && n <= bodyMax){
						if ((totalHeight - r) - bodyHeight <= 0){
							kCode += ("knit - f" + n + " " + carriers[2] + "\n");
						}
					} else if (n >= sleeve1Min && n <= sleeve1Max){
						if ((totalHeight - r) - sleeveHeight <= 0){
							kCode += ("knit - f" + n + " " + carriers[1] + "\n");
						}
					}
				}
			}
		} else {
			for (let n = sleeve0Min; n <= sleeve1Max; ++n) {
				if (n % 2 == 0){
					if (n <= sleeve0Max){
						if ((totalHeight - r) - sleeveHeight <= 0){
							kCode += ("knit + b" + n + " " + carriers[0] + "\n");
						}
					} else if (n >= bodyMin && n <= bodyMax){
						if ((totalHeight - r) - bodyHeight <= 0){
							kCode += ("knit + b" + n + " " + carriers[2] + "\n");
						}
					} else if (n >= sleeve1Min && n <= sleeve1Max){
						if ((totalHeight - r) - sleeveHeight <= 0){
							kCode += ("knit + b" + n + " " + carriers[1] + "\n");
						}
					}
				}
			}
		}

	}


	//transfer join left sleeve to body
	kCode += rack([sleeve0Max, sleeve0Max - 2], "f", "+");
	kCode += rack([sleeve0Max, sleeve0Max - 2], "b", "+");

	//transfer join right sleeve to body
	kCode += rack([sleeve1Min, sleeve1Min + 2], "f", "-");
	kCode += rack([sleeve1Min, sleeve1Min + 2], "b", "-");

	//keep only the right sleeve in action
	kCode += ("outhook " + carriers[0] + "\n");
	kCode += ("outhook " + carriers[2] + "\n");

	let shoulderMin = sleeve0Min;
	let shoulderMax = sleeve1Max;

	//knit the shoulders so they decrease in width towards the neck
	for (var r = 0; r < shoulderHeight; r++){

		//every 4 rows, decrease the width
		if (r % 4 == 0 && r > 0 && shoulderMax >= 3){
			//transfer needles to a new position on the front bed
			let lastFourFrontNeedles = [...Array(4)].map((_, i) => shoulderMax - i * 2);
			kCode += rack(lastFourFrontNeedles, "f", "-");
			let firstFourFrontNeedles = [...Array(4)].map((_, i) => shoulderMin + i * 2);
			kCode += rack(firstFourFrontNeedles, "f", "+");

			//transfer needles to a new position on the back bed
			let lastFourBackNeedles = [...Array(4)].map((_, i) => shoulderMax - i * 2);
			kCode += rack(lastFourBackNeedles, "b", "-");
			let firstFourBackNeedles = [...Array(4)].map((_, i) => shoulderMin + i * 2);
			kCode += rack(firstFourBackNeedles, "b", "+");

			//decrease the width
			shoulderMax = shoulderMax - 2;
			shoulderMin = shoulderMin + 2;

		}

		//knitting the shoulders using thread from the rightmost sleeve, so the thread is continuous
		if (r % 2 == 0){
			for (let n = shoulderMax; n >= shoulderMin; --n) {
				if (n % 2 === 0){
					kCode += ("knit - f" + n + " " + carriers[1] + "\n");
				}
			}
		} else {
			for (let n = shoulderMin; n <= shoulderMax; ++n) {
				if (n % 2 === 0){
					kCode += ("knit + b" + n + " " + carriers[1] + "\n");
				}
			}
		}
	}

	//bind off stitches on front bed
	for (let n = shoulderMax; n >= (shoulderMin + 1); --n) {
		if (n % 2 === 0){
			kCode += ("knit - f" + n + " " + carriers[1] + "\n");
			kCode += rack([n], "f", "-");
		}

	}

	//transfer leftmost stictch on front bed to backbed
	kCode += ("knit - f" + (shoulderMin) + " " + carriers[1] + "\n");
	kCode += ("xfer f" + shoulderMin + " b" + shoulderMin + "\n");

	//bind off stitches on back bed
	for (let n = shoulderMin; n <= (shoulderMax - 1); ++n) {
		if (n % 2 === 0){
			kCode += ("knit + b" + n + " " + carriers[1] + "\n");
			kCode += rack([n], "b", "+");
		}

	}

	//knit last two stitches together to form a tail that can be unravelled carefully and knotted off
	for (let r = 0; r <= 8; r++){
		if (r % 2 == 0){
			kCode += ("knit + b" + (shoulderMax - 1) + " " + carriers[1] + "\n");
			kCode += ("knit + b" + shoulderMax + " " + carriers[1] + "\n");
		} else {
			kCode += ("knit - b" + shoulderMax + " " + carriers[1] + "\n");
			kCode += ("knit - b" + (shoulderMax - 1) + " " + carriers[1] + "\n");
		}
	}


	kCode += ("outhook " + carriers[1] + "\n");



	writeFile(kCode);
}

function castOn(carrier, min, max, overallMax){
	let code = "";
	code += ("inhook " + carrier + "\n");

	//cast-on on the front bed first...
	for (let n = max; n >= min; --n) {
		if ((max-n) % 4 == 0) {
			code += ("tuck - f" + n + " " + carrier + "\n");
		}
	}
	for (let n = min; n <= max; ++n) {
		if ((max-n)%4 == 2) {
			code += ("tuck + f" + n + " " + carrier + "\n");
		}
	}

	//and then on the back bed
	for (let n = max; n >= min; --n) {
		if ((max-n) % 4 == 0) {
			code += ("tuck - b" + n + " " + carrier + "\n");
		}
	}
	for (let n = min; n <= max; ++n) {
		if ((max-n)%4 == 2) {
			code += ("tuck + b" + n + " " + carrier + "\n");
		}
	}

	code += ("releasehook " + carrier + "\n");

	//knit waste yarn rows
	code += knitPlainStitches(carrier, 12, min, max, false);
	code += ("outhook " + carrier + "\n");

	//knit with the nylon
	code += ("inhook " + nylonYarn + "\n");
	code += knitPlainStitches(nylonYarn, 4, min, max, true);
	code += ("outhook " + nylonYarn + "\n");

	code += ("inhook " + carrier + "\n");
	code += ("miss - f" + overallMax + " " + carrier + "\n");


	//use tucks again to reintroduce the carrier yarn and reduce risk of unravel
	for (let n = max; n >= min; --n) {
		if ((max-n) % 4 == 0) {
			code += ("tuck - f" + n + " " + carrier + "\n");
		}
	}
	for (let n = min; n <= max; ++n) {
		if ((max-n)%4 == 2) {
			code += ("tuck + f" + n + " " + carrier + "\n");
		}
	}

	//and then on the back bed
	for (let n = max; n >= min; --n) {
		if ((max-n) % 4 == 0) {
			code += ("tuck - b" + n + " " + carrier + "\n");
		}
	}
	for (let n = min; n <= max; ++n) {
		if ((max-n)%4 == 2) {
			code += ("tuck + b" + n + " " + carrier + "\n");
		}
	}
	code += ("releasehook " + carrier + "\n");

	return code;

}

function knitPlainStitches(carrier, rows, min, max, doRelease){
	let code = "";
	//knit some rows with wasteYarn;
	for (var i = 0; i < rows; i++){
		if (i % 2 == 0) {
			for (let n = max; n >= min; --n) {
				//remember we're knitting on every other needle
				if (n % 2 == 0){
					code += ("knit - f" + n + " " + carrier + "\n");
				}
			}
		} else {
			for (let n = min; n <= max; ++n) {
				if (n % 2 == 0){
					code += ("knit + b" + n + " " + carrier + "\n");
				}
			}
		}

		if (doRelease && i === 0){
			code += ("releasehook " + carrier + "\n");
		}
	}
	return code;
}

//magic strings
function setup(){
	let code = "";
	code += (";!knitout-2" + "\n");
	code += (";;Carriers: 1 2 3 4 5 6 7 8 9 10" + "\n");
	return code;
}

//simple function to move a range of needles in a direction by transfering them to the opposing bed
function rack(needles, bed, direction, doRelease){
	let secondBed = bed === "f" ? "b" : "f";

	let code = "";

	if (bed === "f"){
		code += ("rack " + (direction === "+" ? "-1" : "1") + "\n");
	} else {
		code += ("rack " + (direction === "+" ? "1" : "-1") + "\n");
	}

	for (var n = 0; n < needles.length; n++){
		code += ("xfer " + bed + needles[n] + " "  + secondBed + (needles[n] + (direction == "+" ? 1 : -1)) + "\n");
	}

	if (bed === "f"){
		code += ("rack " + (direction === "+" ? "1" : "-1") + "\n");
	} else {
		code += ("rack " + (direction === "+" ? "-1" : "1") + "\n");
	}

	for (var n = 0; n < needles.length; n++){
		code += ("xfer "  + secondBed + (needles[n] + (direction == "+" ? 1 : -1)) + " " + bed + (needles[n] + (direction == "+" ? 2 : -2)) + "\n");
	}

	code += ("rack 0" + "\n");

	return code;
}


function writeFile(code){
	//write to file
	fs.writeFile("./../knitout-backend-swg/examples/in/shirt.knitout", code, function(err) {
	    if(err) {
	        return console.log(err);
	    }

	    console.log("The file was saved!");
	}); 
}