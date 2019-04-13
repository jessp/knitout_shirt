const fs = require('fs');
let kCode = "";

let sleeveWidth = 7;
let bodyWidth = 25;

let sleeveHeight = 50;
let bodyHeight = 40;
let shoulderHeight = 26;

let carrier = "1";
let nylonYarn = "4";

/*
Operation:

Knits a small shirt-like shape using one carrier.
*/

knit();

function knit(){

	let totalHeight = Math.max(sleeveHeight, bodyHeight);

	let sleeve0Min = 2;
	let sleeve0Max = sleeve0Min + sleeveWidth;

	let bodyMin = sleeve0Max + 3;
	let bodyMax = bodyMin + bodyWidth;

	let sleeve1Min = bodyMax + 3;
	let sleeve1Max = sleeve1Min + sleeveWidth;

	kCode += setup();

	kCode += knitSegment(carrier, sleeve0Min, sleeve0Max, sleeveHeight);

	kCode += knitSegment(carrier, bodyMin, bodyMax, bodyHeight);

	kCode += castOn(carrier, sleeve1Min, sleeve1Max, sleeve1Max+1);
	for (var r = 0; r < sleeveHeight; r++){
		if (r % 2 == 0){
			for (let n = sleeve1Max; n >= sleeve1Min; --n) {
				if (n % 2 === 0){
					kCode += ("knit - f" + n + " " + carrier + "\n");
				}
			}
		} else {
			for (let n = sleeve1Min; n <= sleeve1Max; ++n) {
				if (n % 2 === 1){
					kCode += ("knit + b" + n + " " + carrier + "\n");
				}
			}
		}
	}

	let shoulderMin = sleeve0Min;
	let shoulderMax = sleeve1Max;


	//knit the shoulders so they decrease in width towards the neck
	for (var r = 0; r < shoulderHeight; r++){

		//every 4 rows, decrease the width
		if (r % 4 == 0 && r > 0 && shoulderMax >= 3){
			//transfer needles to a new position on the front bed
			let lastFourFrontNeedles = [...Array(4)].map((_, i) => (shoulderMax - 1) - i * 2);
			kCode += rack(lastFourFrontNeedles, "f", "-");
			let firstFourFrontNeedles = [...Array(4)].map((_, i) => shoulderMin + i * 2);
			kCode += rack(firstFourFrontNeedles, "f", "+");

			//transfer needles to a new position on the back bed
			let lastFourBackNeedles = [...Array(4)].map((_, i) => shoulderMax - i * 2);
			kCode += rack(lastFourBackNeedles, "b", "-");
			let firstFourBackNeedles = [...Array(4)].map((_, i) => (shoulderMin + 1) + i * 2);
			kCode += rack(firstFourBackNeedles, "b", "+");

			//decrease the width
			shoulderMax = shoulderMax - 2;
			shoulderMin = shoulderMin + 2;

		}
		//knitting the shoulders using thread from the rightmost sleeve, so the thread is continuous
		if (r % 2 == 0){
			for (let n = shoulderMax; n >= shoulderMin; --n) {
				if (r < 2 && ((n >= bodyMax && n <= sleeve1Min) || (n >= sleeve0Max && n <= bodyMin))) {
					kCode += ("knit - " + (n % 2 === 0 ? "f" : "b") + n + " " + carrier + "\n");
				} else {
					if (n % 2 === 0){
						kCode += ("knit - f" + n + " " + carrier + "\n");
					}
				}
			}
		} else {
			for (let n = shoulderMin; n <= shoulderMax; ++n) {
				if (n % 2 === 1){
					kCode += ("knit + b" + n + " " + carrier + "\n");
				}
			}
		}
	}

	//bind off stitches on front bed
	for (let n = shoulderMax; n >= (shoulderMin + 1); --n) {
		if (n % 2 === 0){
			kCode += ("knit - f" + n + " " + carrier + "\n");
			kCode += rack([n], "f", "-");
		}

	}

	//transfer leftmost stictch on front bed to backbed
	kCode += ("knit - f" + (shoulderMin) + " " + carrier + "\n");
	kCode += ("rack -1" + "\n");
	kCode += ("xfer f" + shoulderMin + " b" + (shoulderMin + 1) + "\n");
	kCode += ("rack 0" + "\n");

	//bind off stitches on back bed
	for (let n = shoulderMin; n <= (shoulderMax - 1); ++n) {
		if (n % 2 === 1){
			kCode += ("knit + b" + n + " " + carrier + "\n");
			kCode += rack([n], "b", "+");
		}

	}

	//knit last two stitches together to form a tail that can be unravelled carefully and knotted off
	for (let r = 0; r <= 8; r++){
		if (r % 2 == 0){
			kCode += ("knit + b" + (shoulderMax - 1) + " " + carrier + "\n");
			kCode += ("knit + b" + shoulderMax + " " + carrier + "\n");
		} else {
			kCode += ("knit - b" + shoulderMax + " " + carrier + "\n");
			kCode += ("knit - b" + (shoulderMax - 1) + " " + carrier + "\n");
		}
	}


	kCode += ("outhook " + carrier + "\n");



	writeFile(kCode);
}

function knitSegment(carrier, min, max, height){
	let code = "";

	code += castOn(carrier, min, max, max+1);
	for (var r = 0; r < height; r++){
		if (r % 2 == 0){
			for (let n = max; n >= min; --n) {
				if (n % 2 === 0){
					code += ("knit - f" + n + " " + carrier + "\n");
				}
			}
		} else {
			for (let n = min; n <= max; ++n) {
				if (n % 2 === 1){
					code += ("knit + b" + n + " " + carrier + "\n");
				}
			}
		}
	}

	code += ("tuck - b" + (max - 2) + " " + carrier + "\n");
	code += ("miss - b" + (min + 2) + " "+ carrier + "\n");
	code += ("outhook " + carrier + "\n");

	return code;

}

function castOn(carrier, min, max, overallMax){
	let code = "";
	code += ("inhook " + carrier + "\n");

	//cast-on on the front bed first...
	for (let n = max; n >= min; --n) {
		if ((max-n) % 4 == 1) {
			code += ("tuck - f" + n + " " + carrier + "\n");
		}
	}
	for (let n = min; n <= max; ++n) {
		if ((max-n)%4 == 3) {
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
	code += ("miss - f" + overallMax + " " + nylonYarn + "\n");
	code += knitPlainStitches(nylonYarn, 4, min, max, true);
	code += ("outhook " + nylonYarn + "\n");

	code += ("inhook " + carrier + "\n");
	code += ("miss - f" + overallMax + " " + carrier + "\n");


	//use tucks again to reintroduce the carrier yarn and reduce risk of unravel
	for (let n = max; n >= min; --n) {
		if ((max-n) % 4 == 1) {
			code += ("knit - f" + n + " " + carrier + "\n");
		}
	}
	for (let n = min; n <= max; ++n) {
		if ((max-n)%4 == 3) {
			code += ("knit + f" + n + " " + carrier + "\n");
		}
	}

	//and then on the back bed
	for (let n = max; n >= min; --n) {
		if ((max-n) % 4 == 0) {
			code += ("knit - b" + n + " " + carrier + "\n");
		}
	}
	for (let n = min; n <= max; ++n) {
		if ((max-n)%4 == 2) {
			code += ("knit + b" + n + " " + carrier + "\n");
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
				if (n % 2 == 1){
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

	for (var n = 0; n < needles.length; n++){
		code += ("xfer " + bed + needles[n] + " "  + secondBed + (needles[n]) + "\n");
	}

	if (bed === "f"){
		code += ("rack " + (direction === "+" ? "2" : "-2") + "\n");
	} else {
		code += ("rack " + (direction === "+" ? "-2" : "2") + "\n");
	}

	for (var n = 0; n < needles.length; n++){
		code += ("xfer "  + secondBed + (needles[n]) + " " + bed + (needles[n] + (direction == "+" ? 2 : -2)) + "\n");
	}

	code += ("rack 0" + "\n");

	return code;
}


function writeFile(code){
	//write to file
	fs.writeFile("./../knitout-backend-swg/examples/in/one_carrier_shirt.knitout", code, function(err) {
	    if(err) {
	        return console.log(err);
	    }

	    console.log("The file was saved!");
	}); 
}