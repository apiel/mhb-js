const { execSync } = require('child_process');
const { appendFile } = require('fs');

function searchForDog() {
    try {
        const addr = 'FF:FF:FA:A0:28:E4'; // triangle
	// const addr = 'FC:58:FA:13:36:AA'; // losange
	const output = execSync(`sudo hcitool leinfo ${addr}`);
        // console.log('out', output.toString());
    } catch (error) {
        if (error.toString().includes('Could not create connection')) {
            console.log('dog is gone');
            appendFile('log/dog.txt', `${Date().toString()} dog is gone\n`, () => { });
        } else {
            console.log('aie aie aie, ble err:', error.toString());
        }
    }
}

//setInterval(searchForDog, 2*60*1000); // every min
